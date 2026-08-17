export type Product = { id: string; internal_name: string; full_name: string }
export type PriceDetail = { orders: number; units: number; organic: number; paid: number; refund: number }
export type DailyEntry = {
  product_id: string; date: string
  total_orders: number; total_units: number
  organic_orders: number; paid_orders: number; refund_orders: number
  prices: Record<string, PriceDetail>
}
export type CreatorDaily = {
  product_id: string; date: string; creator: string; channel: string; content_id: string
  orders: number; organic_orders: number; paid_orders: number; refund_orders: number
  prices: Record<string, PriceDetail>  // per-price breakdown for this creator+content+date
}
export type CreatorCommission = {
  product_id: string; date: string; creator: string
  commission_type: string; commission_rate: string; orders: number
}
