from django.db import models
from django.contrib.auth.models import User
from core.models import TakeReason, Department


class ItemRequest(models.Model):
    """
    Represents a staff member's request for inventory items.

    A single request can contain items from multiple inventory
    categories (Gifts, Apparel, etc.) submitted in one go.
    Status tracks the request through its lifecycle.
    All admin modifications are logged for audit trail.
    """

    STATUS_CHOICES = [
        ('draft',          'Draft'),
        ('pending',        'Pending'),
        ('in_preparation', 'In Preparation'),
        ('ready',          'Ready'),
        ('completed',      'Completed'),
        ('cancelled',      'Cancelled'),
    ]

    # Who made the request
    requested_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='item_requests',
        help_text="Staff member who submitted this request"
    )

    # Which department this request is charged to
    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name='item_requests',
        help_text="Department for budget tracking purposes"
    )

    # Why the items are needed
    reason = models.ForeignKey(
        TakeReason,
        on_delete=models.PROTECT,
        related_name='item_requests',
        help_text="Reason for this request (from standardised list)"
    )

    # Current status in the workflow
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        help_text="Current stage of the request workflow"
    )

    # When the items are needed
    date_needed = models.DateField(
        help_text="Date by which items must be ready for collection"
    )

    # Optional notes from requester
    notes = models.TextField(
        blank=True,
        help_text="Additional context or instructions from the requester"
    )

    # Internal notes from preparation team
    admin_notes = models.TextField(
        blank=True,
        help_text="Internal notes from the preparation team (not visible to requester)"
    )

    # Audit fields — creation
    created_at = models.DateTimeField(auto_now_add=True)

    # Audit fields — last modification
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='item_requests_updated',
        help_text="Last person to modify this request"
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Item Request"
        verbose_name_plural = "Item Requests"

    def __str__(self):
        return f"Request #{self.pk} — {self.requested_by.username} — {self.status}"

    @property
    def total_cost(self):
        """
        Calculates total estimated cost of all items in this request.
        Used for budget tracking and department reporting.
        """
        return sum(item.estimated_cost for item in self.items.all())


class ItemRequestItem(models.Model):
    """
    A single line item within an ItemRequest.

    Uses a flexible item_type + item_id pattern to support
    items from any inventory category (Gifts, Apparel,
    Executive Office, IT Assets, Office/Events).

    quantity_confirmed may differ from quantity_requested
    if the preparation team made adjustments.
    """

    ITEM_TYPE_CHOICES = [
        ('gift',      'Gift'),
        ('apparel',   'Apparel Variant'),
        ('executive', 'Executive Office Item'),
        ('it',        'IT Asset'),
        ('office',    'Office & Events Item'),
    ]

    # Which request this item belongs to
    request = models.ForeignKey(
        ItemRequest,
        on_delete=models.CASCADE,
        related_name='items',
        help_text="The parent request this item belongs to"
    )

    # Which category this item comes from
    item_type = models.CharField(
        max_length=20,
        choices=ITEM_TYPE_CHOICES,
        help_text="Which inventory category this item comes from"
    )

    # The ID of the specific item in its category's model
    item_id = models.PositiveIntegerField(
        help_text="Primary key of the item in its respective inventory model"
    )

    # How many the requester asked for
    quantity_requested = models.PositiveIntegerField(
        help_text="Quantity originally requested by the staff member"
    )

    # How many were actually prepared (admin may adjust)
    quantity_confirmed = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Quantity confirmed by preparation team (may differ from requested)"
    )

    # Unit price at time of request (snapshot for budget reporting)
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text="Unit price captured at time of request for budget calculations"
    )

    # Optional item-level notes
    notes = models.TextField(
        blank=True,
        help_text="Item-specific notes or special instructions"
    )

    class Meta:
        verbose_name = "Item Request Line"
        verbose_name_plural = "Item Request Lines"

    @property
    def estimated_cost(self):
        """
        Calculates cost for this line item.
        Uses confirmed quantity if available, otherwise requested quantity.
        """
        qty = self.quantity_confirmed or self.quantity_requested
        return self.unit_price * qty

    def __str__(self):
        return f"{self.get_item_type_display()} #{self.item_id} x{self.quantity_requested}"
