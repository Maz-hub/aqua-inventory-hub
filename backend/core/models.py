from django.db import models


# TakeReason holds the list of reasons a staff member can select when submitting
# an item request (e.g. "World Cup 2026", "Staff Meeting", "Office Use").
# applies_to scopes each reason to gifts only, apparel only, or both,
# so dropdowns only show relevant options for the inventory type being requested.
# Reasons are managed by admin through Django admin and are never hardcoded.
class TakeReason(models.Model):
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


# Department stores the list of World Aquatics internal departments.
# Every item request is linked to a department so costs can be tracked
# and reported per team. Managed by admin via Django admin.
# Examples: Development, Marketing, Events, Communications.
class Department(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Department name (e.g. 'Development', 'Marketing')"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Department"
        verbose_name_plural = "Departments"

    def __str__(self):
        return self.name


# StockAdjustmentReason holds the list of reasons an admin can select when
# manually adjusting stock counts through the admin stock adjust modal.
# These are separate from TakeReason because they describe what happened
# to the stock (e.g. Restock, Return from Event, Damaged, Stock Correction)
# rather than why items were requested.
# Only visible to admin users, not to regular staff.
class StockAdjustmentReason(models.Model):
    APPLIES_TO_CHOICES = [
        ('add', 'Add'),
        ('take', 'Take'),
    ]

    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Reason for manual stock adjustment (e.g. 'Restock', 'Return from Event')"
    )

    applies_to = models.CharField(
        max_length=10,
        choices=APPLIES_TO_CHOICES,
        default='add',
        help_text="Which stock direction this reason appears for: adding stock or taking stock"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Stock Adjustment Reason"
        verbose_name_plural = "Stock Adjustment Reasons"

    def __str__(self):
        return self.name
