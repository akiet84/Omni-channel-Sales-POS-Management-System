/**
 * Cart Domain module
 * Re-exports canonical types and calculation logic from @omni-sales/shared-types
 */
export {
  type DiscountType,
  type Discount,
  type CartItem,
  type CartTotals,
  type LineTotalCalculation,
  calculateLineTotal,
  calculateCartTotals,
  canAddOrIncrement,
} from '@omni-sales/shared-types';
