
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    # ViewSets
    EstateViewSet,
    EstateOwnerProfileViewSet,
    LabourProfileViewSet,
    LabourEstateRequestViewSet,
    AttendanceViewSet,
    TappingRecordViewSet,
    ProductionViewSet,
    InventoryViewSet,
    ExpenseViewSet,
    BuyerProfileViewSet,
    PurchaseOrderViewSet,
    InvoiceViewSet,
    PaymentViewSet,
    LabourWagePaymentViewSet,

    # Other API views
    CurrentUserRoleView,
    RegisterLabourView,
    RegisterBuyerView,
    RegisterEstateOwnerView,
      CheckRazorpayOrderView,

    # CSV exports
    export_payroll_csv,
    export_sales_csv,
    export_my_orders_csv,

    # Razorpay
    CreateRazorpayOrderView,
    VerifyRazorpayPaymentView,
)


# =====================================================
# ROUTER
# =====================================================

router = DefaultRouter()

router.register(
    r'estates',
    EstateViewSet,
    basename='estate',
)

router.register(
    r'estate-owner-profiles',
    EstateOwnerProfileViewSet,
    basename='estate-owner-profile',
)

router.register(
    r'labour-profiles',
    LabourProfileViewSet,
    basename='labour-profile',
)

router.register(
    r'labour-estate-requests',
    LabourEstateRequestViewSet,
    basename='labour-estate-request',
)

router.register(
    r'attendance',
    AttendanceViewSet,
    basename='attendance',
)

router.register(
    r'tapping-records',
    TappingRecordViewSet,
    basename='tapping-record',
)

router.register(
    r'production',
    ProductionViewSet,
    basename='production',
)

router.register(
    r'inventory',
    InventoryViewSet,
    basename='inventory',
)

router.register(
    r'expenses',
    ExpenseViewSet,
    basename='expense',
)

router.register(
    r'buyer-profiles',
    BuyerProfileViewSet,
    basename='buyer-profile',
)

router.register(
    r'purchase-orders',
    PurchaseOrderViewSet,
    basename='purchase-order',
)

router.register(
    r'invoices',
    InvoiceViewSet,
    basename='invoice',
)

router.register(
    r'payments',
    PaymentViewSet,
    basename='payment',
)

router.register(
    r'labour-wage-payments',
    LabourWagePaymentViewSet,
    basename='labour-wage-payment',
)


# =====================================================
# URL PATTERNS
# =====================================================

urlpatterns = [
    # REST API router
    path('', include(router.urls)),

    # Current user's role
    path(
        'user-role/',
        CurrentUserRoleView.as_view(),
        name='user-role',
    ),

    # Registration
    path(
        'register/labour/',
        RegisterLabourView.as_view(),
        name='register-labour',
    ),

    path(
        'register/buyer/',
        RegisterBuyerView.as_view(),
        name='register-buyer',
    ),

    path(
        'register/estate-owner/',
        RegisterEstateOwnerView.as_view(),
        name='register-estate-owner',
    ),

    # CSV exports
    path(
        'export/payroll/',
        export_payroll_csv,
        name='export-payroll',
    ),

    path(
        'export/sales/',
        export_sales_csv,
        name='export-sales',
    ),

    # Buyer downloads only their own orders
    path(
        'export/my-orders/',
        export_my_orders_csv,
        name='export-my-orders-csv',
    ),

  
    # Razorpay
    path(
        'razorpay/create-order/',
        CreateRazorpayOrderView.as_view(),
        name='razorpay-create-order',
    ),
    path(
        'razorpay/check-order/<int:payment_id>/',
        CheckRazorpayOrderView.as_view(),
        name='razorpay-check-order',
    ),
    path(
        'razorpay/verify-payment/',
        VerifyRazorpayPaymentView.as_view(),
        name='razorpay-verify-payment',
    ),




]















# from django.urls import path, include
# from rest_framework.routers import DefaultRouter

# from .views import (
#     # ViewSets
#     EstateViewSet,
#     LabourProfileViewSet,
#     AttendanceViewSet,
#     TappingRecordViewSet,
#     ProductionViewSet,
#     InventoryViewSet,
#     BuyerProfileViewSet,
#     EstateOwnerProfileViewSet,
#     SupervisorProfileViewSet,
#     LabourEstateRequestViewSet,
#     SupervisorEstateRequestViewSet,
#     ExpenseViewSet,
#     PurchaseOrderViewSet,
#     InvoiceViewSet,
#     PaymentViewSet,

#     # Other API views
#     CurrentUserRoleView,
#     RegisterLabourView,
#     RegisterBuyerView,
#     RegisterSupervisorView,
#     RegisterEstateOwnerView,

#     # Export functions
#     export_payroll_csv,
#     export_sales_csv,

#     # Razorpay
#     CreateRazorpayOrderView,
#     VerifyRazorpayPaymentView,
# )


# # =========================================================
# # ROUTER
# # =========================================================

# router = DefaultRouter()

# router.register(
#     r'estates',
#     EstateViewSet,
#     basename='estate'
# )

# router.register(
#     r'estate-owner-profiles',
#     EstateOwnerProfileViewSet,
#     basename='estate-owner-profile'
# )

# router.register(
#     r'labour-profiles',
#     LabourProfileViewSet,
#     basename='labour-profile'
# )

# router.register(
#     r'labour-estate-requests',
#     LabourEstateRequestViewSet,
#     basename='labour-estate-request'
# )

# router.register(
#     r'supervisor-profiles',
#     SupervisorProfileViewSet,
#     basename='supervisor-profile'
# )

# router.register(
#     r'supervisor-estate-requests',
#     SupervisorEstateRequestViewSet,
#     basename='supervisor-estate-request'
# )

# router.register(
#     r'attendance',
#     AttendanceViewSet,
#     basename='attendance'
# )

# router.register(
#     r'tapping-records',
#     TappingRecordViewSet,
#     basename='tapping-record'
# )

# router.register(
#     r'production',
#     ProductionViewSet,
#     basename='production'
# )

# router.register(
#     r'inventory',
#     InventoryViewSet,
#     basename='inventory'
# )

# router.register(
#     r'expenses',
#     ExpenseViewSet,
#     basename='expense'
# )

# router.register(
#     r'buyer-profiles',
#     BuyerProfileViewSet,
#     basename='buyer-profile'
# )

# router.register(
#     r'purchase-orders',
#     PurchaseOrderViewSet,
#     basename='purchase-order'
# )

# router.register(
#     r'invoices',
#     InvoiceViewSet,
#     basename='invoice'
# )

# router.register(
#     r'payments',
#     PaymentViewSet,
#     basename='payment'
# )


# # =========================================================
# # URL PATTERNS
# # =========================================================

# urlpatterns = [

#     # -----------------------------------------------------
#     # REST API ROUTER
#     # -----------------------------------------------------
#     path(
#         '',
#         include(router.urls)
#     ),

#     # -----------------------------------------------------
#     # CURRENT USER ROLE
#     # -----------------------------------------------------
#     path(
#         'user-role/',
#         CurrentUserRoleView.as_view(),
#         name='user-role'
#     ),

#     # -----------------------------------------------------
#     # REGISTRATION
#     # -----------------------------------------------------
#     path(
#         'register/labour/',
#         RegisterLabourView.as_view(),
#         name='register-labour'
#     ),

#     path(
#         'register/buyer/',
#         RegisterBuyerView.as_view(),
#         name='register-buyer'
#     ),

#     path(
#         'register/supervisor/',
#         RegisterSupervisorView.as_view(),
#         name='register-supervisor'
#     ),

#     path(
#         'register/estate-owner/',
#         RegisterEstateOwnerView.as_view(),
#         name='register-estate-owner'
#     ),

#     # -----------------------------------------------------
#     # EXPORTS
#     # -----------------------------------------------------
#     path(
#         'export/payroll/',
#         export_payroll_csv,
#         name='export-payroll'
#     ),

#     path(
#         'export/sales/',
#         export_sales_csv,
#         name='export-sales'
#     ),

#     # =====================================================
#     # RAZORPAY PAYMENT
#     # =====================================================

#     # Create Razorpay order
#     #
#     # POST:
#     # /api/razorpay/create-order/
#     #
#     path(
#         'razorpay/create-order/',
#         CreateRazorpayOrderView.as_view(),
#         name='razorpay-create-order'
#     ),

#     # Verify Razorpay payment
#     #
#     # POST:
#     # /api/razorpay/verify-payment/
#     #
#    