import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const password = req.headers.get('x-upload-password')
  if (password !== process.env.UPLOAD_PASSWORD) {
    return NextResponse.json({ error: '密码错误' }, { status: 401 })
  }

  await supabaseAdmin.from('daily_prices').delete().neq('id', 0)
  await supabaseAdmin.from('daily_orders').delete().neq('id', 0)
  await supabaseAdmin.from('creator_daily_prices').delete().neq('id', 0)
  await supabaseAdmin.from('creator_daily').delete().neq('id', 0)
  await supabaseAdmin.from('creator_commission').delete().neq('id', 0)

  return NextResponse.json({ ok: true })
}
