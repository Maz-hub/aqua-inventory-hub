from django.db import models
from django.contrib.auth.models import User
from core.models import StockAdjustmentReason


# ExecutiveCategory groups executive office items into logical buckets.
# Categories are managed through Django admin and protected from deletion
# if any items are still assigned to them.
class ExecutiveCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Executive Categories"
        ordering = ['name']


# ExecutiveItem is the main product record for the executive office inventory.
# Each item belongs to a category and tracks current stock, pricing, customs
# data, and supplier contact details in one place. There is no department
# field — unlike Office & Events, executive items aren't charged to a
# department for cost tracking.
class ExecutiveItem(models.Model):
    # Visual identification
    product_image = models.ImageField(upload_to='executive_images/', blank=True, null=True)
    item_name = models.CharField(max_length=200)

    # Organization & tracking
    category = models.ForeignKey(ExecutiveCategory, on_delete=models.PROTECT)
    qty_stock = models.IntegerField(default=0)

    # Product details
    description = models.TextField(blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    # Customs & logistics
    # hs_code is the Harmonized System tariff code used for international shipments.
    # merchant_product_id is our own internal SKU.
    # manufacturer_product_id is the supplier's non-standardised code.
    # standardised_product_id holds a GTIN, EAN, or ISBN if one exists.
    hs_code = models.CharField(max_length=20, blank=True)
    merchant_product_id = models.CharField(
        max_length=100,
        blank=True,
        help_text="Your unique product code / SKU for customs declarations"
    )
    manufacturer_product_id = models.CharField(
        max_length=100,
        blank=True,
        help_text="Supplier's non-standardised product code"
    )
    standardised_product_id = models.CharField(
        max_length=100,
        blank=True,
        help_text="Standardised code if exists: GTIN, EAN, ISBN. Enter NO if not applicable."
    )
    country_of_origin = models.CharField(max_length=100, blank=True)

    # Supplier information
    supplier_name = models.CharField(max_length=200, blank=True)
    supplier_email = models.EmailField(blank=True)
    supplier_phone = models.CharField(
        max_length=50,
        blank=True,
        help_text="Supplier contact phone number"
    )
    supplier_address = models.TextField(blank=True)

    notes = models.TextField(blank=True)

    # System tracking
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='executive_items_created'
    )
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='executive_items_updated'
    )

    def __str__(self):
        return self.item_name


# ExecutiveTransaction records every stock movement for an executive item.
# A row is written each time items are taken out or returned.
# stock_before and stock_after capture the quantity at the moment of the
# transaction so the history is a complete audit trail, independent of any
# later stock corrections. Transactions are never deleted or edited after creation.
class ExecutiveTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('take', 'Take'),    # items removed from stock
        ('return', 'Return'), # items added back to stock
    ]

    # The item this transaction belongs to. Deleting an item also removes its history.
    item = models.ForeignKey(ExecutiveItem, on_delete=models.CASCADE, related_name='transactions')

    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)

    quantity = models.IntegerField()

    # reason is optional for automated transactions (e.g. request submissions).
    # For manual adjustments made through the admin stock adjust modal, a reason is required.
    reason = models.ForeignKey(
        StockAdjustmentReason,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        help_text="Reason for transaction (from standardized list)"
    )

    # notes holds free-text context, e.g. which request triggered the movement.
    notes = models.TextField(blank=True)

    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Snapshot of stock levels at the moment this transaction was recorded.
    stock_before = models.IntegerField()
    stock_after = models.IntegerField()

    def __str__(self):
        return f"{self.transaction_type.upper()}: {self.quantity}x {self.item.item_name} by {self.created_by}"

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Executive Transaction"
        verbose_name_plural = "Executive Transactions"
