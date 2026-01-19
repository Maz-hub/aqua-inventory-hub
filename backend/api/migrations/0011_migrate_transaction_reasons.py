from django.db import migrations


def migrate_reasons_forward(apps, schema_editor):
    """
    Migrates existing hardcoded reason values to TakeReason foreign keys.
    Maps old CharField values to corresponding TakeReason entries.
    """
    InventoryTransaction = apps.get_model('api', 'InventoryTransaction')
    TakeReason = apps.get_model('api', 'TakeReason')
    
    # Mapping of old CharField values to TakeReason names
    reason_mapping = {
        'event': 'Event',
        'office_use': 'Office Use',
        'external_gift': 'External Gift (Visitors/Meetings)',
        'new_employee': 'New Employee Welcome',
        'damaged': 'Damaged/Defective',
        'sample': 'Sample',
        'other': 'Other',
    }
    
    # Migrate each transaction
    for transaction in InventoryTransaction.objects.all():
        if transaction.reason:
            # Find the corresponding TakeReason
            reason_name = reason_mapping.get(transaction.reason)
            if reason_name:
                try:
                    take_reason = TakeReason.objects.get(reason_name=reason_name)
                    transaction.reason_new = take_reason
                    transaction.save()
                except TakeReason.DoesNotExist:
                    print(f"Warning: TakeReason '{reason_name}' not found for transaction {transaction.id}")


def migrate_reasons_backward(apps, schema_editor):
    """
    Reverses the migration by copying reason_new back to reason.
    Allows rolling back if needed.
    """
    InventoryTransaction = apps.get_model('api', 'InventoryTransaction')
    
    # Reverse mapping
    reverse_mapping = {
        'Event': 'event',
        'Office Use': 'office_use',
        'External Gift (Visitors/Meetings)': 'external_gift',
        'New Employee Welcome': 'new_employee',
        'Damaged/Defective': 'damaged',
        'Sample': 'sample',
        'Other': 'other',
    }
    
    for transaction in InventoryTransaction.objects.all():
        if transaction.reason_new:
            old_value = reverse_mapping.get(transaction.reason_new.reason_name)
            if old_value:
                transaction.reason = old_value
                transaction.save()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_inventorytransaction_reason_new'),
    ]

    operations = [
        migrations.RunPython(migrate_reasons_forward, migrate_reasons_backward),
    ]