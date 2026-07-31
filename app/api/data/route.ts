import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

async function fetchAll(table: string, select: string) {
  const PAGE = 1000
  let rows: Record<string, unknown>[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + PAGE - 1)
    if (error) throw new Error(`${table}: ${error.message}`)
    if (!data || data.length === 0) break
    rows = rows.concat(data)
    if (data.length < PAGE) break
    from += PAGE
  }
  return rows
}

export async function GET() {
  const [products, dailyOrders, dailyPrices] = await Promise.all([
    fetchAll('products', '*'),
    fetchAll('daily_orders', '*'),
    fetchAll('daily_prices', '*'),
  ])

  // Group prices by product_id + date
  const priceMap: Record<string, Record<string, { orders: number; units: number; organic: number; paid: number }>> = {}
  for (const p of dailyPrices) {
    const key = `${p.product_id}__${p.date}`
    if (!priceMap[key]) priceMap[key] = {}
    priceMap[key][String(p.unit_price)] = {
      orders: p.orders as number,
      units: p.units as number,
      organic: p.organic as number,
      paid: p.paid as number,
    }
  }

  const daily = dailyOrders.map(d => ({
    ...d,
    prices: priceMap[`${d.product_id}__${d.date}`] || {},
  }))

  return NextResponse.json({ products, daily })
}
