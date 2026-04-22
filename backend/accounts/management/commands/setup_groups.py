from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group

class Command(BaseCommand):
    help = 'Creates the default permission groups for Aqua Inventory Hub'

    def handle(self, *args, **kwargs):
        """
        Creates all permission groups if they don't already exist.
        Safe to run multiple times — won't create duplicates.
        """
        groups = [
            'gifts_access',       # Access to Gifts inventory
            'apparel_access',     # Access to Apparel inventory
            'executive_access',   # Access to Executive Office inventory
            'it_access',          # Access to IT Assets inventory
            'admin',              # Full access to everything
        ]

        for group_name in groups:
            group, created = Group.objects.get_or_create(name=group_name)
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created group: {group_name}')
                )
            else:
                self.stdout.write(f'Group already exists: {group_name}')

        self.stdout.write(self.style.SUCCESS('Groups setup complete!'))
