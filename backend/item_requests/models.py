from django.db import models
from django.contrib.auth.models import User
from core.models import TakeReason, Department


# ItemRequest is the top-level record for a staff member's request.
# One request covers all the items a person needs in a single submission,
# regardless of which inventory category those items come from.
# The request moves through a fixed status workflow:
#   draft -> pending -> in_preparation -> ready -> completed (or cancelled at any point)
# Stock is deducted when the request is submitted (moves to pending) and
# restored if the request is cancelled.
# updated_by tracks the last admin to touch the record for audit purposes.
class ItemRequest(models.Model):
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

    # Internal notes from preparation team — not shown to the requester
    admin_notes = models.TextField(
        blank=True,
        help_text="Internal notes from the preparation team (not visible to requester)"
    )

    created_at = models.DateTimeField(auto_now_add=True)

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
        # Sums estimated_cost across all line items.
        # Used for budget display in both the user-facing request list and the admin panel.
        return sum(item.estimated_cost for item in self.items.all())


# ItemRequestItem is a single line in a request, equivalent to one row in an order.
# Because requests can include items from different inventory models (gifts, apparel, etc.),
# we use a generic item_type + item_id pattern instead of separate FK fields per model.
# item_type tells us which model to look in; item_id is the PK in that model.
# There is no database-level FK constraint on item_id by design, since the referenced
# model varies per row.
#
# quantity_confirmed is set by the preparation team when they process the request.
# It may be less than quantity_requested if stock ran short. Until confirmed,
# estimated_cost uses quantity_requested.
#
# unit_price is captured at the time of the request as a snapshot so that cost
# calculations remain accurate even if the product price changes later.
class ItemRequestItem(models.Model):
    ITEM_TYPE_CHOICES = [
        ('gift',      'Gift'),
        ('apparel',   'Apparel Variant'),
        ('executive', 'Executive Office Item'),
        ('it',        'IT Asset'),
        ('office',    'Office & Events Item'),
    ]

    # Deleting a request cascades to remove all its line items.
    request = models.ForeignKey(
        ItemRequest,
        on_delete=models.CASCADE,
        related_name='items',
        help_text="The parent request this item belongs to"
    )

    # item_type determines which inventory model item_id points to.
    item_type = models.CharField(
        max_length=20,
        choices=ITEM_TYPE_CHOICES,
        help_text="Which inventory category this item comes from"
    )

    item_id = models.PositiveIntegerField(
        help_text="Primary key of the item in its respective inventory model"
    )

    quantity_requested = models.PositiveIntegerField(
        help_text="Quantity originally requested by the staff member"
    )

    # Null until the preparation team confirms the quantity.
    quantity_confirmed = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Quantity confirmed by preparation team (may differ from requested)"
    )

    # Price snapshot taken at request time, not recalculated from the live product price.
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text="Unit price captured at time of request for budget calculations"
    )

    notes = models.TextField(
        blank=True,
        help_text="Item-specific notes or special instructions"
    )

    class Meta:
        verbose_name = "Item Request Line"
        verbose_name_plural = "Item Request Lines"

    @property
    def estimated_cost(self):
        # Uses confirmed quantity when available, otherwise falls back to requested.
        qty = self.quantity_confirmed or self.quantity_requested
        return self.unit_price * qty

    def __str__(self):
        return f"{self.get_item_type_display()} #{self.item_id} x{self.quantity_requested}"
