from django.db import models
from django.contrib.auth.models import User

class GiftCategory(models.Model):
    # Stores available gift categories - editable through Django admin
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Gift Categories"
        ordering = ['name']

# Reason choices for taking items
    
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

class Gift(models.Model):
    # Visual identification
    product_image = models.ImageField(upload_to='gift_images/', blank=True, null=True)
    product_name = models.CharField(max_length=200)
    
    # Organization & tracking
    category = models.ForeignKey(GiftCategory, on_delete=models.PROTECT)
    qty_stock = models.IntegerField()
    
    # Product details
    description = models.TextField(blank=True)
    material = models.CharField(max_length=200, blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Customs & logistics
    hs_code = models.CharField(max_length=20, blank=True)
    country_of_origin = models.CharField(max_length=100, blank=True)
    
    # Supplier information
    supplier_name = models.CharField(max_length=200, blank=True)
    supplier_email = models.EmailField(blank=True)
    supplier_address = models.TextField(blank=True)
    
    # System tracking
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='gifts_created')
    
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='gifts_updated')
    
    # Optional inventory management
    minimum_stock_level = models.IntegerField(default=10, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.product_name
    

class InventoryTransaction(models.Model):
    """
    Tracks all inventory movements (takes and returns)
    Records who, what, when, how many, and why for audit trail
    """
    # Transaction types
    TRANSACTION_TYPES = [
        ('take', 'Take'),
        ('return', 'Return'),
    ]
    
    # Core transaction info
    gift = models.ForeignKey(Gift, on_delete=models.CASCADE, related_name='transactions')
    
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    
    quantity = models.IntegerField()
    
    reason = models.ForeignKey(
    TakeReason,
    on_delete=models.PROTECT,
    blank=True,
    null=True,
    help_text="Reason for transaction (from standardized list)"
)
    # New dynamic reason (temporary during migration)
    
    notes = models.TextField(blank=True)
    
    # Audit fields
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Stock levels at time of transaction (for audit trail)
    stock_before = models.IntegerField()
    
    stock_after = models.IntegerField()
    
    def __str__(self):
        return f"{self.transaction_type.upper()}: {self.quantity}x {self.gift.product_name} by {self.created_by}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Inventory Transaction"
        verbose_name_plural = "Inventory Transactions"

# --- APPAREL ---

class ApparelSize(models.Model):
    """
    Standardized size reference for apparel inventory.
    
    Prevents size inconsistencies across multi-cultural team by providing
    a single source of truth for all valid sizes.
    
    Examples:
        Clothing: XS, S, M, L, XL, 2XL, 3XL
        Footwear: 36, 37, 38, 39, 40, 41, 42
    """
    
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
    
# Colors

class ApparelColor(models.Model):
    """
    Standardized color reference for apparel inventory.
    
    Prevents color naming inconsistencies across multi-cultural teams by
    providing visual color swatches alongside standardized names.
    
    Examples: Navy Blue (#001f3f), Black (#000000), White (#FFFFFF)
    """
    
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
    


    
# Apparel Categories

class ApparelCategory(models.Model):
    """
    Categories for apparel inventory organization.
    Enables filtering and grouping of 361° products by type.
    """
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = "Apparel Category"
        verbose_name_plural = "Apparel Categories"
    
    def __str__(self):
        return self.name


  # Apparel Product  

class ApparelProduct(models.Model):
    """
    Base apparel product from 361°.
    Represents the product concept before size/color variations.
    
    Example: "361° Staff Polo Blue" is one product with multiple size variants.
    Stores shared information (price, HS code, photo) that applies to all variants.
    """
    
    GENDER_CHOICES = [
        ('M', 'Men'),
        ('W', 'Women'),
        ('U', 'Unisex'),
        ('Y', 'Youth'),
    ]
    
    product_name = models.CharField(
        max_length=200,
        help_text="Full product name (e.g., '361° Staff Polo Blue')"
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
        help_text="361° product code (e.g., 'ZW1050601-2')"
    )
    
    gender = models.CharField(
        max_length=1,
        choices=GENDER_CHOICES,
        default='U',
        help_text="Target gender for this product"
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
    
    hs_code = models.CharField(
        max_length=20,
        blank=True,
        help_text="Harmonized System code for customs"
    )
    
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


class ApparelVariant(models.Model):
    """
    Specific size/color combination of an apparel product with stock tracking.
    
    Each variant represents countable inventory units.
    Example: "361° Staff Polo Blue - Size M - Color Blue" with 35 units in stock.
    
    Foreign keys to Size and Color ensure data consistency across multi-cultural team.
    """
    
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
    
    qty_stock = models.IntegerField(
        default=0,
        help_text="Current quantity in stock for this specific size/color"
    )
    
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
        help_text="Full SKU from 361° if provided"
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
        unique_together = ['product', 'size', 'color']
        verbose_name = "Apparel Variant"
        verbose_name_plural = "Apparel Variants"
    
    def __str__(self):
        return f"{self.product.product_name} - {self.size.size_value} - {self.color.color_name}"
    

class ApparelTransaction(models.Model):
    """
    Tracks all apparel inventory movements for audit trail.
    Records who took/returned items, when, how many, and why.
    
    Transactions are immutable after creation to maintain data integrity.
    """
    
    TRANSACTION_TYPES = [
        ('take', 'Take'),
        ('return', 'Return'),
    ]
    
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
        TakeReason,
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
