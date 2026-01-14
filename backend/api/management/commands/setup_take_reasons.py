from django.core.management.base import BaseCommand
from api.models import TakeReason


class Command(BaseCommand):
    help = 'Populates the database with standardized take reasons for inventory transactions'

    def handle(self, *args, **options):
        """
        Creates predefined reason entries used across Gifts and Apparel inventories.
        Allows inventory-specific reasons while maintaining shared reasons for common use cases.
        """
        
        self.stdout.write(self.style.WARNING('Setting up take reasons...'))
        
        created_count = 0
        
        # Standard reasons with applicability scope
        reasons = [
            ('Event', 'both'),
            ('Office Use', 'both'),
            ('External Gift (Visitors/Meetings)', 'both'),
            ('New Employee Welcome', 'both'),
            ('Damaged/Defective', 'both'),
            ('Sample', 'both'),
            ('Other', 'both'),
        ]
        
        for reason_name, applies_to in reasons:
            reason, created = TakeReason.objects.get_or_create(
                reason_name=reason_name,
                defaults={'applies_to': applies_to}
            )
            if created:
                created_count += 1
                self.stdout.write(f'  ✓ Created: {reason.reason_name} ({reason.get_applies_to_display()})')
            else:
                self.stdout.write(self.style.WARNING(f'  - Already exists: {reason.reason_name}'))
        
        self.stdout.write(
            self.style.SUCCESS(f'\nCompleted! Created {created_count} new reasons.')
        )