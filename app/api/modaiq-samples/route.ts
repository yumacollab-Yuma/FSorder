import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const modaiq = createClient(
  process.env.MODAIQ_SUPABASE_URL!,
  process.env.MODAIQ_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const internalName = searchParams.get('product')

  if (!internalName) {
    return NextResponse.json({ error: '缺少 product 参数' }, { status: 400 })
  }

  const { data, error } = await modaiq
    .from('influencers')
    .select('data')
    .eq('store_id', 'store1')
    .filter('data->>product', 'eq', internalName)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const sampledCreators: string[] = (data || [])
    .map((row: { data: unknown }) => {
      // data field may come back as string or object depending on Supabase client version
      const d = typeof row.data === 'string' ? JSON.parse(row.data) : row.data
      return d?.influencerId
    })
    .filter((id): id is string => typeof id === 'string' && id.length > 0)

  return NextResponse.json({ sampledCreators: [...new Set(sampledCreators)] })
}
