from django.core.management.base import BaseCommand
from api.models import ApparelColor


class Command(BaseCommand):
    help = 'Populates the database with standardized apparel colors used by 361° products'

    def handle(self, *args, **options):
        """
        Creates predefined color entries based on 361° product catalog.
        Includes hex codes for visual identification in admin interface.
        """
        
        self.stdout.write(self.style.WARNING('Setting up apparel colors...'))
        
        created_count = 0
        
        # Standard 361° colors with hex codes for visual display
        colors = [
            ('Black', '#000000'),
            ('White', '#FFFFFF'),
            ('Dark Blue', '#081930'),
            ('Blue', '#027bb8'),
            ('Light Blue', '#92b7d6'),
            ('Green', "#46b79f"),
            ('Beige', '#D2B48C'),
            ('Grey', '#AAAAAA'),
        ]
        
        for color_name, hex_code in colors:
            color, created = ApparelColor.objects.get_or_create(
                color_name=color_name,
                defaults={'hex_code': hex_code}
            )
            if created:
                created_count += 1
                self.stdout.write(f'  ✓ Created: {color.color_name} ({hex_code})')
            else:
                self.stdout.write(self.style.WARNING(f'  - Already exists: {color.color_name}'))
        
        self.stdout.write(
            self.style.SUCCESS(f'\nCompleted! Created {created_count} new colors.')
        )