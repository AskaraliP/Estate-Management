from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import (
    Attendance,
    Estate,
    EstateOwnerProfile,
    LabourEstateRequest,
    LabourProfile,
    LabourWagePayment,
    Notification,
    Inventory,
    Production,
    TappingRecord,
)


class NotificationApiTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            username="notification-user",
            password="test-password",
        )
        self.other_user = user_model.objects.create_user(
            username="other-notification-user",
            password="test-password",
        )
        self.client.force_authenticate(user=self.user)

    def create_notification(self, user, title):
        return Notification.objects.create(
            user=user,
            notification_type="ORDER",
            title=title,
            message="Order update",
            target_url="/dashboard/orders",
        )

    def test_list_only_returns_notifications_for_current_user(self):
        own_notification = self.create_notification(
            self.user,
            "My update",
        )
        self.create_notification(self.other_user, "Private update")

        response = self.client.get("/api/notifications/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [item["id"] for item in response.data],
            [own_notification.pk],
        )

    def test_mark_read_updates_only_own_notification(self):
        notification = self.create_notification(self.user, "My update")
        other_notification = self.create_notification(
            self.other_user,
            "Private update",
        )

        response = self.client.post(
            f"/api/notifications/{other_notification.pk}/mark-read/"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        notification.refresh_from_db()
        other_notification.refresh_from_db()
        self.assertFalse(notification.is_read)
        self.assertFalse(other_notification.is_read)

        response = self.client.post(
            f"/api/notifications/{notification.pk}/mark-read/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)

    def test_mark_all_read_clears_unread_count(self):
        self.create_notification(self.user, "First update")
        self.create_notification(self.user, "Second update")
        other_notification = self.create_notification(
            self.other_user,
            "Private update",
        )

        response = self.client.post(
            "/api/notifications/mark-all-read/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        other_notification.refresh_from_db()
        self.assertFalse(other_notification.is_read)
        self.assertEqual(
            self.client.get(
                "/api/notifications/unread-count/"
            ).data["count"],
            0,
        )


class LabourWagePaymentApiTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.owner = user_model.objects.create_user(
            username="wage-owner",
            password="test-password",
        )
        EstateOwnerProfile.objects.create(user=self.owner)
        self.labour = user_model.objects.create_user(
            username="wage-worker",
            password="test-password",
        )
        self.estate = Estate.objects.create(
            name="Test Estate",
            owner=self.owner,
            location="Test location",
            total_area="5.00",
        )
        LabourProfile.objects.create(
            user=self.labour,
            estate=self.estate,
            daily_wage="100.00",
        )
        Attendance.objects.create(
            labour=self.labour,
            estate=self.estate,
            date="2026-10-17",
            status="PRESENT",
            recorded_by=self.owner,
        )
        self.client.force_authenticate(user=self.owner)

    def test_creating_wage_payment_returns_date_field_as_date(self):
        response = self.client.post(
            "/api/labour-wage-payments/",
            {
                "labour": self.labour.pk,
                "estate": self.estate.pk,
                "period_start": "2026-10-17",
                "period_end": "2026-10-17",
                "amount": "100.00",
                "payment_date": "2026-10-17",
                "payment_method": "CASH",
                "transaction_reference": "",
                "remarks": "",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["payment_date"], "2026-10-17")
        self.assertEqual(LabourWagePayment.objects.count(), 1)


class TappingRecordVerificationApiTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.owner = user_model.objects.create_user(
            username="harvest-owner",
            password="test-password",
        )
        EstateOwnerProfile.objects.create(user=self.owner)
        self.labour = user_model.objects.create_user(
            username="harvest-labour",
            password="test-password",
        )
        self.estate = Estate.objects.create(
            name="Harvest Estate",
            owner=self.owner,
            location="Test location",
            total_area="5.00",
        )
        self.record = TappingRecord.objects.create(
            labour=self.labour,
            estate=self.estate,
            category="LATEX",
            quantity="5.00",
            unit="LITRE",
        )
        self.client.force_authenticate(user=self.owner)

    def test_verification_credits_actual_quantity_above_submitted(self):
        response = self.client.post(
            f"/api/tapping-records/{self.record.pk}/verify/",
            {"verified_quantity": "6.25"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["verified_quantity"], "6.25")
        production = Production.objects.get(tapping_record=self.record)
        inventory = Inventory.objects.get(
            estate=self.estate,
            category="LATEX",
        )
        self.assertEqual(str(production.verified_quantity), "6.25")
        self.assertEqual(str(inventory.stock_quantity), "6.25")
        self.record.refresh_from_db()
        self.assertTrue(self.record.is_verified)

        records_response = self.client.get("/api/tapping-records/")
        self.assertEqual(records_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            str(records_response.data[0]["verified_quantity"]),
            "6.25",
        )

    def test_verification_rejects_non_positive_actual_quantity(self):
        response = self.client.post(
            f"/api/tapping-records/{self.record.pk}/verify/",
            {"verified_quantity": "0"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(self.record.is_verified)
        self.assertFalse(Production.objects.exists())
        self.assertFalse(Inventory.objects.exists())

# Create your tests here.


class LabourEstateRequestApiTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.owner = user_model.objects.create_user(
            username="request-owner",
            password="test-password",
        )
        EstateOwnerProfile.objects.create(user=self.owner)
        self.other_owner = user_model.objects.create_user(
            username="other-request-owner",
            password="test-password",
        )
        EstateOwnerProfile.objects.create(user=self.other_owner)
        self.labour = user_model.objects.create_user(
            username="request-labour",
            password="test-password",
        )
        LabourProfile.objects.create(
            user=self.labour,
            full_name="Request Labour",
            phone="9000000000",
        )
        self.estate = Estate.objects.create(
            name="Owner Estate",
            owner=self.owner,
            location="Test location",
            total_area="5.00",
        )
        self.other_estate = Estate.objects.create(
            name="Other Estate",
            owner=self.other_owner,
            location="Other location",
            total_area="3.00",
        )

    def test_owner_sees_only_requests_for_their_estates(self):
        own_request = LabourEstateRequest.objects.create(
            labour=self.labour,
            estate=self.estate,
        )
        LabourEstateRequest.objects.create(
            labour=self.labour,
            estate=self.other_estate,
        )
        self.client.force_authenticate(user=self.owner)

        response = self.client.get("/api/labour-estate-requests/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["id"] for item in response.data], [own_request.pk])
        self.assertEqual(response.data[0]["labour_full_name"], "Request Labour")
        self.assertEqual(response.data[0]["labour_phone"], "9000000000")

    def test_labour_can_submit_request_visible_to_owner(self):
        self.client.force_authenticate(user=self.labour)

        create_response = self.client.post(
            "/api/labour-estate-requests/",
            {"estate": self.estate.pk},
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.client.force_authenticate(user=self.owner)

        list_response = self.client.get("/api/labour-estate-requests/")

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(
            list_response.data[0]["id"],
            create_response.data["id"],
        )

    def test_owner_approval_assigns_labour_to_the_estate(self):
        request = LabourEstateRequest.objects.create(
            labour=self.labour,
            estate=self.estate,
        )
        self.client.force_authenticate(user=self.owner)

        response = self.client.post(
            f"/api/labour-estate-requests/{request.pk}/approve/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["estate"], self.estate.name)
        self.labour.labourprofile.refresh_from_db()
        request.refresh_from_db()
        self.assertEqual(
            self.labour.labourprofile.estate_id,
            self.estate.pk,
        )
        self.assertEqual(request.status, "APPROVED")

        self.client.force_authenticate(user=self.labour)
        role_response = self.client.get("/api/user-role/")
        self.assertEqual(role_response.status_code, status.HTTP_200_OK)
        self.assertEqual(role_response.data["estate_id"], self.estate.pk)

    def test_rejected_request_can_be_submitted_again(self):
        previous_request = LabourEstateRequest.objects.create(
            labour=self.labour,
            estate=self.estate,
            status="REJECTED",
        )
        self.client.force_authenticate(user=self.labour)

        response = self.client.post(
            "/api/labour-estate-requests/",
            {"estate": self.estate.pk},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["id"], previous_request.pk)
        self.assertEqual(response.data["status"], "PENDING")
        self.assertIsNone(response.data["responded_at"])
