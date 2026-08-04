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

  const { oldName, newName } = await req.json()
  if (!oldName?.trim() || !newName?.trim()) {
    return NextResponse.json({ error: '原名和现名不能为空' }, { status: 400 })
  }
  if (oldName.trim() === newName.trim()) {
    return NextResponse.json({ error: '原名和现名相同' }, { status: 400 })
  }

  const tables = ['creator_daily', 'creator_commission']

  for (const table of tables) {
    const { error } = await supabaseAdmin
      .from(table)
      .update({ creator: newName.trim() })
      .eq('creator', oldName.trim())

    if (error) return NextResponse.json({ error: `${table}: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
