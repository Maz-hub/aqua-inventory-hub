from django.db import models
from django.contrib.auth.models import User
from core.models import StockAdjustmentReason


# ApparelSize is a shared reference table for all valid sizes.
# Sizes are split by type (clothing, footwear, accessory) so that
# clothing dropdowns only show XS/S/M/L and footwear dropdowns only show 36/37/38.
# display_order controls the sort order within each type so sizes appear
# in a sensible sequence rather than alphabetically.
class ApparelSize(models.Model):
    SIZE_TYPE_CHOICES = [
        ('clothing', 'Clothing'),      # Shirts, Polos, Jackets, Pants
        ('footwear', 'Footwear'),      # Shoes
        ('accessory', 'Accessories'),  # Backpacks, Bags, Belts, Hats
    ]

    size_value = models.CharField(
        max_length=10,
        help_text="Size identifier (e.g., 'M', 'XL', '42')"
    )

    size_type = models.CharField(
        max_length=20,
        choices=SIZE_TYPE_CHOICES,
        help_text="Category of size: clothing or footwear"
    )

    display_order = models.IntegerField(
        default=0,
        help_text="Order for dropdown display (smaller numbers appear first)"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['size_type', 'display_order']
        unique_together = ['size_value', 'size_type']
        verbose_name = "Apparel Size"
        verbose_name_plural = "Apparel Sizes"

    def __str__(self):
        return f"{self.size_value} ({self.get_size_type_display()})"


# ApparelColor is a shared reference table for all valid colours.
# Storing colours here prevents free-text inconsistencies (e.g. "navy" vs "Navy Blue").
# hex_code is optional and used to render colour swatches in the frontend.
class ApparelColor(models.Model):
    color_name = models.CharField(
        max_length=50,
        unique=True,
        help_text="Standardized color name (e.g., 'Navy Blue', 'Black')"
    )

    hex_code = models.CharField(
        max_length=7,
        blank=True,
        help_text="Optional hex color code for visual display (e.g., '#001f3f')"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['color_name']
        verbose_name = "Apparel Color"
        verbose_name_plural = "Apparel Colors"

    def __str__(self):
        return self.color_name


# ApparelCategory groups products for filtering and organisation in the admin table.
# Examples: Polo Shirts, Jackets, Footwear, Accessories.
class ApparelCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Apparel Category"
        verbose_name_plural = "Apparel Categories"

    def __str__(self):
        return self.name


# ApparelProduct is the base product record, one per colour of a physical item.
# It stores all the shared information (name, price, customs data, supplier details,
# image) that applies equally to every size of that product.
# The actual per-size stock is tracked on ApparelVariant, not here.
#
# primary_color records the product's colour at the product level so the frontend
# can render consistent colour badges across all variants without looking up each one.
# Deleting a category is blocked while products still reference it (PROTECT).
class ApparelProduct(models.Model):
    product_name = models.CharField(
        max_length=200,
        help_text="Full product name (e.g., '361 Staff Polo Blue')"
    )

    category = models.ForeignKey(
        ApparelCategory,
        on_delete=models.PROTECT,
        related_name='products',
        help_text="Product category for organization and filtering"
    )

    item_id = models.CharField(
        max_length=50,
        blank=True,
        help_text="361 product code (e.g., 'ZW1050601-2')"
    )

    # primary_color drives the colour badge background in the inventory grid.
    # It is set once when the product is created and applies to all its variants.
    # Deleting a colour sets this to NULL rather than blocking deletion.
    primary_color = models.ForeignKey(
        'ApparelColor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products_of_this_color',
        help_text="Main color of this product (determines badge background)"
    )

    material = models.CharField(
        max_length=200,
        blank=True,
        help_text="Fabric composition (e.g., '100% Polyester')"
    )

    description = models.TextField(
        blank=True,
        help_text="Detailed product description"
    )

    # Customs & logistics fields used for import declarations.
    # hs_code is the Harmonized System tariff code.
    # merchant_product_id is our own internal SKU.
    # manufacturer_product_id is the supplier's non-standardised code.
    # standardised_product_id holds a GTIN, EAN, or ISBN where one exists.
    hs_code = models.CharField(
        max_length=20,
        blank=True,
        help_text="Harmonized System code for customs"
    )

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
        help_text="Standardised code if exists - Enter NO if not applicable."
    )

    # Supplier contact details stored at product level.
    # Useful for reordering and for customs documentation.
    supplier_name = models.CharField(
        max_length=200,
        blank=True,
        help_text="Supplier company or contact name"
    )
    supplier_email = models.EmailField(
        blank=True,
        help_text="Supplier contact email address"
    )
    supplier_phone = models.CharField(
        max_length=50,
        blank=True,
        help_text="Supplier contact phone number"
    )
    supplier_address = models.TextField(
        blank=True,
        help_text="Supplier mailing address"
    )

    # unit_price is the same for all sizes of this product.
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text="Price per unit (same for all sizes of this product)"
    )

    country_of_origin = models.CharField(
        max_length=100,
        blank=True,
        help_text="Manufacturing country"
    )

    product_image = models.ImageField(
        upload_to='apparel_images/',
        blank=True,
        null=True,
        help_text="Product photo for visual identification"
    )

    notes = models.TextField(
        blank=True,
        help_text="Internal notes for staff reference"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='apparel_products_created'
    )

    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='apparel_products_updated'
    )

    class Meta:
        ordering = ['product_name']
        verbose_name = "Apparel Product"
        verbose_name_plural = "Apparel Products"

    def __str__(self):
        return self.product_name


# ApparelVariant represents one specific size/colour/gender combination of a product.
# This is where actual stock is counted. A product with sizes XS through XL has
# one variant row per size, each with its own qty_stock.
#
# gender is included because Men's M and Women's M are physically different cuts
# and need separate stock counts.
#
# The unique_together constraint on (product, size, color, gender) prevents
# duplicate variant rows being created for the same combination.
# Deleting a product cascades to delete all its variants.
# Deleting a size or colour is blocked while variants still reference them (PROTECT).
class ApparelVariant(models.Model):
    VARIANT_GENDER_CHOICES = [
        ('U', 'Unisex'),
        ('M', 'Men'),
        ('W', 'Women'),
        ('Y', 'Youth'),
    ]

    product = models.ForeignKey(
        ApparelProduct,
        on_delete=models.CASCADE,
        related_name='variants',
        help_text="Base product this variant belongs to"
    )

    size = models.ForeignKey(
        ApparelSize,
        on_delete=models.PROTECT,
        help_text="Standardized size from predefined list"
    )

    color = models.ForeignKey(
        ApparelColor,
        on_delete=models.PROTECT,
        help_text="Standardized color from predefined list"
    )

    gender = models.CharField(
        max_length=1,
        choices=VARIANT_GENDER_CHOICES,
        default='U',
        help_text="Gender fit for this specific variant (Women's M vs Men's M)"
    )

    qty_stock = models.IntegerField(
        default=0,
        help_text="Current quantity in stock for this specific size/color"
    )

    # minimum_stock_level triggers a low-stock warning in the admin table
    # when qty_stock falls at or below this value.
    minimum_stock_level = models.IntegerField(
        default=5,
        help_text="Alert threshold for low stock warnings"
    )

    weight = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Weight in grams (optional, for shipping calculations)"
    )

    sku = models.CharField(
        max_length=100,
        blank=True,
        help_text="Full SKU from 361 if provided"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='apparel_variants_created'
    )

    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='apparel_variants_updated'
    )

    class Meta:
        ordering = ['product', 'size__display_order']
        unique_together = ['product', 'size', 'color', 'gender']
        verbose_name = "Apparel Variant"
        verbose_name_plural = "Apparel Variants"

    def __str__(self):
        return f"{self.product.product_name} - {self.size.size_value} - {self.color.color_name}"


# ApparelTransaction records every stock movement on a specific variant.
# A row is written each time items are taken out or added back.
# stock_before and stock_after capture the quantity at the exact moment
# of the transaction so the history is a complete audit trail, independent
# of any later corrections to the stock count.
# Transactions are never edited or deleted after creation.
#
# reason is optional for automated movements (e.g. request submissions and
# cancellations). For manual adjustments made through the admin stock adjust
# modal, a reason is required.
# notes holds free-text context, e.g. which request triggered the movement.
class ApparelTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('take', 'Take'),     # items removed from stock
        ('return', 'Return'), # items added back to stock
    ]

    # Deleting a variant cascades to delete its transaction history.
    variant = models.ForeignKey(
        ApparelVariant,
        on_delete=models.CASCADE,
        related_name='transactions',
        help_text="Specific size/color variant that was taken or returned"
    )

    transaction_type = models.CharField(
        max_length=10,
        choices=TRANSACTION_TYPES,
        help_text="Whether items were taken out or returned to stock"
    )

    quantity = models.IntegerField(
        help_text="Number of items taken or returned"
    )

    reason = models.ForeignKey(
        StockAdjustmentReason,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        help_text="Reason for transaction (from standardized list)"
    )

    notes = models.TextField(
        blank=True,
        help_text="Additional context or details about this transaction"
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        help_text="User who performed this transaction"
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When this transaction occurred"
    )

    # Snapshot of stock levels at the moment this transaction was recorded.
    stock_before = models.IntegerField(
        help_text="Stock quantity before this transaction"
    )

    stock_after = models.IntegerField(
        help_text="Stock quantity after this transaction"
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Apparel Transaction"
        verbose_name_plural = "Apparel Transactions"

    def __str__(self):
        return f"{self.transaction_type.upper()}: {self.quantity}x {self.variant} by {self.created_by}"
