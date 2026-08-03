import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function parseDate(val: unknown): string | null {
  if (!val) return null
  const s = String(val).trim()
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  if (m) return `${m[3]}-${m[2]}-${m[1]}`
  const m2 = s.match(/^(\d{4}-\d{2}-\d{2})/)
  if (m2) return m2[1]
  return null
}

export async function POST(req: NextRequest) {
  const password = req.headers.get('x-upload-password')
  if (password !== process.env.UPLOAD_PASSWORD) {
    return NextResponse.json({ error: '密码错误' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: '未收到文件' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const wb = XLSX.read(buffer, { type: 'buffer' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws, { defval: null }) as Record<string, unknown>[]

  const productMap: Record<string, { id: string; fullName: string }> = {}
  const dayBuf: Record<string, {
    productId: string; date: string
    orders: { units: number; price: number; isOrganic: boolean; isPaid: boolean; isRefund: boolean }[]
  }> = {}

  let skipped = 0

  for (const row of rows) {
    const payDate = parseDate(row['支付时间'])
    if (!payDate) { skipped++; continue }

    const pid      = String(row['商品 ID'] || row['商品ID'] || '').trim()
    const fullName = String(row['商品名称 '] || row['商品名称'] || '').trim()
    const units    = parseInt(String(row['下单件数'] || '1')) || 1
    const estComm  = parseFloat(String(row['预估计佣金额'] || '0')) || 0
    const unitPrice = Math.round((estComm / units) * 100) / 100
    const isRefund  = row['已全部退货或全额退款'] === '是'
    const isOrganic = !isRefund && row['标准佣金率'] != null && row['标准佣金率'] !== ''
    const isPaid    = !isRefund && row['店铺广告佣金率'] != null && row['店铺广告佣金率'] !== ''

    if (!pid) { skipped++; continue }

    if (!productMap[pid]) productMap[pid] = { id: pid, fullName }

    const key = `${pid}__${payDate}`
    if (!dayBuf[key]) dayBuf[key] = { productId: pid, date: payDate, orders: [] }
    dayBuf[key].orders.push({ units, price: unitPrice, isOrganic, isPaid, isRefund })
  }

  // Upsert products
  for (const p of Object.values(productMap)) {
    const { data: existing } = await supabaseAdmin
      .from('products').select('id').eq('id', p.id).single()
    if (!existing) {
      await supabaseAdmin.from('products').insert({ id: p.id, full_name: p.fullName, internal_name: '' })
    } else if (p.fullName) {
      await supabaseAdmin.from('products').update({ full_name: p.fullName }).eq('id', p.id)
    }
  }

  // Build aggregates
  const dailyRows: {
    product_id: string; date: string
    total_orders: number; total_units: number
    organic_orders: number; paid_orders: number; refund_orders: number
  }[] = []

  const priceRows: {
    product_id: string; date: string; unit_price: number
    orders: number; units: number; organic: number; paid: number; refund: number
  }[] = []

  for (const buf of Object.values(dayBuf)) {
    const { productId, date, orders } = buf
    let totalOrders = 0, totalUnits = 0, totalOrganic = 0, totalPaid = 0, totalRefund = 0
    const priceMap: Record<number, { orders: number; units: number; organic: number; paid: number; refund: number }> = {}

    for (const o of orders) {
      totalOrders++
      if (!o.isRefund) totalUnits += o.units
      if (o.isOrganic) totalOrganic++
      if (o.isPaid) totalPaid++
      if (o.isRefund) totalRefund++

      if (!priceMap[o.price]) priceMap[o.price] = { orders: 0, units: 0, organic: 0, paid: 0, refund: 0 }
      priceMap[o.price].orders++
      if (!o.isRefund) priceMap[o.price].units += o.units
      if (o.isOrganic) priceMap[o.price].organic++
      if (o.isPaid) priceMap[o.price].paid++
      if (o.isRefund) priceMap[o.price].refund++
    }

    dailyRows.push({
      product_id: productId, date,
      total_orders: totalOrders, total_units: totalUnits,
      organic_orders: totalOrganic, paid_orders: totalPaid, refund_orders: totalRefund,
    })

    for (const [price, pd] of Object.entries(priceMap)) {
      priceRows.push({ product_id: productId, date, unit_price: parseFloat(price), ...pd })
    }
  }

  const batchUpsert = async (table: string, data: Record<string, unknown>[], conflict: string) => {
    for (let i = 0; i < data.length; i += 500) {
      const batch = data.slice(i, i + 500)
      const { error } = await supabaseAdmin.from(table).upsert(batch, { onConflict: conflict })
      if (error) throw new Error(`${table}: ${error.message}`)
    }
  }

  await batchUpsert('daily_orders', dailyRows as unknown as Record<string, unknown>[], 'product_id,date')
  await batchUpsert('daily_prices', priceRows as unknown as Record<string, unknown>[], 'product_id,date,unit_price')

  return NextResponse.json({
    ok: true,
    imported: Object.values(dayBuf).reduce((s, b) => s + b.orders.length, 0),
    skipped,
    days: dailyRows.length,
  })
}
