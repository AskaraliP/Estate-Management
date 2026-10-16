from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import TappingRecord


@receiver(post_save, sender=TappingRecord)
def tapping_record_created(sender, instance, created, **kwargs):
    """
    Tapping records are created by labour, supervisor, or admin.

    Inventory should NOT be updated here.

    Inventory is updated only when the tapping record
    is verified through ProductionViewSet.
    """

    if created:
        # No inventory update here.
        # Verification handles production and inventory.
        pass