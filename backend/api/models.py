# Models have been moved to their respective apps.
# These imports maintain backwards compatibility
# while views and serializers are being migrated.

from gifts.models import GiftCategory, Gift, InventoryTransaction
from apparel.models import ApparelSize, ApparelColor, ApparelCategory, ApparelProduct, ApparelVariant, ApparelTransaction
from core.models import TakeReason
