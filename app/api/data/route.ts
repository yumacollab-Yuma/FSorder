import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAll(table: string, select: string): Promise<any[]> {
  const PAGE = 1000
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rows: any[] = []
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const priceMap: Record<string, Record<string, any>> = {}
  for (const p of dailyPrices) {
    const key = `${p.product_id}__${p.date}`
    if (!priceMap[key]) priceMap[key] = {}
    priceMap[key][String(p.unit_price)] = {
      orders: p.orders,
      units: p.units,
      organic: p.organic,
      paid: p.paid,
    }
  }

  const daily = dailyOrders.map((d: any) => ({
    ...d,
    prices: priceMap[`${d.product_id}__${d.date}`] || {},
  }))

  return NextResponse.json({ products, daily })
}
