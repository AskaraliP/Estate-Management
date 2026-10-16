
import csv
import uuid
from decimal import Decimal, InvalidOperation
from django.db import transaction

import razorpay

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Sum
from django.http import HttpResponse
from django.utils import timezone
from django.utils.dateparse import parse_date

from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Estate,
    EstateOwnerProfile,
    LabourProfile,
    LabourEstateRequest,
    Attendance,
    TappingRecord,
    Production,
    Inventory,
    Expense,
    BuyerProfile,
    PurchaseOrder,
    Invoice,
    Payment,
    LabourWagePayment,
)

from .serializers import (
    EstateSerializer,
    EstateOwnerProfileSerializer,
    LabourProfileSerializer,
    LabourEstateRequestSerializer,
    AttendanceSerializer,
    TappingRecordSerializer,
    ProductionSerializer,
    InventorySerializer,
    ExpenseSerializer,
    BuyerProfileSerializer,
    PurchaseOrderSerializer,
    InvoiceSerializer,
    PaymentSerializer,
    LabourWagePaymentSerializer,
)

User = get_user_model()


# =========================================================
# ROLE HELPERS
# =========================================================

def is_admin(user):
    return bool(
        user
        and user.is_authenticated
        and (user.is_staff or user.is_superuser)
    )


def is_estate_owner(user):
    return bool(
        user
        and user.is_authenticated
        and EstateOwnerProfile.objects.filter(user=user).exists()
    )


def is_labour(user):
    return bool(
        user
        and user.is_authenticated
        and LabourProfile.objects.filter(user=user).exists()
    )


def is_buyer(user):
    return bool(
        user
        and user.is_authenticated
        and BuyerProfile.objects.filter(user=user).exists()
    )


def get_owner_estates(user):
    return Estate.objects.filter(owner=user)


def get_labour_profile(user):
    return (
        LabourProfile.objects
        .select_related("estate", "user")
        .filter(user=user)
        .first()
    )


def get_current_estate(user):
    profile = get_labour_profile(user)
    if profile:
        return profile.estate
    return None


def user_can_access_estate(user, estate):
    if not estate:
        return False

    if is_admin(user):
        return True

    if is_estate_owner(user):
        return estate.owner_id == user.id

    profile = get_labour_profile(user)
    return bool(profile and profile.estate_id == estate.id)


def require_admin_or_owner(user):
    if not (is_admin(user) or is_estate_owner(user)):
        raise PermissionDenied(
            "Only Admin or Estate Owner can perform this action."
        )


def require_estate_access(user, estate):
    if not user_can_access_estate(user, estate):
        raise PermissionDenied(
            "You do not have permission to access this estate."
        )


def get_visible_estates(user):
    if is_admin(user):
        return Estate.objects.all()

    if is_estate_owner(user):
        return get_owner_estates(user)

    profile = get_labour_profile(user)
    if profile and profile.estate_id:
        return Estate.objects.filter(pk=profile.estate_id)

    return Estate.objects.none()


# =========================================================
# ESTATE OWNER PROFILE
# =========================================================

class EstateOwnerProfileViewSet(viewsets.ModelViewSet):
    serializer_class = EstateOwnerProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if is_admin(user):
            return EstateOwnerProfile.objects.select_related(
                "user"
            ).all().order_by("-id")

        return EstateOwnerProfile.objects.filter(
            user=user
        ).select_related("user")

    def perform_create(self, serializer):
        user = self.request.user

        if is_admin(user):
            serializer.save()
            return

        if EstateOwnerProfile.objects.filter(user=user).exists():
            raise ValidationError(
                "An estate owner profile already exists."
            )

        serializer.save(user=user)

    def perform_update(self, serializer):
        profile = self.get_object()
        user = self.request.user

        if not is_admin(user) and profile.user_id != user.id:
            raise PermissionDenied(
                "You can only update your own profile."
            )

        serializer.save()


# =========================================================
# ESTATES
# =========================================================

class EstateViewSet(viewsets.ModelViewSet):
    serializer_class = EstateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if is_admin(user):
            return Estate.objects.select_related(
                "owner"
            ).all().order_by("-id")

        if is_estate_owner(user):
            return get_owner_estates(user).select_related(
                "owner"
            ).order_by("-id")

        if is_buyer(user):
            return Estate.objects.filter(
                is_active=True
            ).select_related("owner").order_by("-id")

        profile = get_labour_profile(user)

        if profile and profile.estate_id:
            return Estate.objects.filter(
                pk=profile.estate_id
            ).select_related("owner")

        return Estate.objects.filter(
            is_active=True
        ).select_related("owner").order_by("-id")

    def perform_create(self, serializer):
        user = self.request.user

        if is_admin(user):
            serializer.save()
            return

        if is_estate_owner(user):
            serializer.save(owner=user)
            return

        raise PermissionDenied(
            "Only Admin or Estate Owner can create estates."
        )

    def perform_update(self, serializer):
        user = self.request.user
        estate = self.get_object()

        if is_admin(user):
            serializer.save()
            return

        if is_estate_owner(user) and estate.owner_id == user.id:
            serializer.save(owner=user)
            return

        raise PermissionDenied(
            "You cannot update this estate."
        )

    def perform_destroy(self, instance):
        user = self.request.user

        if is_admin(user):
            instance.delete()
            return

        if is_estate_owner(user) and instance.owner_id == user.id:
            instance.delete()
            return

        raise PermissionDenied(
            "You cannot delete this estate."
        )


# =========================================================
# LABOUR PROFILES
# =========================================================

class LabourProfileViewSet(viewsets.ModelViewSet):
    serializer_class = LabourProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if is_admin(user):
            return LabourProfile.objects.select_related(
                "user", "estate"
            ).all().order_by("-id")

        if is_estate_owner(user):
            return LabourProfile.objects.filter(
                estate__owner=user
            ).select_related("user", "estate").order_by("-id")

        return LabourProfile.objects.filter(
            user=user
        ).select_related("user", "estate")

    def perform_create(self, serializer):
        user = self.request.user

        if is_admin(user):
            serializer.save()
            return

        if not is_estate_owner(user):
            raise PermissionDenied(
                "Only Admin or Estate Owner can create labour profiles."
            )

        estate_id = self.request.data.get("estate")

        estate = get_owner_estates(user).filter(
            pk=estate_id
        ).first()

        if not estate:
            raise ValidationError({
                "estate": "Select an estate that you own."
            })

        if estate.labours.count() >= estate.max_labour:
            raise ValidationError({
                "estate": "The labour capacity for this estate is full."
            })

        serializer.save(estate=estate)

    def perform_update(self, serializer):
        user = self.request.user
        profile = self.get_object()

        if is_admin(user):
            serializer.save()
            return

        if is_estate_owner(user):
            if not profile.estate or profile.estate.owner_id != user.id:
                raise PermissionDenied(
                    "You can only update labour assigned to your estate."
                )

            serializer.save(estate=profile.estate)
            return

        if is_labour(user) and profile.user_id == user.id:
            # Labour cannot change their own assigned estate or wage.
            serializer.save(
                user=user,
                estate=profile.estate,
                daily_wage=profile.daily_wage,
            )
            return

        raise PermissionDenied(
            "You cannot update this labour profile."
        )

    def perform_destroy(self, instance):
        user = self.request.user

        if is_admin(user):
            instance.delete()
            return

        if (
            is_estate_owner(user)
            and instance.estate
            and instance.estate.owner_id == user.id
        ):
            instance.delete()
            return

        raise PermissionDenied(
            "You cannot delete this labour profile."
        )


# =========================================================
# LABOUR ESTATE REQUESTS
# =========================================================

class LabourEstateRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LabourEstateRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if is_admin(user):
            return LabourEstateRequest.objects.select_related(
                "labour", "estate"
            ).all().order_by("-id")

        if is_estate_owner(user):
            return LabourEstateRequest.objects.filter(
                estate__owner=user
            ).select_related("labour", "estate").order_by("-id")

        if is_labour(user):
            return LabourEstateRequest.objects.filter(
                labour=user
            ).select_related("labour", "estate").order_by("-id")

        return LabourEstateRequest.objects.none()

    def perform_create(self, serializer):
        user = self.request.user

        if not is_labour(user):
            raise PermissionDenied(
                "Only labour users can request estate assignment."
            )

        profile = get_labour_profile(user)

        if not profile:
            raise ValidationError("Labour profile not found.")

        if profile.estate_id:
            raise ValidationError(
                "You are already assigned to an estate."
            )

        estate = serializer.validated_data.get("estate")

        if not estate or not estate.is_active:
            raise ValidationError({
                "estate": "Select an active estate."
            })

        if estate.labours.count() >= estate.max_labour:
            raise ValidationError({
                "estate": "No labour slots are available."
            })

        pending = LabourEstateRequest.objects.filter(
            labour=user,
            estate=estate,
            status="PENDING",
        ).exists()

        if pending:
            raise ValidationError(
                "You already have a pending request for this estate."
            )

        serializer.save(labour=user)

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def approve(self, request, pk=None):
        require_admin_or_owner(request.user)

        request_obj = self.get_object()

        if request_obj.status != "PENDING":
            return Response(
                {"detail": "This request has already been processed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        estate = request_obj.estate

        if not is_admin(request.user) and estate.owner_id != request.user.id:
            raise PermissionDenied(
                "You cannot approve requests for another owner's estate."
            )

        estate = Estate.objects.select_for_update().get(pk=estate.pk)

        profile = LabourProfile.objects.select_for_update().filter(
            user=request_obj.labour
        ).first()

        if not profile:
            raise ValidationError(
                "The labour profile does not exist."
            )

        if profile.estate_id:
            raise ValidationError(
                "This labourer is already assigned to an estate."
            )

        if estate.labours.count() >= estate.max_labour:
            raise ValidationError(
                "The estate has reached its labour capacity."
            )

        profile.estate = estate
        profile.save(update_fields=["estate"])

        request_obj.status = "APPROVED"
        request_obj.responded_at = timezone.now()
        request_obj.save(update_fields=["status", "responded_at"])

        LabourEstateRequest.objects.filter(
            labour=request_obj.labour,
            status="PENDING",
        ).exclude(pk=request_obj.pk).update(
            status="REJECTED",
            responded_at=timezone.now(),
        )

        return Response({
            "message": "Labour request approved.",
            "estate": estate.name,
        })

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        require_admin_or_owner(request.user)

        request_obj = self.get_object()

        if request_obj.status != "PENDING":
            return Response(
                {"detail": "This request has already been processed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            not is_admin(request.user)
            and request_obj.estate.owner_id != request.user.id
        ):
            raise PermissionDenied(
                "You cannot reject requests for another owner's estate."
            )

        request_obj.status = "REJECTED"
        request_obj.responded_at = timezone.now()
        request_obj.save(update_fields=["status", "responded_at"])

        return Response({"message": "Labour request rejected."})


# =========================================================
# ATTENDANCE
# =========================================================

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        base = Attendance.objects.select_related(
            "labour", "estate"
        )

        if is_admin(user):
            return base.all().order_by("-date", "-id")

        if is_estate_owner(user):
            return base.filter(
                estate__owner=user
            ).order_by("-date", "-id")

        if is_labour(user):
            return base.filter(
                labour=user
            ).order_by("-date", "-id")

        return Attendance.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        require_admin_or_owner(user)

        labour_id = serializer.validated_data.get("labour")
        estate = serializer.validated_data.get("estate")

        if not labour_id or not estate:
            raise ValidationError(
                "Both labour and estate are required."
            )

        require_estate_access(user, estate)

        assigned = LabourProfile.objects.filter(
            user=labour_id,
            estate=estate,
        ).exists()

        if not assigned:
            raise ValidationError({
                "labour": "This labourer is not assigned to the selected estate."
            })

        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        require_admin_or_owner(user)

        attendance = self.get_object()
        estate = serializer.validated_data.get(
            "estate", attendance.estate
        )
        labour = serializer.validated_data.get(
            "labour", attendance.labour
        )

        require_estate_access(user, estate)

        if not LabourProfile.objects.filter(
            user=labour,
            estate=estate,
        ).exists():
            raise ValidationError(
                "The labourer must be assigned to the selected estate."
            )

        serializer.save()

    def perform_destroy(self, instance):
        require_admin_or_owner(self.request.user)
        require_estate_access(self.request.user, instance.estate)
        instance.delete()


# =========================================================
# TAPPING / HARVEST RECORDS
# =========================================================

class TappingRecordViewSet(viewsets.ModelViewSet):
    serializer_class = TappingRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        base = TappingRecord.objects.select_related(
            "labour", "estate"
        )

        if is_admin(user):
            return base.all().order_by("-date", "-id")

        if is_estate_owner(user):
            return base.filter(
                estate__owner=user
            ).order_by("-date", "-id")

        if is_labour(user):
            return base.filter(
                labour=user
            ).order_by("-date", "-id")

        return TappingRecord.objects.none()

    def perform_create(self, serializer):
        user = self.request.user

        if is_labour(user):
            profile = get_labour_profile(user)

            if not profile or not profile.estate_id:
                raise ValidationError(
                    "You must be assigned to an estate before submitting harvest."
                )

            serializer.save(
                labour=user,
                estate=profile.estate,
                is_verified=False,
            )
            return

        if is_admin(user) or is_estate_owner(user):
            labour = serializer.validated_data.get("labour")
            estate = serializer.validated_data.get("estate")

            if not labour or not estate:
                raise ValidationError(
                    "Select a labourer and estate."
                )

            require_estate_access(user, estate)

            if not LabourProfile.objects.filter(
                user=labour,
                estate=estate,
            ).exists():
                raise ValidationError(
                    "The labourer is not assigned to this estate."
                )

            serializer.save(is_verified=False)
            return

        raise PermissionDenied(
            "You cannot submit harvest records."
        )

    def perform_update(self, serializer):
        record = self.get_object()
        user = self.request.user

        if record.is_verified:
            raise ValidationError(
                "Verified harvest records cannot be edited."
            )

        if is_labour(user):
            if record.labour_id != user.id:
                raise PermissionDenied(
                    "You can only edit your own harvest records."
                )
            serializer.save(
                labour=record.labour,
                estate=record.estate,
                is_verified=False,
            )
            return

        require_admin_or_owner(user)
        require_estate_access(user, record.estate)
        serializer.save(is_verified=False)

    def perform_destroy(self, instance):
        user = self.request.user

        if instance.is_verified:
            raise ValidationError(
                "Verified harvest records cannot be deleted."
            )

        if is_labour(user):
            if instance.labour_id != user.id:
                raise PermissionDenied(
                    "You can only delete your own harvest records."
                )
        else:
            require_admin_or_owner(user)
            require_estate_access(user, instance.estate)

        instance.delete()

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def verify(self, request, pk=None):
        return self._verify_and_credit(request)

    @action(detail=True, methods=["post"], url_path="credit-to-inventory")
    @transaction.atomic
    def credit_to_inventory(self, request, pk=None):
        return self._verify_and_credit(request)

    def _verify_and_credit(self, request):
        user = request.user
        require_admin_or_owner(user)

        record = self.get_object()

        if not record.estate_id:
            raise ValidationError(
                "This harvest record has no assigned estate."
            )

        require_estate_access(user, record.estate)

        if record.is_verified:
            return Response(
                {"detail": "This harvest has already been verified."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        quantity = record.quantity

        try:
            verified_quantity = Decimal(
                str(request.data.get("verified_quantity", quantity))
            )
            calculated_wage = Decimal(
                str(request.data.get("calculated_wage", "0"))
            )
        except (InvalidOperation, TypeError, ValueError):
            raise ValidationError(
                "Enter valid numeric values for quantity and wage."
            )

        if verified_quantity <= 0 or verified_quantity > quantity:
            raise ValidationError({
                "verified_quantity": (
                    "Verified quantity must be positive and cannot exceed "
                    "the submitted quantity."
                )
            })

        if calculated_wage < 0:
            raise ValidationError({
                "calculated_wage": "Wage cannot be negative."
            })

        inventory, _ = Inventory.objects.select_for_update().get_or_create(
            estate=record.estate,
            category=record.category,
            defaults={
                "stock_quantity": Decimal("0"),
                "unit": record.unit,
                "unit_price": Decimal("180.00"),
            },
        )

        inventory.stock_quantity += verified_quantity
        inventory.save(update_fields=["stock_quantity", "last_updated"])

        production = Production.objects.create(
            tapping_record=record,
            verified_by=user,
            verified_quantity=verified_quantity,
            calculated_wage=calculated_wage,
            verification_remarks=request.data.get(
                "verification_remarks", ""
            ),
        )

        record.is_verified = True
        record.save(update_fields=["is_verified"])

        return Response({
            "message": "Harvest verified and credited to inventory.",
            "production_id": production.pk,
            "verified_quantity": str(verified_quantity),
            "inventory_quantity": str(inventory.stock_quantity),
            "calculated_wage": str(calculated_wage),
        })


# =========================================================
# PRODUCTION
# =========================================================

class ProductionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        base = Production.objects.select_related(
            "tapping_record",
            "tapping_record__labour",
            "tapping_record__estate",
            "verified_by",
        )

        if is_admin(user):
            return base.all().order_by("-id")

        if is_estate_owner(user):
            return base.filter(
                tapping_record__estate__owner=user
            ).order_by("-id")

        if is_labour(user):
            return base.filter(
                tapping_record__labour=user
            ).order_by("-id")

        return Production.objects.none()


# =========================================================
# INVENTORY
# =========================================================

class InventoryViewSet(viewsets.ModelViewSet):
    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        base = Inventory.objects.select_related("estate")

        if is_admin(user):
            return base.all().order_by("-id")

        if is_estate_owner(user):
            return base.filter(
                estate__owner=user
            ).order_by("-id")

        if is_buyer(user):
            return base.filter(
                estate__is_active=True,
                stock_quantity__gt=0,
            ).order_by("-id")

        return Inventory.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        require_admin_or_owner(user)

        estate = serializer.validated_data.get("estate")
        require_estate_access(user, estate)

        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        require_admin_or_owner(user)

        inventory = self.get_object()
        estate = serializer.validated_data.get(
            "estate", inventory.estate
        )
        require_estate_access(user, estate)

        serializer.save()

    def perform_destroy(self, instance):
        require_admin_or_owner(self.request.user)
        require_estate_access(self.request.user, instance.estate)
        instance.delete()


# =========================================================
# EXPENSES
# =========================================================

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if is_admin(user):
            return Expense.objects.select_related(
                "estate", "recorded_by"
            ).all().order_by("-id")

        if is_estate_owner(user):
            return Expense.objects.filter(
                estate__owner=user
            ).select_related("estate", "recorded_by").order_by("-id")

        return Expense.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        require_admin_or_owner(user)

        estate = serializer.validated_data.get("estate")
        require_estate_access(user, estate)

        serializer.save(recorded_by=user)

    def perform_update(self, serializer):
        user = self.request.user
        require_admin_or_owner(user)

        expense = self.get_object()
        estate = serializer.validated_data.get(
            "estate", expense.estate
        )
        require_estate_access(user, estate)

        serializer.save(recorded_by=expense.recorded_by)

    def perform_destroy(self, instance):
        require_admin_or_owner(self.request.user)
        require_estate_access(self.request.user, instance.estate)
        instance.delete()


# =========================================================
# BUYER PROFILES
# =========================================================

class BuyerProfileViewSet(viewsets.ModelViewSet):
    serializer_class = BuyerProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if is_admin(user):
            return BuyerProfile.objects.select_related(
                "user"
            ).all().order_by("-id")

        if is_buyer(user):
            return BuyerProfile.objects.filter(
                user=user
            ).select_related("user")

        return BuyerProfile.objects.none()

    def perform_create(self, serializer):
        user = self.request.user

        if is_admin(user):
            serializer.save()
            return

        if is_buyer(user):
            raise ValidationError(
                "Your buyer profile already exists."
            )

        raise PermissionDenied(
            "You cannot create a buyer profile."
        )

    def perform_update(self, serializer):
        user = self.request.user
        profile = self.get_object()

        if is_admin(user):
            serializer.save()
            return

        if is_buyer(user) and profile.user_id == user.id:
            serializer.save(
                user=user,
                is_approved=profile.is_approved,
            )
            return

        raise PermissionDenied(
            "You can only update your own buyer profile."
        )


# =========================================================
# PURCHASE ORDERS
# =========================================================

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        base = PurchaseOrder.objects.select_related(
            "buyer", "estate"
        )

        if is_admin(user):
            return base.all().order_by("-id")

        if is_estate_owner(user):
            return base.filter(
                estate__owner=user
            ).order_by("-id")

        if is_buyer(user):
            return base.filter(
                buyer=user
            ).order_by("-id")

        return PurchaseOrder.objects.none()

    @transaction.atomic
    def perform_create(self, serializer):
        user = self.request.user

        if not user.is_authenticated:
            raise PermissionDenied("Please log in to place an order.")

        if not is_buyer(user):
            raise PermissionDenied(
                "Only registered buyers can place orders."
            )

        estate = serializer.validated_data.get("estate")
        category = serializer.validated_data.get("category")
        quantity = serializer.validated_data.get("quantity")

        if not estate or not estate.is_active:
            raise serializers.ValidationError({
                "estate": "Please select an active estate."
            })

        if quantity is None or quantity <= 0:
            raise serializers.ValidationError({
                "quantity": "Quantity must be greater than zero."
            })

        inventory = (
            Inventory.objects
            .select_for_update()
            .filter(estate=estate, category=category)
            .first()
        )

        if inventory is None:
            raise serializers.ValidationError({
                "category": (
                    "This product is not available at the selected estate."
                )
            })

        if quantity > inventory.stock_quantity:
            raise serializers.ValidationError({
                "quantity": (
                    f"Only {inventory.stock_quantity} "
                    f"{inventory.unit} is currently available."
                )
            })

        unit_price = inventory.unit_price
        total_price = quantity * unit_price

        serializer.save(
            buyer=user,
            estate=estate,
            category=category,
            quantity=quantity,
            unit_price=unit_price,
            total_price=total_price,
            status="PENDING",
        )

    def perform_update(self, serializer):
        user = self.request.user
        order = self.get_object()

        if is_admin(user):
            serializer.save()
            return

        if not is_buyer(user) or order.buyer_id != user.id:
            raise PermissionDenied(
                "You cannot update this order."
            )

        if order.status != "PENDING":
            raise ValidationError(
                "Only pending orders can be updated."
            )

        serializer.save(
            buyer=order.buyer,
            estate=order.estate,
            category=order.category,
            quantity=order.quantity,
            unit_price=order.unit_price,
            total_price=order.total_price,
            status=order.status,
        )

    def perform_destroy(self, instance):
        user = self.request.user

        if is_admin(user):
            instance.delete()
            return

        if (
            is_buyer(user)
            and instance.buyer_id == user.id
            and instance.status == "PENDING"
        ):
            instance.delete()
            return

        raise PermissionDenied(
            "Only Admin or the buyer of a pending order can delete it."
        )

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def approve(self, request, pk=None):
        require_admin_or_owner(request.user)

        order = self.get_object()

        if order.status != "PENDING":
            raise ValidationError(
                "Only pending orders can be approved."
            )

        if (
            not is_admin(request.user)
            and order.estate.owner_id != request.user.id
        ):
            raise PermissionDenied(
                "You can only approve orders for your own estate."
            )

        inventory = (
            Inventory.objects
            .select_for_update()
            .filter(
                estate=order.estate,
                category=order.category,
            )
            .first()
        )

        if not inventory or inventory.stock_quantity < order.quantity:
            raise ValidationError(
                "There is not enough stock to approve this order."
            )

        inventory.stock_quantity -= order.quantity
        inventory.save(
            update_fields=["stock_quantity", "last_updated"]
        )

        order.status = "APPROVED"
        order.save(update_fields=["status", "updated_at"])

        invoice = Invoice.objects.filter(order=order).first()

        if not invoice:
            invoice = Invoice.objects.create(
                order=order,
                invoice_number=(
                    f"INV-{order.pk}-{uuid.uuid4().hex[:8].upper()}"
                ),
                amount=order.total_price,
                payment_status="UNPAID",
            )

        return Response({
            "message": "Order approved and invoice generated.",
            "order_id": order.pk,
            "invoice_id": invoice.pk,
            "invoice_number": invoice.invoice_number,
        })

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        require_admin_or_owner(request.user)

        order = self.get_object()

        if (
            not is_admin(request.user)
            and order.estate.owner_id != request.user.id
        ):
            raise PermissionDenied(
                "You cannot reject orders for another owner's estate."
            )

        if order.status != "PENDING":
            raise ValidationError(
                "Only pending orders can be rejected."
            )

        order.status = "CANCELLED"
        order.save(update_fields=["status", "updated_at"])

        return Response({"message": "Order cancelled."})

# =========================================================
# INVOICES
# =========================================================

class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        base = Invoice.objects.select_related(
            "order",
            "order__buyer",
            "order__estate",
        )

        if is_admin(user):
            return base.all().order_by("-id")

        if is_buyer(user):
            return base.filter(
                order__buyer=user
            ).order_by("-id")

        if is_estate_owner(user):
            return base.filter(
                order__estate__owner=user
            ).order_by("-id")

        return Invoice.objects.none()


# =========================================================
# B2B INVOICE PAYMENTS
# =========================================================

class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        base = Payment.objects.select_related(
            "invoice",
            "invoice__order",
            "buyer",
        )

        if is_admin(user):
            return base.all().order_by("-id")

        if is_buyer(user):
            return base.filter(
                buyer=user
            ).order_by("-id")

        if is_estate_owner(user):
            return base.filter(
                invoice__order__estate__owner=user
            ).order_by("-id")

        return Payment.objects.none()


# =========================================================
# LABOUR WAGE PAYMENTS
# Separate from buyer invoice payments
# =========================================================

class LabourWagePaymentViewSet(viewsets.ModelViewSet):
    serializer_class = LabourWagePaymentSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        user = self.request.user

        base = LabourWagePayment.objects.select_related(
            "labour",
            "estate",
            "recorded_by",
        )

        if is_admin(user):
            return base.all().order_by("-created_at")

        if is_estate_owner(user):
            return base.filter(
                estate__owner=user
            ).order_by("-created_at")

        if is_labour(user):
            return base.filter(
                labour=user
            ).order_by("-created_at")

        return LabourWagePayment.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        require_admin_or_owner(user)

        labour = serializer.validated_data.get("labour")
        estate = serializer.validated_data.get("estate")
        period_start = serializer.validated_data.get("period_start")
        period_end = serializer.validated_data.get("period_end")
        amount = serializer.validated_data.get("amount")

        require_estate_access(user, estate)

        profile = LabourProfile.objects.filter(
            user=labour,
            estate=estate,
        ).first()

        if not profile:
            raise ValidationError(
                "The labourer is not assigned to this estate."
            )

        if period_end < period_start:
            raise ValidationError({
                "period_end": "End date must not precede start date."
            })

        if amount <= 0:
            raise ValidationError({
                "amount": "Payment amount must be greater than zero."
            })

        attendance_records = Attendance.objects.filter(
            labour=labour,
            estate=estate,
            date__gte=period_start,
            date__lte=period_end,
        )

        payable_days = Decimal("0")

        for attendance_record in attendance_records:
            if attendance_record.status == "PRESENT":
                payable_days += Decimal("1")
            elif attendance_record.status == "HALF_DAY":
                payable_days += Decimal("0.5")

        expected_wages = (
            payable_days * (profile.daily_wage or Decimal("0"))
        )

        already_paid = LabourWagePayment.objects.filter(
            labour=labour,
            estate=estate,
            period_start=period_start,
            period_end=period_end,
            status="PAID",
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0")

        remaining = expected_wages - already_paid

        if remaining <= 0:
            raise ValidationError(
                "No unpaid wages remain for the selected period."
            )

        if amount > remaining:
            raise ValidationError({
                "amount": (
                    f"Remaining payable wages for this period are "
                    f"{remaining:.2f}."
                )
            })

        serializer.save(
            status="PAID",
            recorded_by=user,
            payment_date=timezone.now(),
        )


# =========================================================
# CURRENT USER ROLE
# =========================================================

class CurrentUserRoleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if is_admin(user):
            role = "admin"
        elif is_estate_owner(user):
            role = "estate_owner"
        elif is_buyer(user):
            role = "buyer"
        elif is_labour(user):
            role = "labour"
        else:
            role = "unknown"

        data = {
            "id": user.pk,
            "username": user.username,
            "email": user.email,
            "role": role,
        }

        if role == "labour":
            profile = get_labour_profile(user)
            data["estate_id"] = profile.estate_id if profile else None
            data["estate_name"] = (
                profile.estate.name
                if profile and profile.estate
                else None
            )

        elif role == "estate_owner":
            data["estate_ids"] = list(
                get_owner_estates(user).values_list("id", flat=True)
            )

        elif role == "buyer":
            profile = BuyerProfile.objects.filter(user=user).first()
            data["is_approved"] = (
                profile.is_approved if profile else False
            )

        return Response(data)


# =========================================================
# REGISTRATION
# =========================================================

class RegisterEstateOwnerView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        data = request.data

        username = str(data.get("username", "")).strip()
        password = data.get("password")

        if not username or not password:
            raise ValidationError(
                "Username and password are required."
            )

        if User.objects.filter(username=username).exists():
            raise ValidationError({
                "username": "This username is already registered."
            })

        user = User.objects.create_user(
            username=username,
            password=password,
            email=data.get("email", ""),
        )

        EstateOwnerProfile.objects.create(
            user=user,
            phone=data.get("phone", ""),
            address=data.get("address", ""),
        )

        return Response(
            {"message": "Estate owner registered successfully."},
            status=status.HTTP_201_CREATED,
        )

class RegisterLabourView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        data = request.data

        username = str(data.get("username", "")).strip()
        password = data.get("password")
        full_name = str(data.get("full_name", "")).strip()

        if not username or not password or not full_name:
            raise ValidationError({
                "detail": "Username, password, and full name are required."
            })

        if User.objects.filter(username=username).exists():
            raise ValidationError({
                "username": "This username is already registered."
            })

        try:
            daily_wage = Decimal(str(data.get("daily_wage", "0") or "0"))
        except (InvalidOperation, TypeError, ValueError):
            raise ValidationError({
                "daily_wage": "Enter a valid daily wage."
            })

        if daily_wage < 0:
            raise ValidationError({
                "daily_wage": "Daily wage cannot be negative."
            })

        user = User.objects.create_user(
            username=username,
            password=password,
            email=data.get("email", ""),
        )

        name_parts = full_name.split(" ", 1)
        user.first_name = name_parts[0]
        user.last_name = name_parts[1] if len(name_parts) > 1 else ""
        user.save(update_fields=["first_name", "last_name"])

        profile = LabourProfile.objects.create(
            user=user,
            full_name=full_name,
            phone=data.get("phone", ""),
            address=data.get("address", ""),
            daily_wage=daily_wage,
            estate=None,
        )

        return Response(
            {
                "message": "Labour registered successfully.",
                "id": profile.pk,
                "username": user.username,
            },
            status=status.HTTP_201_CREATED,
        )
class RegisterBuyerView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        data = request.data

        username = str(data.get("username", "")).strip()
        password = data.get("password")
        company_name = str(data.get("company_name", "")).strip()

        if not username or not password or not company_name:
            raise ValidationError(
                "Username, password, and company name are required."
            )

        if User.objects.filter(username=username).exists():
            raise ValidationError({
                "username": "This username is already registered."
            })

        user = User.objects.create_user(
            username=username,
            password=password,
            email=data.get("email", ""),
        )

        BuyerProfile.objects.create(
            user=user,
            company_name=company_name,
            phone_number=data.get("phone_number", ""),
            email=data.get("email", ""),
            address=data.get("address", ""),
            gst_number=data.get("gst_number", ""),
            is_approved=False,
        )

        return Response({
            "message": (
                "Buyer registered successfully. "
                "Your account must be approved before placing orders."
            )
        }, status=status.HTTP_201_CREATED)


# =========================================================
# RAZORPAY HELPERS
# =========================================================

def get_razorpay_client():
    key_id = getattr(settings, "RAZORPAY_KEY_ID", "")
    key_secret = getattr(settings, "RAZORPAY_KEY_SECRET", "")

    if not key_id or not key_secret:
        raise ValidationError(
            "Razorpay credentials are not configured in Django settings."
        )

    return razorpay.Client(auth=(key_id, key_secret))


# =========================================================
# CREATE RAZORPAY ORDER
# =========================================================

class CreateRazorpayOrderView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        user = request.user

        if not is_buyer(user):
            raise PermissionDenied(
                "Only buyers can pay invoices."
            )

        # Support both frontend field names.
        invoice_id = (
            request.data.get("invoice_id")
            or request.data.get("invoice")
        )

        if not invoice_id:
            raise ValidationError({
                "invoice": "Invoice ID is required."
            })

        invoice = (
            Invoice.objects
            .select_for_update()
            .filter(pk=invoice_id, order__buyer=user)
            .first()
        )

        if not invoice:
            raise ValidationError(
                "Invoice not found for this buyer."
            )

        if invoice.payment_status == "PAID":
            raise ValidationError(
                "This invoice has already been paid."
            )

        successful_payments = Payment.objects.filter(
            invoice=invoice,
            buyer=user,
            status="SUCCESS",
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

        remaining = invoice.amount - successful_payments

        if remaining <= 0:
            raise ValidationError(
                "No payment balance remains on this invoice."
            )

        amount_paise = int(
            (remaining * Decimal("100")).quantize(Decimal("1"))
        )

        client = get_razorpay_client()

        try:
            razorpay_order = client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "receipt": (
                    f"invoice_{invoice.pk}_"
                    f"{uuid.uuid4().hex[:8]}"
                ),
                "notes": {
                    "invoice_id": str(invoice.pk),
                    "buyer_id": str(user.pk),
                },
            })
        except Exception as exc:
            # Details appear in the Django terminal for debugging.
            print("Razorpay order creation failed:", str(exc))
            raise ValidationError(
                "Unable to create Razorpay order. Check your "
                "Razorpay credentials and Django terminal."
            )

        payment = Payment.objects.create(
            invoice=invoice,
            buyer=user,
            amount=remaining,
            payment_method="RAZORPAY",
            transaction_id=razorpay_order["id"],
            status="PENDING",
            remarks="Razorpay checkout initiated.",
        )

        return Response({
            "key": settings.RAZORPAY_KEY_ID,
            "key_id": settings.RAZORPAY_KEY_ID,
            "order_id": razorpay_order["id"],
            "razorpay_order_id": razorpay_order["id"],
            "amount": amount_paise,
            "currency": "INR",
            "payment_id": payment.pk,
            "invoice_id": invoice.pk,
        }, status=status.HTTP_201_CREATED)

class CheckRazorpayOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, payment_id):
        user = request.user

        if not is_buyer(user):
            raise PermissionDenied(
                "Only buyers can check their payment status."
            )

        payment = Payment.objects.filter(
            pk=payment_id,
            buyer=user,
            payment_method="RAZORPAY",
        ).first()

        if not payment:
            raise ValidationError("Payment record not found.")

        client = get_razorpay_client()

        try:
            order = client.order.fetch(payment.transaction_id)
            razorpay_payments = client.order.payments(
                payment.transaction_id
            )
        except Exception as exc:
            print("Razorpay status check failed:", str(exc))
            raise ValidationError(
                "Unable to check this order with Razorpay. "
                "Check the Django terminal and Razorpay credentials."
            )

        return Response({
            "local_payment_id": payment.pk,
            "local_status": payment.status,
            "razorpay_order_id": order.get("id"),
            "razorpay_order_status": order.get("status"),
            "razorpay_payments": [
                {
                    "payment_id": item.get("id"),
                    "status": item.get("status"),
                    "amount": item.get("amount"),
                    "captured": item.get("captured"),
                }
                for item in razorpay_payments.get("items", [])
            ],
        })


# =========================================================
# VERIFY RAZORPAY PAYMENT
# =========================================================

class VerifyRazorpayPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        user = request.user

        if not is_buyer(user):
            raise PermissionDenied(
                "Only buyers can verify invoice payments."
            )

        razorpay_order_id = request.data.get("razorpay_order_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_signature = request.data.get("razorpay_signature")

        if not all([
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        ]):
            raise ValidationError(
                "Missing Razorpay payment verification details."
            )

        payment = (
            Payment.objects
            .select_for_update()
            .filter(
                buyer=user,
                transaction_id=razorpay_order_id,
            )
            .first()
        )

        if not payment:
            raise ValidationError(
                "Payment record not found for this Razorpay order."
            )

        if payment.status == "SUCCESS":
            return Response({
                "message": "This payment is already verified."
            })

        client = get_razorpay_client()
   
        import razorpay

        try:
            client.utility.verify_payment_signature({
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature,
            })
        except razorpay.errors.SignatureVerificationError:
            payment.status = "FAILED"
            payment.remarks = "Razorpay signature verification failed."
            payment.save(update_fields=["status", "remarks"])

            return Response(
                {"detail": "Razorpay signature verification failed."},
                status=status.HTTP_400_BAD_REQUEST,
            )


        invoice = (
            Invoice.objects
            .select_for_update()
            .filter(
                pk=payment.invoice_id,
                order__buyer=user,
            )
            .first()
        )

        if not invoice:
            raise ValidationError(
                "The invoice linked to this payment was not found."
            )

        # Mark this payment successful, preserving the order ID in
        # transaction_id so the verification lookup remains consistent.
        payment.status = "SUCCESS"
        payment.remarks = (
            f"Razorpay payment verified. "
            f"Payment ID: {razorpay_payment_id}"
        )
        payment.save(update_fields=["status", "remarks"])

        total_paid = Payment.objects.filter(
            invoice=invoice,
            status="SUCCESS",
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

        if total_paid >= invoice.amount:
            invoice.payment_status = "PAID"
            invoice.paid_at = timezone.now()

            order = invoice.order
            order.status = "COMPLETED"
            order.save(update_fields=["status", "updated_at"])
        elif total_paid > 0:
            invoice.payment_status = "PARTIAL"

        invoice.payment_method = "RAZORPAY"
        invoice.transaction_reference = razorpay_payment_id
        invoice.save(update_fields=[
            "payment_status",
            "paid_at",
            "payment_method",
            "transaction_reference",
        ])

        return Response({
            "message": "Payment verified successfully.",
            "invoice_status": invoice.payment_status,
            "amount_paid": str(total_paid),
            "invoice_amount": str(invoice.amount),
        }, status=status.HTTP_200_OK)


# =========================================================
# PAYROLL CSV EXPORT
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_payroll_csv(request):
    user = request.user

    if not (is_admin(user) or is_estate_owner(user)):
        raise PermissionDenied(
            "You cannot export payroll."
        )

    queryset = Attendance.objects.select_related(
        "labour", "estate"
    ).order_by("date", "labour__username")

    if is_estate_owner(user):
        queryset = queryset.filter(estate__owner=user)

    start_date_raw = request.query_params.get("start_date")
    end_date_raw = request.query_params.get("end_date")

    if start_date_raw:
        start_date = parse_date(start_date_raw)
        if not start_date:
            raise ValidationError({
                "start_date": "Use YYYY-MM-DD format."
            })
        queryset = queryset.filter(date__gte=start_date)

    if end_date_raw:
        end_date = parse_date(end_date_raw)
        if not end_date:
            raise ValidationError({
                "end_date": "Use YYYY-MM-DD format."
            })
        queryset = queryset.filter(date__lte=end_date)

    if start_date_raw and end_date_raw:
        if start_date > end_date:
            raise ValidationError(
                "Start date must not be after end date."
            )

    response = HttpResponse(
        content_type="text/csv; charset=utf-8"
    )
    response["Content-Disposition"] = (
        'attachment; filename="payroll.csv"'
    )
    response.write("\ufeff")

    writer = csv.writer(response)
    writer.writerow([
        "Labour Username",
        "Estate",
        "Date",
        "Attendance Status",
        "Daily Wage",
        "Payable Days",
        "Calculated Wage",
    ])

    wage_cache = {}

    for attendance in queryset.iterator():
        key = (attendance.labour_id, attendance.estate_id)

        if key not in wage_cache:
            profile = LabourProfile.objects.filter(
                user_id=attendance.labour_id,
                estate_id=attendance.estate_id,
            ).first()

            wage_cache[key] = (
                profile.daily_wage
                if profile and profile.daily_wage is not None
                else Decimal("0.00")
            )

        daily_wage = wage_cache[key]

        if attendance.status == "PRESENT":
            payable_days = Decimal("1")
        elif attendance.status == "HALF_DAY":
            payable_days = Decimal("0.5")
        else:
            payable_days = Decimal("0")

        calculated_wage = daily_wage * payable_days

        writer.writerow([
            attendance.labour.username,
            attendance.estate.name if attendance.estate else "",
            attendance.date,
            attendance.status,
            f"{daily_wage:.2f}",
            str(payable_days),
            f"{calculated_wage:.2f}",
        ])

    return response


# =========================================================
# SALES CSV EXPORT
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_sales_csv(request):
    user = request.user

    if is_admin(user):
        queryset = PurchaseOrder.objects.select_related(
            "buyer", "estate"
        ).all()
    elif is_estate_owner(user):
        queryset = PurchaseOrder.objects.filter(
            estate__owner=user
        ).select_related("buyer", "estate")
    else:
        raise PermissionDenied(
            "You cannot export sales."
        )

    queryset = queryset.order_by("-created_at")

    response = HttpResponse(
        content_type="text/csv; charset=utf-8"
    )
    response["Content-Disposition"] = (
        'attachment; filename="sales.csv"'
    )
    response.write("\ufeff")

    writer = csv.writer(response)
    writer.writerow([
        "Order ID",
        "Buyer",
        "Estate",
        "Category",
        "Quantity",
        "Unit Price",
        "Total Price",
        "Status",
        "Created At",
    ])

    for order in queryset.iterator():
        writer.writerow([
            order.pk,
            order.buyer.username if order.buyer else "",
            order.estate.name if order.estate else "",
            order.category,
            order.quantity,
            order.unit_price,
            order.total_price,
            order.status,
            order.created_at,
        ])

    return response

# =========================================================
# BUYER'S OWN ORDERS CSV EXPORT
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_my_orders_csv(request):
    user = request.user

    # Use your existing BuyerProfile-based role helper.
    if not is_buyer(user):
        raise PermissionDenied(
            "Only registered buyers can download their own orders."
        )

    # IMPORTANT: Export only this buyer's orders.
    queryset = (
        PurchaseOrder.objects
        .filter(buyer=user)
        .select_related("buyer", "estate")
        .order_by("-created_at")
    )

    response = HttpResponse(
        content_type="text/csv; charset=utf-8"
    )
    response["Content-Disposition"] = (
        'attachment; filename="my-orders.csv"'
    )
    response.write("\ufeff")

    writer = csv.writer(response)

    writer.writerow([
        "Order Number",
        "Order Date",
        "Estate",
        "Product Category",
        "Quantity",
        "Unit Price",
        "Total Price",
        "Status",
        "Notes",
    ])

    for order in queryset.iterator():
        writer.writerow([
            order.pk,
            order.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            order.estate.name if order.estate else "",
            order.get_category_display(),
            order.quantity,
            order.unit_price,
            order.total_price,
            order.get_status_display(),
            order.notes,
        ])

    return response

