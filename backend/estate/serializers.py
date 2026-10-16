
from rest_framework import serializers

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


# =========================================================
# ESTATE SERIALIZER
# =========================================================

class EstateSerializer(serializers.ModelSerializer):
    owner_name = serializers.ReadOnlyField(source="owner.username")
    labour_count = serializers.ReadOnlyField(source="current_labour_count")
    available_labour_slots = serializers.ReadOnlyField()

    class Meta:
        model = Estate
        fields = [
            "id",
            "name",
            "owner",
            "owner_name",
            "location",
            "total_area",
            "description",
            "max_labour",
            "is_active",
            "labour_count",
            "available_labour_slots",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "owner",
            "owner_name",
            "labour_count",
            "available_labour_slots",
            "created_at",
        ]

    def validate_max_labour(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Maximum labour capacity cannot be negative."
            )
        return value

    def validate_total_area(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Estate area cannot be negative."
            )
        return value


# =========================================================
# ESTATE OWNER PROFILE SERIALIZER
# =========================================================

class EstateOwnerProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = EstateOwnerProfile
        fields = [
            "id",
            "user",
            "username",
            "phone",
            "address",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "username",
            "created_at",
        ]


# =========================================================
# LABOUR PROFILE SERIALIZER
# =========================================================

class LabourProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source="user.username")
    estate_name = serializers.ReadOnlyField(source="estate.name")

    class Meta:
        model = LabourProfile
        fields = [
            "id",
            "user",
            "username",
            "estate",
            "estate_name",
            "full_name",
            "phone",
            "address",
            "daily_wage",
            "bank_name",
            "account_number",
            "ifsc_code",
            "upi_id",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "username",
            "estate_name",
            "created_at",
        ]

    def validate_daily_wage(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Daily wage cannot be negative."
            )
        return value


# =========================================================
# ATTENDANCE SERIALIZER
# =========================================================

class AttendanceSerializer(serializers.ModelSerializer):
    labour_name = serializers.ReadOnlyField(source="labour.username")
    estate_name = serializers.ReadOnlyField(source="estate.name")

    class Meta:
        model = Attendance
        fields = [
            "id",
            "labour",
            "labour_name",
            "estate",
            "estate_name",
            "date",
            "status",
            "assigned_block",
            "remarks",
        ]
        read_only_fields = [
            "id",
            "labour_name",
            "estate_name",
        ]

    def validate(self, attrs):
        labour = attrs.get(
            "labour",
            self.instance.labour if self.instance else None,
        )
        estate = attrs.get(
            "estate",
            self.instance.estate if self.instance else None,
        )

        if not labour:
            raise serializers.ValidationError({
                "labour": "Please select a labourer."
            })

        if not estate:
            raise serializers.ValidationError({
                "estate": "Please select an estate."
            })

        assigned = LabourProfile.objects.filter(
            user=labour,
            estate=estate,
        ).exists()

        if not assigned:
            raise serializers.ValidationError({
                "labour": (
                    "The selected labourer must be assigned "
                    "to this estate."
                )
            })

        return attrs


# =========================================================
# HARVEST / TAPPING SERIALIZER
# =========================================================

class TappingRecordSerializer(serializers.ModelSerializer):
    labour_name = serializers.ReadOnlyField(source="labour.username")
    estate_name = serializers.ReadOnlyField(source="estate.name")

    class Meta:
        model = TappingRecord
        fields = [
            "id",
            "labour",
            "labour_name",
            "estate",
            "estate_name",
            "date",
            "category",
            "quantity",
            "unit",
            "assigned_block",
            "is_verified",
            "remarks",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "labour_name",
            "estate_name",
            "is_verified",
            "created_at",
        ]
        extra_kwargs = {
            "labour": {"required": False},
            "estate": {"required": False, "allow_null": True},
        }

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Quantity must be greater than zero."
            )
        return value

    def validate(self, attrs):
        # Do not allow the client to change the labour or estate
        # of an existing record without explicit backend permission.
        if self.instance and self.instance.is_verified:
            raise serializers.ValidationError(
                "Verified harvest records cannot be edited."
            )

        return attrs


# =========================================================
# VERIFIED PRODUCTION SERIALIZER
# =========================================================

class ProductionSerializer(serializers.ModelSerializer):
    verified_by_name = serializers.ReadOnlyField(
        source="verified_by.username"
    )
    labour_name = serializers.ReadOnlyField(
        source="tapping_record.labour.username"
    )
    estate_name = serializers.ReadOnlyField(
        source="tapping_record.estate.name"
    )
    tapping_record_details = TappingRecordSerializer(
        source="tapping_record",
        read_only=True,
    )

    class Meta:
        model = Production
        fields = [
            "id",
            "tapping_record",
            "tapping_record_details",
            "labour_name",
            "estate_name",
            "verified_by",
            "verified_by_name",
            "verified_quantity",
            "calculated_wage",
            "verification_remarks",
            "verified_at",
        ]
        read_only_fields = [
            "id",
            "verified_by",
            "verified_by_name",
            "labour_name",
            "estate_name",
            "verified_at",
        ]

    def validate_verified_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Verified quantity must be greater than zero."
            )
        return value

    def validate_calculated_wage(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Calculated wage cannot be negative."
            )
        return value


# =========================================================
# INVENTORY SERIALIZER
# =========================================================

class InventorySerializer(serializers.ModelSerializer):
    estate_name = serializers.ReadOnlyField(source="estate.name")

    class Meta:
        model = Inventory
        fields = [
            "id",
            "estate",
            "estate_name",
            "category",
            "stock_quantity",
            "unit",
            "unit_price",
            "last_updated",
        ]
        read_only_fields = [
            "id",
            "estate_name",
            "last_updated",
        ]

    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Stock quantity cannot be negative."
            )
        return value

    def validate_unit_price(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Unit price cannot be negative."
            )
        return value


# =========================================================
# EXPENSE SERIALIZER
# =========================================================

class ExpenseSerializer(serializers.ModelSerializer):
    estate_name = serializers.ReadOnlyField(source="estate.name")
    recorded_by_name = serializers.ReadOnlyField(
        source="recorded_by.username"
    )

    class Meta:
        model = Expense
        fields = [
            "id",
            "estate",
            "estate_name",
            "category",
            "amount",
            "description",
            "expense_date",
            "recorded_by",
            "recorded_by_name",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "estate_name",
            "recorded_by",
            "recorded_by_name",
            "created_at",
        ]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Expense amount must be greater than zero."
            )
        return value

    def validate_description(self, value):
        return value.strip() if value else value


# =========================================================
# BUYER PROFILE SERIALIZER
# =========================================================

class BuyerProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = BuyerProfile
        fields = [
            "id",
            "user",
            "username",
            "company_name",
            "phone_number",
            "email",
            "address",
            "gst_number",
            "is_approved",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "username",
            "is_approved",
            "created_at",
        ]


# =========================================================
# LABOUR ESTATE REQUEST SERIALIZER
# =========================================================

class LabourEstateRequestSerializer(serializers.ModelSerializer):
    labour_name = serializers.ReadOnlyField(source="labour.username")
    estate_name = serializers.ReadOnlyField(source="estate.name")

    class Meta:
        model = LabourEstateRequest
        fields = [
            "id",
            "labour",
            "labour_name",
            "estate",
            "estate_name",
            "status",
            "message",
            "requested_at",
            "responded_at",
        ]
        read_only_fields = [
            "id",
            "labour",
            "labour_name",
            "estate_name",
            "status",
            "requested_at",
            "responded_at",
        ]


# =========================================================
# PURCHASE ORDER SERIALIZER
# =========================================================

class PurchaseOrderSerializer(serializers.ModelSerializer):
    buyer_name = serializers.ReadOnlyField(source="buyer.username")
    buyer_company = serializers.SerializerMethodField()
    estate_name = serializers.ReadOnlyField(source="estate.name")

    class Meta:
        model = PurchaseOrder
        fields = [
            "id",
            "buyer",
            "buyer_name",
            "buyer_company",
            "estate",
            "estate_name",
            "category",
            "quantity",
            "unit_price",
            "total_price",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "buyer",
            "buyer_name",
            "buyer_company",
            "estate_name",
            "unit_price",
            "total_price",
            "status",
            "created_at",
            "updated_at",
        ]

    def get_buyer_company(self, obj):
        profile = BuyerProfile.objects.filter(
            user=obj.buyer
        ).first()
        return profile.company_name if profile else obj.buyer.username

def validate(self, attrs):
    estate = attrs.get(
        "estate",
        self.instance.estate if self.instance else None,
    )
    category = attrs.get(
        "category",
        self.instance.category if self.instance else None,
    )
    quantity = attrs.get(
        "quantity",
        self.instance.quantity if self.instance else None,
    )

    if not estate:
        raise serializers.ValidationError({
            "estate": "Estate is required."
        })

    if category not in ("LATEX", "SHEET", "SCRAP"):
        raise serializers.ValidationError({
            "category": "Invalid product category."
        })

    if quantity is None or quantity <= 0:
        raise serializers.ValidationError({
            "quantity": "Quantity must be greater than zero."
        })

    if not estate.is_active:
        raise serializers.ValidationError({
            "estate": "This estate is not active."
        })

    inventory = Inventory.objects.filter(
        estate=estate,
        category=category,
    ).first()

    if not inventory:
        raise serializers.ValidationError({
            "category": (
                "This product is not available in the selected estate."
            )
        })

    # For an existing order, avoid rejecting an update just because
    # stock changed after the original order was placed.
    if not self.instance and inventory.stock_quantity < quantity:
        raise serializers.ValidationError({
            "quantity": (
                f"Only {inventory.stock_quantity} "
                f"{inventory.unit} available in stock."
            )
        })

    return attrs



# =========================================================
# INVOICE SERIALIZER
# =========================================================

class InvoiceSerializer(serializers.ModelSerializer):
    buyer_name = serializers.ReadOnlyField(
        source="order.buyer.username"
    )
    order_number = serializers.ReadOnlyField(source="order.id")

    class Meta:
        model = Invoice
        fields = [
            "id",
            "order",
            "order_number",
            "buyer_name",
            "invoice_number",
            "amount",
            "payment_status",
            "payment_method",
            "transaction_reference",
            "issued_at",
            "paid_at",
        ]
        read_only_fields = [
            "id",
            "order",
            "order_number",
            "buyer_name",
            "invoice_number",
            "amount",
            "payment_status",
            "payment_method",
            "transaction_reference",
            "issued_at",
            "paid_at",
        ]


# =========================================================
# B2B BUYER INVOICE PAYMENT SERIALIZER
# =========================================================

class PaymentSerializer(serializers.ModelSerializer):
    buyer_name = serializers.ReadOnlyField(source="buyer.username")
    invoice_number = serializers.ReadOnlyField(
        source="invoice.invoice_number"
    )

    class Meta:
        model = Payment
        fields = [
            "id",
            "invoice",
            "invoice_number",
            "buyer",
            "buyer_name",
            "amount",
            "payment_method",
            "transaction_id",
            "status",
            "payment_date",
            "remarks",
        ]
        read_only_fields = [
            "id",
            "invoice_number",
            "buyer",
            "buyer_name",
            "status",
            "payment_date",
        ]


# =========================================================
# LABOUR WAGE PAYMENT SERIALIZER
# Separate from B2B invoice payments
# =========================================================

class LabourWagePaymentSerializer(serializers.ModelSerializer):
    labour_name = serializers.ReadOnlyField(
        source="labour.username"
    )
    estate_name = serializers.ReadOnlyField(
        source="estate.name"
    )
    recorded_by_name = serializers.ReadOnlyField(
        source="recorded_by.username"
    )

    class Meta:
        model = LabourWagePayment
        fields = [
            "id",
            "labour",
            "labour_name",
            "estate",
            "estate_name",
            "period_start",
            "period_end",
            "amount",
            "payment_date",
            "payment_method",
            "status",
            "transaction_reference",
            "remarks",
            "recorded_by",
            "recorded_by_name",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "labour_name",
            "estate_name",
            "status",
            "recorded_by",
            "recorded_by_name",
            "created_at",
        ]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Wage payment amount must be greater than zero."
            )
        return value

    def validate(self, attrs):
        period_start = attrs.get(
            "period_start",
            self.instance.period_start if self.instance else None,
        )
        period_end = attrs.get(
            "period_end",
            self.instance.period_end if self.instance else None,
        )

        if (
            period_start
            and period_end
            and period_end < period_start
        ):
            raise serializers.ValidationError({
                "period_end": (
                    "End date must be on or after the start date."
                )
            })

        labour = attrs.get(
            "labour",
            self.instance.labour if self.instance else None,
        )
        estate = attrs.get(
            "estate",
            self.instance.estate if self.instance else None,
        )

        if labour and estate:
            assigned = LabourProfile.objects.filter(
                user=labour,
                estate=estate,
            ).exists()

            if not assigned:
                raise serializers.ValidationError({
                    "labour": (
                        "The selected labourer must be assigned "
                        "to the selected estate."
                    )
                })

        return attrs























# from django.contrib.auth.models import User
# from rest_framework import serializers

# from .models import (
#     Estate,
#     LabourProfile,
#     Attendance,
#     TappingRecord,
#     Production,
#     Inventory,
#     BuyerProfile,
#     SupervisorProfile,
#     PurchaseOrder,
#     Invoice,
#     Payment,
#     EstateOwnerProfile,
#     LabourEstateRequest,
#     SupervisorEstateRequest,
#     Expense,
# )


# # =========================================================
# # EXPENSE CATEGORY OPTIONS
# # =========================================================

# EXPENSE_CATEGORIES = [
#     "Labour",
#     "Fertilizer",
#     "Pesticides / Chemicals",
#     "Planting Materials",
#     "Tools & Equipment",
#     "Machinery",
#     "Fuel",
#     "Transportation",
#     "Maintenance & Repairs",
#     "Electricity",
#     "Water / Irrigation",
#     "Estate Development",
#     "Office / Administration",
#     "Rent / Lease",
#     "Licenses & Permits",
#     "Insurance",
#     "Packaging",
#     "Processing",
#     "Other",
# ]


# # =========================================================
# # 1. ESTATE SERIALIZER
# # =========================================================

# class EstateSerializer(serializers.ModelSerializer):
#     owner_name = serializers.ReadOnlyField(
#         source="owner.username"
#     )

#     labour_count = serializers.ReadOnlyField(
#         source="current_labour_count"
#     )

#     supervisor_count = serializers.ReadOnlyField(
#         source="current_supervisor_count"
#     )

#     class Meta:
#         model = Estate

#         fields = [
#             "id",
#             "name",
#             "owner",
#             "owner_name",
#             "location",
#             "total_area",
#             "description",
#             "max_labour",
#             "max_supervisors",
#             "is_active",
#             "labour_count",
#             "supervisor_count",
#             "created_at",
#         ]

#         read_only_fields = [
#             "id",
#             "owner",
#             "owner_name",
#             "labour_count",
#             "supervisor_count",
#             "created_at",
#         ]


# # =========================================================
# # 2. LABOUR PROFILE SERIALIZER
# # =========================================================

# class LabourProfileSerializer(serializers.ModelSerializer):
#     username = serializers.ReadOnlyField(
#         source="user.username"
#     )

#     estate_name = serializers.ReadOnlyField(
#         source="estate.name"
#     )

#     class Meta:
#         model = LabourProfile

#         fields = [
#             "id",
#             "user",
#             "username",
#             "estate",
#             "estate_name",
#             "full_name",
#             "phone",
#             "address",
#             "daily_wage",
#             "account_holder_name",
#             "bank_name",
#             "account_number",
#             "ifsc_code",
#             "upi_id",
#             "created_at",
#         ]

#         read_only_fields = [
#             "id",
#             "username",
#             "estate_name",
#             "created_at",
#         ]


# # =========================================================
# # 3. ATTENDANCE SERIALIZER
# # =========================================================

# class AttendanceSerializer(serializers.ModelSerializer):
#     labour_name = serializers.ReadOnlyField(
#         source="labour.username"
#     )

#     estate_name = serializers.ReadOnlyField(
#         source="estate.name"
#     )

#     class Meta:
#         model = Attendance

#         fields = [
#             "id",
#             "labour",
#             "labour_name",
#             "estate",
#             "estate_name",
#             "date",
#             "status",
#             "assigned_block",
#             "remarks",
#         ]

#         read_only_fields = [
#             "id",
#             "labour_name",
#             "estate_name",
#         ]


# # =========================================================
# # 4. TAPPING RECORD SERIALIZER
# # =========================================================

# class TappingRecordSerializer(serializers.ModelSerializer):
#     labour_name = serializers.ReadOnlyField(
#         source="labour.username"
#     )

#     estate_name = serializers.ReadOnlyField(
#         source="estate.name"
#     )

#     class Meta:
#         model = TappingRecord

#         fields = [
#             "id",
#             "labour",
#             "labour_name",
#             "estate",
#             "estate_name",
#             "date",
#             "category",
#             "quantity",
#             "unit",
#             "assigned_block",
#             "is_verified",
#             "remarks",
#         ]

#         read_only_fields = [
#             "id",
#             "labour_name",
#             "estate_name",
#             "is_verified",
#         ]

#         extra_kwargs = {
#             "labour": {
#                 "required": False,
#                 "allow_null": True,
#             },
#             "estate": {
#                 "required": False,
#                 "allow_null": True,
#             },
#         }

#     def validate_quantity(self, value):
#         if value <= 0:
#             raise serializers.ValidationError(
#                 "Quantity must be greater than 0."
#             )

#         return value


# # =========================================================
# # 5. PRODUCTION / HARVEST SERIALIZER
# # =========================================================

# class ProductionSerializer(serializers.ModelSerializer):
#     verified_by_name = serializers.ReadOnlyField(
#         source="verified_by.username"
#     )

#     labour_name = serializers.ReadOnlyField(
#         source="tapping_record.labour.username"
#     )

#     estate_name = serializers.ReadOnlyField(
#         source="tapping_record.estate.name"
#     )

#     tapping_record_details = TappingRecordSerializer(
#         source="tapping_record",
#         read_only=True,
#     )

#     class Meta:
#         model = Production

#         fields = [
#             "id",
#             "tapping_record",
#             "tapping_record_details",
#             "labour_name",
#             "estate_name",
#             "verified_by",
#             "verified_by_name",
#             "verified_quantity",
#             "calculated_wage",
#             "verification_remarks",
#             "verified_at",
#         ]

#         read_only_fields = [
#             "id",
#             "verified_by",
#             "verified_by_name",
#             "labour_name",
#             "estate_name",
#             "verified_at",
#         ]

#     def validate_verified_quantity(self, value):
#         if value <= 0:
#             raise serializers.ValidationError(
#                 "Verified quantity must be greater than 0."
#             )

#         return value

#     def validate_calculated_wage(self, value):
#         if value < 0:
#             raise serializers.ValidationError(
#                 "Calculated wage cannot be negative."
#             )

#         return value


# # =========================================================
# # 6. INVENTORY SERIALIZER
# # =========================================================

# class InventorySerializer(serializers.ModelSerializer):
#     estate_name = serializers.ReadOnlyField(
#         source="estate.name"
#     )

#     class Meta:
#         model = Inventory

#         fields = [
#             "id",
#             "estate",
#             "estate_name",
#             "category",
#             "stock_quantity",
#             "unit",
#             "unit_price",
#             "last_updated",
#         ]

#         read_only_fields = [
#             "id",
#             "estate_name",
#             "last_updated",
#         ]

#     def validate_stock_quantity(self, value):
#         if value < 0:
#             raise serializers.ValidationError(
#                 "Stock quantity cannot be negative."
#             )

#         return value

#     def validate_unit_price(self, value):
#         if value < 0:
#             raise serializers.ValidationError(
#                 "Unit price cannot be negative."
#             )

#         return value


# # =========================================================
# # 7. BUYER PROFILE SERIALIZER
# # =========================================================

# class BuyerProfileSerializer(serializers.ModelSerializer):
#     username = serializers.ReadOnlyField(
#         source="user.username"
#     )

#     class Meta:
#         model = BuyerProfile

#         fields = [
#             "id",
#             "user",
#             "username",
#             "company_name",
#             "phone_number",
#             "email",
#             "address",
#             "gst_number",
#             "is_approved",
#             "created_at",
#         ]

#         read_only_fields = [
#             "id",
#             "username",
#             "created_at",
#         ]


# # =========================================================
# # 8. ESTATE OWNER PROFILE SERIALIZER
# # =========================================================

# class EstateOwnerProfileSerializer(serializers.ModelSerializer):
#     username = serializers.ReadOnlyField(
#         source="user.username"
#     )

#     class Meta:
#         model = EstateOwnerProfile

#         fields = [
#             "id",
#             "user",
#             "username",
#             "phone",
#             "address",
#             "created_at",
#         ]

#         read_only_fields = [
#             "id",
#             "username",
#             "created_at",
#         ]


# # =========================================================
# # 9. SUPERVISOR PROFILE SERIALIZER
# # =========================================================

# class SupervisorProfileSerializer(serializers.ModelSerializer):
#     username = serializers.ReadOnlyField(
#         source="user.username"
#     )

#     estate_name = serializers.ReadOnlyField(
#         source="estate.name"
#     )

#     class Meta:
#         model = SupervisorProfile

#         fields = [
#             "id",
#             "user",
#             "username",
#             "estate",
#             "estate_name",
#             "full_name",
#             "phone",
#             "created_at",
#         ]

#         read_only_fields = [
#             "id",
#             "username",
#             "estate_name",
#             "created_at",
#         ]


# # =========================================================
# # 10. LABOUR → ESTATE REQUEST SERIALIZER
# # =========================================================

# class LabourEstateRequestSerializer(serializers.ModelSerializer):
#     labour_name = serializers.ReadOnlyField(
#         source="labour.username"
#     )

#     estate_name = serializers.ReadOnlyField(
#         source="estate.name"
#     )

#     class Meta:
#         model = LabourEstateRequest

#         fields = [
#             "id",
#             "labour",
#             "labour_name",
#             "estate",
#             "estate_name",
#             "status",
#             "message",
#             "requested_at",
#             "responded_at",
#         ]

#         read_only_fields = [
#             "id",
#             "labour",
#             "labour_name",
#             "estate_name",
#             "status",
#             "requested_at",
#             "responded_at",
#         ]


# # =========================================================
# # 11. SUPERVISOR → ESTATE REQUEST SERIALIZER
# # =========================================================

# class SupervisorEstateRequestSerializer(serializers.ModelSerializer):
#     supervisor_name = serializers.ReadOnlyField(
#         source="supervisor.username"
#     )

#     estate_name = serializers.ReadOnlyField(
#         source="estate.name"
#     )

#     class Meta:
#         model = SupervisorEstateRequest

#         fields = [
#             "id",
#             "supervisor",
#             "supervisor_name",
#             "estate",
#             "estate_name",
#             "status",
#             "message",
#             "requested_at",
#             "responded_at",
#         ]

#         read_only_fields = [
#             "id",
#             "supervisor",
#             "supervisor_name",
#             "estate_name",
#             "status",
#             "requested_at",
#             "responded_at",
#         ]


# # =========================================================
# # 12. EXPENSE SERIALIZER
# # =========================================================

# class ExpenseSerializer(serializers.ModelSerializer):
#     estate_name = serializers.ReadOnlyField(
#         source="estate.name"
#     )

#     recorded_by_name = serializers.ReadOnlyField(
#         source="recorded_by.username"
#     )

#     class Meta:
#         model = Expense

#         fields = [
#             "id",
#             "estate",
#             "estate_name",
#             "category",
#             "amount",
#             "description",
#             "expense_date",
#             "recorded_by",
#             "recorded_by_name",
#             "created_at",
#         ]

#         read_only_fields = [
#             "id",
#             "estate_name",
#             "recorded_by",
#             "recorded_by_name",
#             "created_at",
#         ]

#     def validate_amount(self, value):
#         if value <= 0:
#             raise serializers.ValidationError(
#                 "Expense amount must be greater than 0."
#             )

#         return value

#     def validate_description(self, value):
#         if value and value.strip():
#             return value.strip()

#         return value


# # =========================================================
# # 13. PURCHASE ORDER SERIALIZER
# # =========================================================

# class PurchaseOrderSerializer(serializers.ModelSerializer):
#     buyer_name = serializers.ReadOnlyField(
#         source="buyer.username"
#     )

#     buyer_company = serializers.SerializerMethodField()

#     estate_name = serializers.ReadOnlyField(
#         source="estate.name"
#     )

#     class Meta:
#         model = PurchaseOrder

#         fields = [
#             "id",
#             "buyer",
#             "buyer_name",
#             "buyer_company",
#             "estate",
#             "estate_name",
#             "category",
#             "quantity",
#             "unit_price",
#             "total_price",
#             "status",
#             "notes",
#             "created_at",
#             "updated_at",
#         ]

#         read_only_fields = [
#             "id",
#             "buyer",
#             "buyer_name",
#             "buyer_company",
#             "estate_name",
#             "unit_price",
#             "total_price",
#             "status",
#             "created_at",
#             "updated_at",
#         ]

#     def get_buyer_company(self, obj):
#         profile = BuyerProfile.objects.filter(
#             user=obj.buyer
#         ).first()

#         if profile:
#             return profile.company_name

#         return obj.buyer.username

#     def validate(self, attrs):
#         estate = attrs.get("estate")
#         category = attrs.get("category")
#         quantity = attrs.get("quantity")

#         if not estate:
#             raise serializers.ValidationError({
#                 "estate": "Estate is required."
#             })

#         if category not in (
#             "LATEX",
#             "SHEET",
#             "SCRAP",
#         ):
#             raise serializers.ValidationError({
#                 "category": "Invalid product category."
#             })

#         if quantity is None or quantity <= 0:
#             raise serializers.ValidationError({
#                 "quantity": (
#                     "Quantity must be greater than zero."
#                 )
#             })

#         inventory = Inventory.objects.filter(
#             estate=estate,
#             category=category,
#         ).first()

#         if not inventory:
#             raise serializers.ValidationError({
#                 "category": (
#                     "This product is currently not "
#                     "available in the selected estate."
#                 )
#             })

#         if inventory.stock_quantity < quantity:
#             raise serializers.ValidationError({
#                 "quantity": (
#                     f"Only {inventory.stock_quantity} "
#                     f"{inventory.unit} available in stock."
#                 )
#             })

#         return attrs

#     def create(self, validated_data):
#         estate = validated_data["estate"]
#         category = validated_data["category"]
#         quantity = validated_data["quantity"]

#         inventory = Inventory.objects.filter(
#             estate=estate,
#             category=category,
#         ).first()

#         if not inventory:
#             raise serializers.ValidationError({
#                 "category": (
#                     "Inventory not found for the "
#                     "selected product."
#                 )
#             })

#         unit_price = inventory.unit_price
#         total_price = quantity * unit_price

#         request = self.context.get("request")

#         if not request:
#             raise serializers.ValidationError({
#                 "buyer": (
#                     "Authenticated user is required."
#                 )
#             })

#         if not request.user.is_authenticated:
#             raise serializers.ValidationError({
#                 "buyer": (
#                     "Authenticated user is required."
#                 )
#             })

#         order = PurchaseOrder.objects.create(
#             buyer=request.user,
#             estate=estate,
#             category=category,
#             quantity=quantity,
#             unit_price=unit_price,
#             total_price=total_price,
#             status="PENDING",
#             notes=validated_data.get("notes", ""),
#         )

#         return order


# # =========================================================
# # 14. INVOICE SERIALIZER
# # =========================================================

# class InvoiceSerializer(serializers.ModelSerializer):
#     buyer_name = serializers.ReadOnlyField(
#         source="order.buyer.username"
#     )

#     order_number = serializers.ReadOnlyField(
#         source="order.id"
#     )

#     class Meta:
#         model = Invoice

#         fields = [
#             "id",
#             "order",
#             "order_number",
#             "buyer_name",
#             "invoice_number",
#             "amount",
#             "payment_status",
#             "payment_method",
#             "transaction_reference",
#             "issued_at",
#             "paid_at",
#         ]

#         read_only_fields = [
#             "id",
#             "order",
#             "order_number",
#             "buyer_name",
#             "invoice_number",
#             "amount",
#             "payment_status",
#             "payment_method",
#             "transaction_reference",
#             "issued_at",
#             "paid_at",
#         ]


# # =========================================================
# # 15. PAYMENT SERIALIZER
# # =========================================================

# class PaymentSerializer(serializers.ModelSerializer):
#     buyer_name = serializers.ReadOnlyField(
#         source="buyer.username"
#     )

#     invoice_number = serializers.ReadOnlyField(
#         source="invoice.invoice_number"
#     )

#     class Meta:
#         model = Payment

#         fields = [
#             "id",
#             "invoice",
#             "invoice_number",
#             "buyer",
#             "buyer_name",
#             "amount",
#             "payment_method",
#             "transaction_id",
#             "status",
#             "payment_date",
#             "remarks",
#         ]

#         read_only_fields = [
#             "id",
#             "invoice_number",
#             "buyer",
#             "buyer_name",
#             "status",
#             "payment_date",
#         ]













