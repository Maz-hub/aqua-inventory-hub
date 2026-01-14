from django.core.management.base import BaseCommand
from api.models import ApparelSize


class Command(BaseCommand):
    help = 'Populates the database with standardized apparel sizes for clothing, footwear, and accessories'

    def handle(self, *args, **options):
        """
        Creates predefined size entries to ensure consistency across the inventory system.
        Prevents duplicate entries and provides feedback on creation status.
        """
        
        self.stdout.write(self.style.WARNING('Setting up apparel sizes...'))
        
        # Counter for tracking created sizes
        created_count = 0
        
        # Clothing sizes with proper ordering
        clothing_sizes = [
            ('XS', 1),
            ('S', 2),
            ('M', 3),
            ('L', 4),
            ('XL', 5),
            ('2XL', 6),
            ('3XL', 7),
            ('4XL', 8),
            ('5XL', 9),
        ]
        
        for size_value, order in clothing_sizes:
            size, created = ApparelSize.objects.get_or_create(
                size_value=size_value,
                size_type='clothing',
                defaults={'display_order': order}
            )
            if created:
                created_count += 1
                self.stdout.write(f'  ✓ Created: {size}')
            else:
                self.stdout.write(self.style.WARNING(f'  - Already exists: {size}'))
        
        # Footwear sizes (US sizing with half sizes)
        footwear_sizes = [
            ('36', 1), ('37', 2), ('38', 3), ('39', 4),
            ('40', 5), ('41', 6), ('42', 7), ('43', 8),
            ('44', 9), ('45', 10), ('46', 11), ('47', 12),
            ('48', 13), ('49', 14), ('50', 15),
        ]
        
        for size_value, order in footwear_sizes:
            size, created = ApparelSize.objects.get_or_create(
                size_value=size_value,
                size_type='footwear',
                defaults={'display_order': order}
            )
            if created:
                created_count += 1
                self.stdout.write(f'  ✓ Created: {size}')
            else:
                self.stdout.write(self.style.WARNING(f'  - Already exists: {size}'))
        
        # Accessory sizes (for backpacks, hats, belts, etc.)
        accessory_sizes = [
            ('One Size', 1),
            ('Small', 2),
            ('Medium', 3),
            ('Large', 4),
            ('20L', 5),  # Backpack capacity
            ('30L', 6),
            ('40L', 7),
        ]
        
        for size_value, order in accessory_sizes:
            size, created = ApparelSize.objects.get_or_create(
                size_value=size_value,
                size_type='accessory',
                defaults={'display_order': order}
            )
            if created:
                created_count += 1
                self.stdout.write(f'  ✓ Created: {size}')
            else:
                self.stdout.write(self.style.WARNING(f'  - Already exists: {size}'))
        
        # Final summary
        self.stdout.write(
            self.style.SUCCESS(f'\nCompleted! Created {created_count} new sizes.')
        )