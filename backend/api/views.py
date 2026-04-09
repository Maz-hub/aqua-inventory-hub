# Views have been moved to their respective apps.
# This file is kept temporarily for backwards compatibility.

from core.views import CreateUserView, TakeReasonList
from gifts.views import GiftListCreate, GiftDelete, update_gift_stock, update_gift, GiftCategoryList
from apparel.views import ApparelSizeList, ApparelColorList, ApparelCategoryList, ApparelProductListCreate, ApparelProductDetail, ApparelVariantListCreate, ApparelVariantDetail, update_apparel_stock, ApparelTransactionList
