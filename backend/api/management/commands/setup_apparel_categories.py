from django.core.management.base import BaseCommand
from api.models import ApparelCategory


class Command(BaseCommand):
    help = 'Populates the database with standard 361° apparel categories'

    def handle(self, *args, **options):
        """
        Creates predefined category entries based on World Aquatics 361° product inventory.
        Categories can be modified or extended via Django admin after initial setup.
        """
        
        self.stdout.write(self.style.WARNING('Setting up apparel categories...'))
        
        created_count = 0
        
        # Standard 361° apparel categories from World Aquatics inventory
        categories = [
    'Staff',
    'Polo Shirt',
    'T-Shirt',
    'Hoodie',
    'Short Down Jacket',
    'Windbreaker',
    'Blazer',
    'Shorts',
    'Pants',
    'Shoes',
    'Socks',
    'Backpack',
    'Belt',
    'Bucket Hat',
    'Cap',
]
        
        for category_name in categories:
            category, created = ApparelCategory.objects.get_or_create(
                name=category_name
            )
            if created:
                created_count += 1
                self.stdout.write(f'  ✓ Created: {category.name}')
            else:
                self.stdout.write(self.style.WARNING(f'  - Already exists: {category.name}'))
        
        self.stdout.write(
            self.style.SUCCESS(f'\nCompleted! Created {created_count} new categories.')
        )