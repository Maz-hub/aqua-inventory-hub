from django.db import models
from django.contrib.auth.models import User
from core.models import StockAdjustmentReason, Department


# OfficeCategory groups office items into logical buckets (e.g. Stationery, Electronics).
# Categories are managed through Django admin and protected from deletion
# if any items are still assigned to them.
class OfficeCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Office Categories"
        ordering = ['name']


# OfficeItem is the main product record for the office & events inventory.
# Each item belongs to a category and optionally to a department for cost tracking.
# unit_price is optional since not all office items have a tracked price.
class OfficeItem(models.Model):
    product_image = models.ImageField(upload_to='office_images/', blank=True, null=True)
    item_name = models.CharField(max_length=200)

    category = models.ForeignKey(OfficeCategory, on_delete=models.PROTECT)
    qty_stock = models.IntegerField(default=0)
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    description = models.TextField(blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    # Customs & logistics
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
    supplier_phone = models.CharField(max_length=50, blank=True)
    supplier_address = models.TextField(blank=True)

    notes = models.TextField(blank=True)

    # System tracking
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='office_items_created'
    )
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='office_items_updated'
    )

    def __str__(self):
        return self.item_name


# OfficeTransaction records every stock movement for an office item.
# A row is written each time items are taken out or returned.
# stock_before and stock_after capture the quantity at the moment of the
# transaction so the history is a complete audit trail.
# Transactions are never deleted or edited after creation.
class OfficeTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('take', 'Take'),
        ('return', 'Return'),
    ]

    item = models.ForeignKey(OfficeItem, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    quantity = models.IntegerField()
    reason = models.ForeignKey(
        StockAdjustmentReason,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        help_text="Reason for transaction (from standardized list)"
    )
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    stock_before = models.IntegerField()
    stock_after = models.IntegerField()

    def __str__(self):
        return f"{self.transaction_type.upper()}: {self.quantity}x {self.item.item_name} by {self.created_by}"

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Office Transaction"
        verbose_name_plural = "Office Transactions"
