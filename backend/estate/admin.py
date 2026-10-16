# from django.contrib import admin

# from .models import (
#     Estate,
#     EstateOwnerProfile,
#     LabourProfile,
#     LabourEstateRequest,
#     SupervisorProfile,
#     SupervisorEstateRequest,
#     Attendance,
#     TappingRecord,
#     Production,
#     Inventory,
#     Expense,
#     BuyerProfile,
#     PurchaseOrder,
#     Invoice,
#     Payment,
# )


# @admin.register(Estate)
# class EstateAdmin(admin.ModelAdmin):

#     list_display = (
#         'id',
#         'name',
#         'owner',
#         'location',
#         'total_area',
#         'max_labour',
#         'max_supervisors',
#         'is_active',
#         'created_at',
#     )

#     list_filter = (
#         'is_active',
#     )

#     search_fields = (
#         'name',
#         'location',
#         'owner__username',
#     )


# @admin.register(EstateOwnerProfile)
# class EstateOwnerProfileAdmin(admin.ModelAdmin):

#     list_display = (
#         'id',
#         'user',
#         'phone',
#         'address',
#         'created_at',
#     )

#     search_fields = (
#         'user__username',
#         'phone',
#         'address',
#     )


# @admin.register(LabourProfile)
# class LabourProfileAdmin(admin.ModelAdmin):

#     list_display = (
#         'id',
#         'full_name',
#         'user',
#         'estate',
#         'phone',
#         'daily_wage',
#         'bank_name',
#         'account_number',
#         'created_at',
#     )

#     search_fields = (
#         'full_name',
#         'user__username',
#         'phone',
#         'bank_name',
#         'account_number',
#         'ifsc_code',
#         'upi_id',
#     )

#     list_filter = (
#         'estate',
#     )


# @admin.register(LabourEstateRequest)
# class LabourEstateRequestAdmin(admin.ModelAdmin):

#     list_display = (
#         'id',
#         'labour',
#         'estate',
#         'status',
#         'requested_at',
#         'responded_at',
#     )

#     list_filter = (
#         'status',
#         'estate',
#         'requested_at',
#     )

#     search_fields = (
#         'labour__username',
#         'estate__name',
#     )

#     readonly_fields = (
#         'requested_at',
#         'responded_at',
#     )


# @admin.register(SupervisorProfile)
# class SupervisorProfileAdmin(admin.ModelAdmin):

#     list_display = (
#         'id',
#         'full_name',
#         'user',
#         'estate',
#         'phone',
#         'created_at',
#     )

#     search_fields = (
#         'full_name',
#         'user__username',
#         'phone',
#     )

#     list_filter = (
#         'estate',
#     )


# @admin.register(SupervisorEstateRequest)
# class SupervisorEstateRequestAdmin(admin.ModelAdmin):

#     list_display = (
#         'id',
#         'supervisor',
#         'estate',
#         'status',
#         'requested_at',
#         'responded_at',
#     )

#     list_filter = (
#         'status',
#         'estate',
#         'requested_at',
#     )

#     search_fields = (
#         'supervisor__username',
#         'estate__name',
#     )

#     readonly_fields = (
#         'requested_at',
#         'responded_at',
#     )


# @admin.register(Attendance)
# class AttendanceAdmin(admin.ModelAdmin):

#     list_display = (
#         'id',
#         'labour',
#         'estate',
#         'date',
#         'status',
#         'assigned_block',
#     )

#     list_filter = (
#         'status',
#         'estate',
#         'date',
#     )

#     search_fields = (
#         'labour__username',
#         'assigned_block',
#     )


# @admin.register(TappingRecord)
# class TappingRecordAdmin(admin.ModelAdmin):

#     list_display = (
#         'id',
#         'labour',
#         'estate',
#         'date',
#         'category',
#         'quantity',
#         'unit',
#         'assigned_block',
#         'is_verified',
#     )

#     list_filter = (
#         'category',
#         'is_verified',
#         'estate',
#         'date',
#     )

#     search_fields = (
#         'labour__username',
#         'assigned_block',
#     )


# @admin.register(Production)
# class ProductionAdmin(admin.ModelAdmin):

#     list_display = (
#         'id',
#         'tapping_record',
#         'verified_by',
#         'verified_quantity',
#         'calculated_wage',
#         'verified_at',
#     )

#     search_fields = (
#         'verified_by__username',
#     )


# @admin.register(Inventory)
# class InventoryAdmin(admin.ModelAdmin):

#     list_display = (
#         'id',
#         'estate',
#         'category',
#         'stock_quantity',
#         'unit',
#         'unit_price',
#         'last_updated',
#     )

#     list_filter = (
#         'estate',
#         'category',
#     )

#     search_fields = (
#         'category',
#     )


# @admin.register(Expense)
# class ExpenseAdmin(admin.ModelAdmin):

#     list_display = (
#         'id',
#         'estate',
#         'category',
#         'amount',
#         'expense_date',
#         'recorded_by',
#         'created_at',
#     )

#     list_filter = (
#         'estate',
#         'category',
#         'expense_date',
#     )

#     search_fields = (
#         'estate__name',
#         'category',
#         'description',
#         'recorded_by__username',
#     )

#     readonly_fields = (
#         'created_at',
#     )


# @admin.register(BuyerProfile)
# class BuyerProfileAdmin(admin.ModelAdmin):

#     list_display = (
#         'id',
#         'user',
#         'company_name',
#         'phone_number',
#         'email',
#         'gst_number',
#         'is_approved',
#         'created_at',
#     )

#     list_filter = (
#         'is_approved',
#     )

#     search_fields = (
#         'user__username',
#         'company_name',
#         'email',
#         'gst_number',
#     )


# @admin.register(PurchaseOrder)
# class PurchaseOrderAdmin(admin.ModelAdmin):

#     list_display = (
#         'id',
#         'buyer',
#         'estate',
#         'category',
#         'quantity',
#         'unit_price',
#         'total_price',
#         'status',
#         'created_at',
#     )

#     list_filter = (
#         'status',
#         'category',
#         'estate',
#     )

#     search_fields = (
#         'buyer__username',
#         'category',
#     )


# @admin.register(Invoice)
# class InvoiceAdmin(admin.ModelAdmin):

#     list_display = (
#         'id',
#         'invoice_number',
#         'order',
#         'amount',
#         'payment_status',
#         'payment_method',
#         'issued_at',
#         'paid_at',
#     )

#     list_filter = (
#         'payment_status',
#         'payment_method',
#     )

#     search_fields = (
#         'invoice_number',
#     )


# @admin.register(Payment)
# class PaymentAdmin(admin.ModelAdmin):

#     list_display = (
#         'id',
#         'invoice',
#         'buyer',
#         'amount',
#         'payment_method',
#         'transaction_id',
#         'status',
#         'payment_date',
#     )

#     list_filter = (
#         'status',
#         'payment_method',
#         'payment_date',
#     )

#     search_fields = (
#         'buyer__username',
#         'transaction_id',
#     )

from django.contrib import admin
from .models import (
    EstateOwnerProfile,
    Estate,
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
)


@admin.register(EstateOwnerProfile)
class EstateOwnerProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone", "created_at")
    search_fields = ("user__username", "phone")


@admin.register(Estate)
class EstateAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "location", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "location", "owner__username")


@admin.register(LabourProfile)
class LabourProfileAdmin(admin.ModelAdmin):
    list_display = ("full_name", "user", "estate", "phone", "daily_wage")
    search_fields = ("full_name", "user__username", "phone")
    list_filter = ("estate",)


@admin.register(LabourEstateRequest)
class LabourEstateRequestAdmin(admin.ModelAdmin):
    list_display = ("labour", "estate", "status", "requested_at")
    list_filter = ("status",)
    search_fields = ("labour__username", "estate__name")


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("labour", "estate", "date", "status", "recorded_by")
    list_filter = ("status", "date", "estate")
    search_fields = ("labour__username", "assigned_block")


@admin.register(TappingRecord)
class TappingRecordAdmin(admin.ModelAdmin):
    list_display = ("labour", "estate", "date", "category", "quantity", "is_verified")
    list_filter = ("category", "is_verified", "date")
    search_fields = ("labour__username", "assigned_block")


@admin.register(Production)
class ProductionAdmin(admin.ModelAdmin):
    list_display = ("tapping_record", "verified_by", "verified_quantity", "verified_at")
    search_fields = ("tapping_record__labour__username",)


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ("estate", "category", "stock_quantity", "unit", "unit_price")
    list_filter = ("category", "estate")


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("estate", "category", "amount", "expense_date", "recorded_by")
    list_filter = ("category", "expense_date", "estate")
    search_fields = ("description",)


@admin.register(BuyerProfile)
class BuyerProfileAdmin(admin.ModelAdmin):
    list_display = ("company_name", "user", "phone_number", "is_approved")
    list_filter = ("is_approved",)
    search_fields = ("company_name", "user__username", "email")


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ("id", "buyer", "estate", "category", "quantity", "total_price", "status")
    list_filter = ("status", "category")
    search_fields = ("buyer__username", "estate__name")


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "order", "amount", "payment_status", "issued_at")
    list_filter = ("payment_status",)
    search_fields = ("invoice_number",)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "invoice", "buyer", "amount", "payment_method", "status")
    list_filter = ("status", "payment_method")
    search_fields = ("buyer__username", "transaction_id")
