import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const [
    { data: products },
    { data: dailyOrders },
    { data: dailyPrices },
  ] = await Promise.all([
    supabase.from('products').select('*').order('internal_name'),
    supabase.from('daily_orders').select('*').order('date'),
    supabase.from('daily_prices').select('*'),
  ])

  // Group prices by product_id + date
  const priceMap: Record<string, Record<string, { orders: number; units: number; organic: number; paid: number }>> = {}
  for (const p of dailyPrices || []) {
    const key = `${p.product_id}__${p.date}`
    if (!priceMap[key]) priceMap[key] = {}
    priceMap[key][String(p.unit_price)] = { orders: p.orders, units: p.units, organic: p.organic, paid: p.paid }
  }

  // Attach prices to daily entries
  const daily = (dailyOrders || []).map(d => ({
    ...d,
    prices: priceMap[`${d.product_id}__${d.date}`] || {},
  }))

  return NextResponse.json({ products: products || [], daily })
}
