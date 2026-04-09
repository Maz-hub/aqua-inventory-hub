from django.db import models

class TakeReason(models.Model):
    """
    Standardized reasons for inventory transactions.

    Shared between Gifts and Apparel inventories to maintain consistency
    while allowing inventory-specific reasons where needed.

    Examples: Event, Office Use, World Cup Gift, FINA Meeting
    """

    APPLIES_TO_CHOICES = [
        ('gifts', 'Gifts Only'),
        ('apparel', 'Apparel Only'),
        ('both', 'Both Inventories'),
    ]

    reason_name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Descriptive reason for taking inventory (e.g., 'World Cup 2026 Gift')"
    )

    applies_to = models.CharField(
        max_length=20,
        choices=APPLIES_TO_CHOICES,
        default='both',
        help_text="Which inventory system(s) can use this reason"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['reason_name']
        verbose_name = "Take Reason"
        verbose_name_plural = "Take Reasons"

    def __str__(self):
        return f"{self.reason_name} ({self.get_applies_to_display()})"
