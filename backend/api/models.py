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

