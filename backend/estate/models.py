# from django.db import models
# from django.contrib.auth.models import User
# from django.utils import timezone


# # =========================================================
# # SHARED CHOICES
# # =========================================================

# CATEGORY_CHOICES = [
#     ("LATEX", "Latex (Liquid)"),
#     ("SHEET", "Rubber Sheet"),
#     ("SCRAP", "Scrap Rubber"),
# ]

# PAYMENT_METHODS = [
#     ("BANK_TRANSFER", "Bank Transfer / NEFT"),
#     ("UPI", "UPI / Online Payment"),
#     ("CASH", "Cash"),
#     ("RAZORPAY", "Razorpay"),
# ]

# REQUEST_STATUS_CHOICES = [
#     ("PENDING", "Pending"),
#     ("APPROVED", "Approved"),
#     ("REJECTED", "Rejected"),
# ]

# EXPENSE_CATEGORY_CHOICES = [
#     ("LABOUR_WAGE", "Labour Wage"),
#     ("SUPERVISOR_WAGE", "Supervisor Wage"),
#     ("PRODUCTION", "Production"),
#     ("MAINTENANCE", "Maintenance"),
#     ("FERTILIZER", "Fertilizer / Materials"),
#     ("TRANSPORT", "Transport"),
#     ("OTHER", "Other"),
# ]


# # =========================================================
# # 1. ESTATE OWNER PROFILE
# # =========================================================

# class EstateOwnerProfile(models.Model):
#     user = models.OneToOneField(
#         User,
#         on_delete=models.CASCADE,
#         related_name="estate_owner_profile"
#     )
#     phone = models.CharField(max_length=15, blank=True)
#     address = models.TextField(blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.user.username


# # =========================================================
# # 2. ESTATE
# # =========================================================

# class Estate(models.Model):
#     name = models.CharField(max_length=150)

#     owner = models.ForeignKey(
#         User,
#         on_delete=models.CASCADE,
#         related_name="owned_estates"
#     )

#     location = models.CharField(max_length=200)

#     total_area = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         help_text="Total estate area in acres"
#     )

#     description = models.TextField(blank=True)

#     # Workforce capacity
#     max_labour = models.PositiveIntegerField(default=20)

#     max_supervisors = models.PositiveIntegerField(default=2)

#     is_active = models.BooleanField(default=True)

#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.name

#     @property
#     def current_labour_count(self):
#         return self.labours.filter(
#             estate=self
#         ).count()

#     @property
#     def current_supervisor_count(self):
#         return self.supervisors.filter(
#             estate=self
#         ).count()

#     @property
#     def available_labour_slots(self):
#         return max(
#             self.max_labour - self.current_labour_count,
#             0
#         )

#     @property
#     def available_supervisor_slots(self):
#         return max(
#             self.max_supervisors - self.current_supervisor_count,
#             0
#         )


# # =========================================================
# # 3. LABOUR PROFILE
# # =========================================================
# class LabourProfile(models.Model):
#     user = models.OneToOneField(
#         User,
#         on_delete=models.CASCADE,
#         null=True,
#         blank=True
#     )

#     estate = models.ForeignKey(
#         Estate,
#         on_delete=models.SET_NULL,
#         related_name="labours",
#         null=True,
#         blank=True
#     )

#     full_name = models.CharField(max_length=150, default="Worker")
#     phone = models.CharField(max_length=20, blank=True, null=True)

#     address = models.TextField(
#         blank=True,
#         default=""
#     )

#     daily_wage = models.DecimalField(
#         max_digits=8,
#         decimal_places=2,
#         default=0.00
#     )

#     account_holder_name = models.CharField(
#         max_length=150,
#         blank=True
#     )

#     bank_name = models.CharField(
#         max_length=150,
#         blank=True
#     )

#     account_number = models.CharField(
#         max_length=50,
#         blank=True
#     )

#     ifsc_code = models.CharField(
#         max_length=20,
#         blank=True
#     )

#     upi_id = models.CharField(
#         max_length=100,
#         blank=True
#     )

#     created_at = models.DateTimeField(
#         default=timezone.now
#     )

# # =========================================================
# # 4. LABOUR → ESTATE REQUEST
# # =========================================================

# class LabourEstateRequest(models.Model):
#     labour = models.ForeignKey(
#         User,
#         on_delete=models.CASCADE,
#         related_name="labour_estate_requests"
#     )

#     estate = models.ForeignKey(
#         Estate,
#         on_delete=models.CASCADE,
#         related_name="labour_requests"
#     )

#     status = models.CharField(
#         max_length=10,
#         choices=REQUEST_STATUS_CHOICES,
#         default="PENDING"
#     )

#     message = models.TextField(
#         blank=True
#     )

#     requested_at = models.DateTimeField(
#         auto_now_add=True
#     )

#     responded_at = models.DateTimeField(
#         null=True,
#         blank=True
#     )

#     class Meta:
#         ordering = ["-requested_at"]
#         constraints = [
#             models.UniqueConstraint(
#                 fields=["labour", "estate"],
#                 name="unique_labour_estate_request"
#             )
#         ]

#     def __str__(self):
#         return (
#             f"{self.labour.username} → "
#             f"{self.estate.name} ({self.status})"
#         )


# # =========================================================
# # 5. SUPERVISOR PROFILE
# # =========================================================
# class SupervisorProfile(models.Model):
#     user = models.OneToOneField(
#         User,
#         on_delete=models.CASCADE,
#         related_name="supervisor_profile"
#     )

#     # Assigned after Estate Owner/Admin approval
#     estate = models.ForeignKey(
#         Estate,
#         on_delete=models.SET_NULL,
#         related_name="supervisors",
#         null=True,
#         blank=True
#     )

#     full_name = models.CharField(
#         max_length=150
#     )

#     phone = models.CharField(
#         max_length=15,
#         blank=True
#     )

#     created_at = models.DateTimeField(
#         auto_now_add=True
#     )

#     def __str__(self):
#         return f"{self.full_name} - Supervisor"


# # =========================================================
# # 6. SUPERVISOR → ESTATE REQUEST
# # =========================================================

# class SupervisorEstateRequest(models.Model):
#     supervisor = models.ForeignKey(
#         User,
#         on_delete=models.CASCADE,
#         related_name="supervisor_estate_requests"
#     )

#     estate = models.ForeignKey(
#         Estate,
#         on_delete=models.CASCADE,
#         related_name="supervisor_requests"
#     )

#     status = models.CharField(
#         max_length=10,
#         choices=REQUEST_STATUS_CHOICES,
#         default="PENDING"
#     )

#     message = models.TextField(
#         blank=True
#     )

#     requested_at = models.DateTimeField(
#         auto_now_add=True
#     )

#     responded_at = models.DateTimeField(
#         null=True,
#         blank=True
#     )

#     class Meta:
#         ordering = ["-requested_at"]
#         constraints = [
#             models.UniqueConstraint(
#                 fields=["supervisor", "estate"],
#                 name="unique_supervisor_estate_request"
#             )
#         ]

#     def __str__(self):
#         return (
#             f"{self.supervisor.username} → "
#             f"{self.estate.name} ({self.status})"
#         )


# # =========================================================
# # 7. ATTENDANCE
# # =========================================================

# class Attendance(models.Model):

#     STATUS_CHOICES = [
#         ("PRESENT", "Present"),
#         ("ABSENT", "Absent"),
#         ("HALF_DAY", "Half Day"),
#     ]

#     labour = models.ForeignKey(
#         User,
#         on_delete=models.CASCADE,
#         related_name="attendances"
#     )

#     estate = models.ForeignKey(
#         Estate,
#         on_delete=models.CASCADE,
#         related_name="attendance_logs",
#         null=True,
#         blank=True
#     )

#     date = models.DateField(
#         default=timezone.now
#     )

#     status = models.CharField(
#         max_length=10,
#         choices=STATUS_CHOICES,
#         default="PRESENT"
#     )

#     assigned_block = models.CharField(
#         max_length=50,
#         blank=True
#     )

#     remarks = models.TextField(
#         blank=True
#     )

#     recorded_by = models.ForeignKey(
#         User,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name="recorded_attendances"
#     )

#     class Meta:
#         unique_together = ("labour", "date")
#         ordering = ["-date"]
#         verbose_name_plural = "Attendance"

#     def __str__(self):
#         return (
#             f"{self.labour.username} - "
#             f"{self.date} ({self.status})"
#         )


# # =========================================================
# # 8. TAPPING / DAILY HARVEST RECORD
# # =========================================================

# class TappingRecord(models.Model):

#     labour = models.ForeignKey(
#         User,
#         on_delete=models.CASCADE,
#         related_name="worker_tapping_records"
#     )

#     estate = models.ForeignKey(
#         Estate,
#         on_delete=models.CASCADE,
#         related_name="estate_tapping_records",
#         null=True,
#         blank=True
#     )

#     date = models.DateField(
#         default=timezone.now
#     )

#     category = models.CharField(
#         max_length=10,
#         choices=CATEGORY_CHOICES,
#         default="LATEX"
#     )

#     quantity = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         help_text="Raw quantity in liters or kg"
#     )

#     unit = models.CharField(
#         max_length=10,
#         default="KG"
#     )

#     assigned_block = models.CharField(
#         max_length=100,
#         blank=True,
#         default=""
#     )

#     is_verified = models.BooleanField(
#         default=False
#     )

#     remarks = models.TextField(
#         blank=True,
#         default=""
#     )

#     created_at = models.DateTimeField(
#     default=timezone.now
#     )

#     class Meta:
#         ordering = ["-date"]

#     def __str__(self):
#         return (
#             f"{self.labour.username} - "
#             f"{self.quantity} {self.category} "
#             f"({self.date})"
#         )


# # =========================================================
# # 9. PRODUCTION / SUPERVISOR VERIFICATION
# # =========================================================

# class Production(models.Model):

#     tapping_record = models.OneToOneField(
#         TappingRecord,
#         on_delete=models.CASCADE,
#         related_name="production"
#     )

#     verified_by = models.ForeignKey(
#         User,
#         on_delete=models.CASCADE,
#         related_name="verified_productions"
#     )

#     verified_quantity = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         help_text="Measured and approved net yield"
#     )

#     calculated_wage = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         help_text="Calculated wage for this harvest"
#     )

#     verification_remarks = models.TextField(
#         blank=True
#     )

#     verified_at = models.DateTimeField(
#         auto_now_add=True
#     )

#     def __str__(self):
#         return (
#             f"Production #{self.id} - "
#             f"Verified: {self.verified_quantity} "
#             f"(Wage: Rs. {self.calculated_wage})"
#         )


# # =========================================================
# # 10. INVENTORY
# # =========================================================

# class Inventory(models.Model):

#     estate = models.ForeignKey(
#         Estate,
#         on_delete=models.CASCADE,
#         related_name="inventories",
#         null=True,
#         blank=True
#     )

#     category = models.CharField(
#         max_length=10,
#         choices=CATEGORY_CHOICES
#     )

#     stock_quantity = models.DecimalField(
#         max_digits=12,
#         decimal_places=2,
#         default=0.00,
#         help_text="Current available stock in Kg/Liters"
#     )

#     unit = models.CharField(
#         max_length=10,
#         default="KG"
#     )

#     unit_price = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         default=180.00,
#         help_text="Price per unit in INR"
#     )

#     last_updated = models.DateTimeField(
#         auto_now=True
#     )

#     class Meta:
#         constraints = [
#             models.UniqueConstraint(
#                 fields=["estate", "category"],
#                 name="unique_estate_inventory_category"
#             )
#         ]

#         verbose_name_plural = "Inventories"

#     def __str__(self):
#         return (
#             f"{self.category}: "
#             f"{self.stock_quantity} available "
#             f"@ Rs. {self.unit_price}/unit"
#         )


# # =========================================================
# # 11. ESTATE EXPENSE
# # =========================================================

# class Expense(models.Model):

#     estate = models.ForeignKey(
#         Estate,
#         on_delete=models.CASCADE,
#         related_name="expenses"
#     )

#     category = models.CharField(
#         max_length=30,
#         choices=EXPENSE_CATEGORY_CHOICES
#     )

#     amount = models.DecimalField(
#         max_digits=12,
#         decimal_places=2
#     )

#     description = models.TextField(
#         blank=True
#     )

#     expense_date = models.DateField(
#         default=timezone.now
#     )

#     recorded_by = models.ForeignKey(
#         User,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name="recorded_expenses"
#     )

#     created_at = models.DateTimeField(
#         auto_now_add=True
#     )

#     class Meta:
#         ordering = ["-expense_date", "-id"]

#     def __str__(self):
#         return (
#             f"{self.estate.name} - "
#             f"{self.category} - "
#             f"Rs. {self.amount}"
#         )


# # =========================================================
# # 12. BUYER PROFILE
# # =========================================================

# class BuyerProfile(models.Model):

#     user = models.OneToOneField(
#         User,
#         on_delete=models.CASCADE,
#         related_name="buyer_profile"
#     )

#     company_name = models.CharField(
#         max_length=200
#     )

#     phone_number = models.CharField(
#         max_length=15,
#         blank=True
#     )

#     email = models.EmailField(
#         blank=True
#     )

#     address = models.TextField(
#         blank=True
#     )

#     gst_number = models.CharField(
#         max_length=20,
#         blank=True
#     )

#     is_approved = models.BooleanField(
#         default=False
#     )

#     created_at = models.DateTimeField(
#         auto_now_add=True
#     )

#     def __str__(self):
#         return self.company_name


# # =========================================================
# # 13. PURCHASE ORDER
# # =========================================================

# class PurchaseOrder(models.Model):

#     STATUS_CHOICES = [
#         ("PENDING", "Pending Approval"),
#         ("APPROVED", "Approved"),
#         ("CANCELLED", "Cancelled"),
#         ("COMPLETED", "Completed"),
#     ]

#     buyer = models.ForeignKey(
#         User,
#         on_delete=models.CASCADE,
#         related_name="purchase_orders"
#     )

#     estate = models.ForeignKey(
#         Estate,
#         on_delete=models.CASCADE,
#         related_name="purchase_orders"
#     )

#     category = models.CharField(
#         max_length=10,
#         choices=CATEGORY_CHOICES
#     )

#     quantity = models.DecimalField(
#         max_digits=10,
#         decimal_places=2
#     )

#     unit_price = models.DecimalField(
#         max_digits=10,
#         decimal_places=2
#     )

#     total_price = models.DecimalField(
#         max_digits=12,
#         decimal_places=2
#     )

#     status = models.CharField(
#         max_length=10,
#         choices=STATUS_CHOICES,
#         default="PENDING"
#     )

#     notes = models.TextField(
#         blank=True
#     )

#     created_at = models.DateTimeField(
#         auto_now_add=True
#     )

#     updated_at = models.DateTimeField(
#         auto_now=True
#     )

#     def __str__(self):
#         return (
#             f"Order #{self.id} by "
#             f"{self.buyer.username} ({self.status})"
#         )


# # =========================================================
# # 14. INVOICE
# # =========================================================

# class Invoice(models.Model):

#     PAYMENT_STATUS_CHOICES = [
#         ("UNPAID", "Unpaid"),
#         ("PARTIAL", "Partially Paid"),
#         ("PAID", "Paid"),
#         ("REFUNDED", "Refunded"),
#     ]

#     order = models.OneToOneField(
#         PurchaseOrder,
#         on_delete=models.CASCADE,
#         related_name="invoice"
#     )

#     invoice_number = models.CharField(
#         max_length=50,
#         unique=True
#     )

#     amount = models.DecimalField(
#         max_digits=12,
#         decimal_places=2
#     )

#     payment_status = models.CharField(
#         max_length=10,
#         choices=PAYMENT_STATUS_CHOICES,
#         default="UNPAID"
#     )

#     payment_method = models.CharField(
#     max_length=20,
#     choices=PAYMENT_METHODS
# )

#     transaction_reference = models.CharField(
#         max_length=100,
#         blank=True,
#         null=True
#     )

#     issued_at = models.DateTimeField(
#         auto_now_add=True
#     )

#     paid_at = models.DateTimeField(
#         blank=True,
#         null=True
#     )

#     def __str__(self):
#         return (
#             f"Invoice {self.invoice_number} - "
#             f"Rs. {self.amount} "
#             f"({self.payment_status})"
#         )


# # =========================================================
# # 15. PAYMENT
# # =========================================================

# class Payment(models.Model):

#     STATUS_CHOICES = [
#         ("PENDING", "Pending"),
#         ("SUCCESS", "Successful"),
#         ("FAILED", "Failed"),
#         ("REFUNDED", "Refunded"),
#     ]

#     invoice = models.ForeignKey(
#         Invoice,
#         on_delete=models.CASCADE,
#         related_name="payments"
#     )

#     buyer = models.ForeignKey(
#         User,
#         on_delete=models.CASCADE,
#         related_name="buyer_payments"
#     )

#     amount = models.DecimalField(
#         max_digits=12,
#         decimal_places=2
#     )

#     payment_method = models.CharField(
#         max_length=20,
#         choices=PAYMENT_METHODS
#     )

#     transaction_id = models.CharField(
#         max_length=100,
#         blank=True
#     )

#     status = models.CharField(
#         max_length=10,
#         choices=STATUS_CHOICES,
#         default="PENDING"
#     )

#     payment_date = models.DateTimeField(
#         auto_now_add=True
#     )

#     remarks = models.TextField(
#         blank=True
#     )

#     def __str__(self):
#         return (
#             f"Payment #{self.id} - "
#             f"Rs. {self.amount} "
#             f"({self.status})"
#         )





from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


# =========================================================
# COMMON CHOICES
# =========================================================

CATEGORY_CHOICES = [
    ("LATEX", "Latex"),
    ("SHEET", "Sheet Rubber"),
    ("SCRAP", "Scrap Rubber"),
]

PAYMENT_METHODS = [
    ("BANK_TRANSFER", "Bank Transfer"),
    ("UPI", "UPI"),
    ("CASH", "Cash"),
    ("RAZORPAY", "Razorpay"),
]

REQUEST_STATUS_CHOICES = [
    ("PENDING", "Pending"),
    ("APPROVED", "Approved"),
    ("REJECTED", "Rejected"),
]

ATTENDANCE_STATUS_CHOICES = [
    ("PRESENT", "Present"),
    ("ABSENT", "Absent"),
    ("HALF_DAY", "Half Day"),
]

EXPENSE_CATEGORY_CHOICES = [
    ("labourE", "Labour Wage"),
    ("PRODUCTION", "Production"),
    ("MAINTENANCE", "Maintenance"),
    ("FERTILIZER", "Fertilizer"),
    ("TRANSPORT", "Transport"),
    ("OTHER", "Other"),
]


# =========================================================
# ESTATE OWNER PROFILE
# =========================================================

class EstateOwnerProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="estate_owner_profile",
    )
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Estate Owner: {self.user.username}"


# =========================================================
# ESTATE
# =========================================================

class Estate(models.Model):
    name = models.CharField(max_length=150)

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="owned_estates",
    )

    location = models.CharField(max_length=255)
    total_area = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    description = models.TextField(blank=True)

    max_labour = models.PositiveIntegerField(default=20)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def current_labour_count(self):
        return self.labours.count()

    @property
    def available_labour_slots(self):
        return max(
            0,
            self.max_labour - self.current_labour_count,
        )

    def __str__(self):
        return self.name


# =========================================================
# LABOUR PROFILE
# =========================================================

class LabourProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="labourprofile",
        null=True,
        blank=True,
    )

    estate = models.ForeignKey(
        Estate,
        on_delete=models.SET_NULL,
        related_name="labours",
        null=True,
        blank=True,
    )

    full_name = models.CharField(
        max_length=150,
        default="Worker",
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )
    address = models.TextField(blank=True)

    daily_wage = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    bank_name = models.CharField(max_length=100, blank=True)
    account_number = models.CharField(max_length=50, blank=True)
    ifsc_code = models.CharField(max_length=20, blank=True)
    upi_id = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(
        default=timezone.now,
    )

    def __str__(self):
        return self.full_name


# =========================================================
# LABOUR ESTATE REQUEST
# =========================================================

class LabourEstateRequest(models.Model):
    labour = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="labour_estate_requests",
    )

    estate = models.ForeignKey(
        Estate,
        on_delete=models.CASCADE,
        related_name="labour_requests",
    )

    status = models.CharField(
        max_length=20,
        choices=REQUEST_STATUS_CHOICES,
        default="PENDING",
    )

    message = models.TextField(blank=True)

    requested_at = models.DateTimeField(
        auto_now_add=True,
    )
    responded_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        unique_together = ("labour", "estate")
        ordering = ["-requested_at"]

    def __str__(self):
        return (
            f"{self.labour.username} - "
            f"{self.estate.name} ({self.status})"
        )


# =========================================================
# ATTENDANCE
# Managed by Admin / Estate Owner
# Labour can view their own attendance
# =========================================================

class Attendance(models.Model):
    labour = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="attendances",
    )

    estate = models.ForeignKey(
        Estate,
        on_delete=models.SET_NULL,
        related_name="attendance_logs",
        null=True,
        blank=True,
    )

    date = models.DateField(default=timezone.localdate)

    status = models.CharField(
        max_length=20,
        choices=ATTENDANCE_STATUS_CHOICES,
        default="PRESENT",
    )

    assigned_block = models.CharField(
        max_length=100,
        blank=True,
    )
    remarks = models.TextField(blank=True)

    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="recorded_attendances",
        null=True,
        blank=True,
    )

    class Meta:
        unique_together = ("labour", "date")
        ordering = ["-date"]

    def __str__(self):
        return (
            f"{self.labour.username} - "
            f"{self.date} - {self.status}"
        )


# =========================================================
# TAPPING / HARVEST RECORD
# =========================================================

class TappingRecord(models.Model):
    labour = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="worker_tapping_records",
    )

    estate = models.ForeignKey(
        Estate,
        on_delete=models.SET_NULL,
        related_name="estate_tapping_records",
        null=True,
        blank=True,
    )

    date = models.DateField(default=timezone.localdate)

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
    )

    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    unit = models.CharField(
        max_length=20,
        default="KG",
    )

    assigned_block = models.CharField(
        max_length=100,
        blank=True,
    )

    is_verified = models.BooleanField(default=False)
    remarks = models.TextField(blank=True)

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-date", "-id"]

    def __str__(self):
        return (
            f"{self.labour.username} - "
            f"{self.category} - {self.quantity} {self.unit}"
        )


# =========================================================
# VERIFIED PRODUCTION
# =========================================================

class Production(models.Model):
    tapping_record = models.OneToOneField(
        TappingRecord,
        on_delete=models.CASCADE,
        related_name="production",
    )

    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="verified_productions",
        null=True,
        blank=True,
    )

    verified_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    calculated_wage = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    verification_remarks = models.TextField(blank=True)

    verified_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return (
            f"Production #{self.pk} - "
            f"{self.verified_quantity}"
        )


# =========================================================
# INVENTORY
# =========================================================

class Inventory(models.Model):
    estate = models.ForeignKey(
        Estate,
        on_delete=models.CASCADE,
        related_name="inventories",
        null=True,
        blank=True,
    )

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
    )

    stock_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    unit = models.CharField(
        max_length=20,
        default="KG",
    )

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=180,
    )

    last_updated = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        unique_together = ("estate", "category")

    def __str__(self):
        return (
            f"{self.category} - "
            f"{self.stock_quantity} {self.unit}"
        )


# =========================================================
# ESTATE EXPENSES
# =========================================================

class Expense(models.Model):
    estate = models.ForeignKey(
        Estate,
        on_delete=models.CASCADE,
        related_name="expenses",
    )

    category = models.CharField(
        max_length=30,
        choices=EXPENSE_CATEGORY_CHOICES,
        default="OTHER",
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    description = models.TextField(blank=True)

    expense_date = models.DateField(
        default=timezone.localdate,
    )

    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="recorded_expenses",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-expense_date", "-id"]

    def __str__(self):
        return (
            f"{self.category} - "
            f"₹{self.amount}"
        )


# =========================================================
# B2B BUYER PROFILE
# =========================================================

class BuyerProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="buyer_profile",
    )

    company_name = models.CharField(
        max_length=200,
    )

    phone_number = models.CharField(
        max_length=20,
        blank=True,
    )

    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)

    gst_number = models.CharField(
        max_length=20,
        blank=True,
    )

    is_approved = models.BooleanField(default=False)

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return self.company_name


# =========================================================
# B2B PURCHASE ORDER
# =========================================================

class PurchaseOrder(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("CANCELLED", "Cancelled"),
        ("COMPLETED", "Completed"),
    ]

    buyer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="purchase_orders",
    )

    estate = models.ForeignKey(
        Estate,
        on_delete=models.CASCADE,
        related_name="purchase_orders",
    )

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
    )

    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    total_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING",
    )

    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"Order #{self.pk} - "
            f"{self.buyer.username}"
        )


# =========================================================
# INVOICE
# =========================================================

class Invoice(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ("UNPAID", "Unpaid"),
        ("PARTIAL", "Partially Paid"),
        ("PAID", "Paid"),
        ("REFUNDED", "Refunded"),
    ]

    order = models.OneToOneField(
        PurchaseOrder,
        on_delete=models.CASCADE,
        related_name="invoice",
    )

    invoice_number = models.CharField(
        max_length=50,
        unique=True,
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="UNPAID",
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS,
    )

    transaction_reference = models.CharField(
        max_length=200,
        blank=True,
        null=True,
    )

    issued_at = models.DateTimeField(
        auto_now_add=True,
    )

    paid_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.invoice_number


# =========================================================
# B2B INVOICE PAYMENT
# This model is for buyer invoice payments, not labour wages.
# =========================================================

class Payment(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("SUCCESS", "Success"),
        ("FAILED", "Failed"),
        ("REFUNDED", "Refunded"),
    ]

    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name="payments",
    )

    buyer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="buyer_payments",
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS,
    )

    transaction_id = models.CharField(
        max_length=200,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING",
    )

    payment_date = models.DateTimeField(
        auto_now_add=True,
    )

    remarks = models.TextField(blank=True)

    class Meta:
        ordering = ["-payment_date"]

    def __str__(self):
        return (
            f"Payment #{self.pk} - "
            f"₹{self.amount} - {self.status}"
        )



# =========================================================
# LABOUR WAGE PAYMENT
# Separate from B2B buyer invoice payments
# =========================================================

class LabourWagePayment(models.Model):

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PAID", "Paid"),
        ("FAILED", "Failed"),
        ("CANCELLED", "Cancelled"),
    ]

    labour = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="labour_wage_payments",
    )

    estate = models.ForeignKey(
        Estate,
        on_delete=models.PROTECT,
        related_name="labour_wage_payments",
    )

    period_start = models.DateField()
    period_end = models.DateField()

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    payment_date = models.DateField(
        default=timezone.localdate,
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS,
        default="CASH",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PAID",
    )

    transaction_reference = models.CharField(
        max_length=200,
        blank=True,
    )

    remarks = models.TextField(blank=True)

    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="recorded_labour_wage_payments",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-payment_date", "-id"]

    def __str__(self):
        return (
            f"Wage Payment #{self.pk} - "
            f"{self.labour.username} - ₹{self.amount}"
        )


































































# from django.db import models
# from django.contrib.auth.models import User
# from django.utils import timezone

# # Shared Choices
# CATEGORY_CHOICES = [
#     ("LATEX", "Latex (Liquid)"),
#     ("SHEET", "Rubber Sheet"),
#     ("SCRAP", "Scrap Rubber"),
# ]

# PAYMENT_METHODS = [
#     ("BANK_TRANSFER", "Bank Transfer / NEFT"),
#     ("UPI", "UPI / Online Payment"),
#     ("CASH", "Cash"),
# ]


# # =========================================================
# # 1. ESTATE
# # =========================================================
# class Estate(models.Model):
#     name = models.CharField(max_length=150)
#     owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owned_estates")
#     location = models.CharField(max_length=200)
#     total_area = models.DecimalField(max_digits=10, decimal_places=2, help_text="Total estate area in acres")
#     description = models.TextField(blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.name


# # =========================================================
# # 2. LABOUR PROFILE
# # =========================================================


# class LabourProfile(models.Model):
#     user = models.OneToOneField(
#         User, 
#         on_delete=models.CASCADE, 
#         null=True, 
#         blank=True
#     )
#     estate = models.ForeignKey(
#     'Estate',
#     on_delete=models.CASCADE,
#     related_name='labours',
#     null=True,
#     blank=True
# )
#     full_name = models.CharField(max_length=150, default='Worker')
#     phone = models.CharField(max_length=20, blank=True, null=True)
#     daily_wage = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
#     created_at = models.DateTimeField(default=timezone.now)

#     def __str__(self):
#         return self.full_name


# # =========================================================
# # 3. ATTENDANCE
# # =========================================================
# class Attendance(models.Model):
#     STATUS_CHOICES = [
#         ("PRESENT", "Present"),
#         ("ABSENT", "Absent"),
#         ("HALF_DAY", "Half Day"),
#     ]

#     labour = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendances")
#     estate = models.ForeignKey(Estate, on_delete=models.CASCADE, related_name="attendance_logs", null=True, blank=True)
#     date = models.DateField(default=timezone.now)
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="PRESENT")
#     assigned_block = models.CharField(max_length=50, blank=True)
#     remarks = models.TextField(blank=True)

#     class Meta:
#         unique_together = ("labour", "date")
#         ordering = ["-date"]
#         verbose_name_plural = "Attendance"

#     def __str__(self):
#         return f"{self.labour.username} - {self.date} ({self.status})"


# # =========================================================
# # 4. TAPPING RECORD
# # =========================================================
# class TappingRecord(models.Model):
#     labour = models.ForeignKey(
#         User,
#         on_delete=models.CASCADE,
#         related_name="worker_tapping_records"
#     )
#     estate = models.ForeignKey(
#         Estate,
#         on_delete=models.CASCADE,
#         related_name="estate_tapping_records",
#         null=True,
#         blank=True
#     )
#     date = models.DateField(default=timezone.now)
#     category = models.CharField(
#         max_length=10,
#         choices=CATEGORY_CHOICES,
#         default="LATEX"
#     )
#     quantity = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         help_text="Raw quantity in liters or kg"
#     )
#     unit = models.CharField(max_length=10, default="KG")
#     assigned_block = models.CharField(
#         max_length=100,
#         blank=True,
#         default=""
#     )
#     is_verified = models.BooleanField(default=False)
#     remarks = models.TextField(blank=True, default="")

#     class Meta:
#         ordering = ["-date"]

#     def __str__(self):
#         return (
#             f"{self.labour.username} - "
#             f"{self.quantity} {self.category} ({self.date})"
#         )


# # =========================================================
# # 5. PRODUCTION / SUPERVISOR VERIFICATION
# # =========================================================
# class Production(models.Model):
#     tapping_record = models.OneToOneField(TappingRecord, on_delete=models.CASCADE, related_name="production")
#     verified_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="verified_productions")
#     verified_quantity = models.DecimalField(max_digits=10, decimal_places=2, help_text="Measured and approved net yield")
#     calculated_wage = models.DecimalField(max_digits=10, decimal_places=2, help_text="Calculated wage for this yield")
#     verification_remarks = models.TextField(blank=True)
#     verified_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Production #{self.id} - Verified: {self.verified_quantity} (Wage: Rs. {self.calculated_wage})"


# # =========================================================
# # 6. INVENTORY
# # =========================================================
# class Inventory(models.Model):
#     estate = models.ForeignKey(Estate, on_delete=models.CASCADE, related_name="inventories", null=True, blank=True)
#     category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
#     stock_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Current available stock in Kg/Liters")
#     unit = models.CharField(max_length=10, default="KG")
#     unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=180.00, help_text="Price per unit in INR")
#     last_updated = models.DateTimeField(auto_now=True)

#     class Meta:
#         constraints = [
#             models.UniqueConstraint(fields=["estate", "category"], name="unique_estate_inventory_category")
#         ]
#         verbose_name_plural = "Inventories"

#     def __str__(self):
#         return f"{self.category}: {self.stock_quantity} available @ Rs. {self.unit_price}/unit"


# # =========================================================
# # 7. BUYER PROFILE
# # =========================================================
# class BuyerProfile(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="buyer_profile")
#     company_name = models.CharField(max_length=200)
#     phone_number = models.CharField(max_length=15, blank=True)
#     email = models.EmailField(blank=True)
#     address = models.TextField(blank=True)
#     gst_number = models.CharField(max_length=20, blank=True)
#     is_approved = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.company_name
    
    
    
# class SupervisorProfile(models.Model):
#     user = models.OneToOneField(
#         User,
#         on_delete=models.CASCADE,
#         related_name='supervisor_profile'
#     )

#     estate = models.ForeignKey(
#         Estate,
#         on_delete=models.CASCADE,
#         related_name='supervisors'
#     )

#     full_name = models.CharField(max_length=150)

#     phone = models.CharField(max_length=15, blank=True)

#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.full_name} - Supervisor"

# # =========================================================
# # 8. PURCHASE ORDER
# # =========================================================
# class PurchaseOrder(models.Model):
#     STATUS_CHOICES = [
#         ("PENDING", "Pending Approval"),
#         ("APPROVED", "Approved"),
#         ("CANCELLED", "Cancelled"),
#         ("COMPLETED", "Completed"),
#     ]

#     buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="purchase_orders")
#     estate = models.ForeignKey(Estate, on_delete=models.CASCADE, related_name="purchase_orders")
#     category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
#     quantity = models.DecimalField(max_digits=10, decimal_places=2, help_text="Volume requested by buyer")
#     unit_price = models.DecimalField(max_digits=10, decimal_places=2)
#     total_price = models.DecimalField(max_digits=12, decimal_places=2)
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="PENDING")
#     notes = models.TextField(blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"Order #{self.id} by {self.buyer.username} ({self.status})"


# # =========================================================
# # 9. INVOICE
# # =========================================================
# class Invoice(models.Model):
#     PAYMENT_STATUS_CHOICES = [
#         ("UNPAID", "Unpaid"),
#         ("PARTIAL", "Partially Paid"),
#         ("PAID", "Paid"),
#         ("REFUNDED", "Refunded"),
#     ]

#     order = models.OneToOneField(PurchaseOrder, on_delete=models.CASCADE, related_name="invoice")
#     invoice_number = models.CharField(max_length=50, unique=True)
#     amount = models.DecimalField(max_digits=12, decimal_places=2)
#     payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default="UNPAID")
#     payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, blank=True, null=True)
#     transaction_reference = models.CharField(max_length=100, blank=True, null=True)
#     issued_at = models.DateTimeField(auto_now_add=True)
#     paid_at = models.DateTimeField(blank=True, null=True)

#     def __str__(self):
#         return f"Invoice {self.invoice_number} - Rs. {self.amount} ({self.payment_status})"


# # =========================================================
# # 10. PAYMENT
# # =========================================================
# class Payment(models.Model):
#     STATUS_CHOICES = [
#         ("PENDING", "Pending"),
#         ("SUCCESS", "Successful"),
#         ("FAILED", "Failed"),
#         ("REFUNDED", "Refunded"),
#     ]

#     invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="payments")
#     buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="buyer_payments")
#     amount = models.DecimalField(max_digits=12, decimal_places=2)
#     payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
#     transaction_id = models.CharField(max_length=100, blank=True)
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="PENDING")
#     payment_date = models.DateTimeField(auto_now_add=True)
#     remarks = models.TextField(blank=True)

#     def __str__(self):
#         return f"Payment #{self.id} - Rs. {self.amount} ({self.status})"