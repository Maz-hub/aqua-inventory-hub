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
    
    # Reason choices for taking items
    REASON_CHOICES = [
        ('event', 'Event'),
        ('office_use', 'Office Use'),
        ('external_gift', 'External Gift (Visitors/Meetings)'),
        ('new_employee', 'New Employee Welcome'),
        ('damaged', 'Damaged/Defective'),
        ('sample', 'Sample'),
        ('other', 'Other'),
    ]
    
    # Core transaction info
    gift = models.ForeignKey(Gift, on_delete=models.CASCADE, related_name='transactions')
    # Which product was taken/returned
    
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    # 'take' or 'return'
    
    quantity = models.IntegerField()
    # How many items were taken/returned
    
    reason = models.CharField(max_length=50, choices=REASON_CHOICES, blank=True, null=True)
    # Why items were taken (only for 'take' transactions)
    
    notes = models.TextField(blank=True)
    # Additional details or context
    
    # Audit fields
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    # Who performed this action
    
    created_at = models.DateTimeField(auto_now_add=True)
    # When this transaction occurred
    
    # Stock levels at time of transaction (for audit trail)
    stock_before = models.IntegerField()
    # Stock quantity before this transaction
    
    stock_after = models.IntegerField()
    # Stock quantity after this transaction
    
    def __str__(self):
        return f"{self.transaction_type.upper()}: {self.quantity}x {self.gift.product_name} by {self.created_by}"
    
    class Meta:
        ordering = ['-created_at']  # Newest first
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

