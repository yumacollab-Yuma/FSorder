'use client'
import { useState } from 'react'
import type { PriceDetail } from '@/lib/types'
import { pct } from '@/lib/utils'
import TrendChart from './TrendChart'

type ContentSummary = {
  contentId: string
  orders: number
  organic: number
  paid: number
  refund: number
}

type Series = { label: string; color: string; values: number[] }

export default function ContentItem({
  content, index, trendDates, series, prices,
}: {
  content: ContentSummary
  index: number
  trendDates: string[]
  series: Series[]
  prices: Record<string, Record<string, PriceDetail>>
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-[#2a2d45] rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 bg-[#1c1f2e] flex items-center gap-3">
        <span className="text-[11px] font-bold text-[#6c63ff] bg-[rgba(108,99,255,0.15)] px-2 py-0.5 rounded">
          视频{index + 1}
        </span>
        <span className="text-[11px] text-[#444870] font-mono truncate max-w-[200px]">{content.contentId}</span>
        <div className="ml-auto flex items-center gap-4 text-xs">
          <span className="font-semibold text-[#dde1f0]">{content.orders} 单</span>
          <span className="text-[#3ecf8e]">自然 {pct(content.organic, content.orders)}%</span>
          <span className="text-[#f5a623]">广告 {pct(content.paid, content.orders)}%</span>
          {content.refund > 0 && <span className="text-[#e85d75]">退货 {pct(content.refund, content.orders)}%</span>}
          <button onClick={() => setExpanded(e => !e)}
            className="text-[11px] text-[#6c63ff] hover:text-white px-2 py-0.5 rounded border border-[#6c63ff]/30 hover:bg-[#6c63ff] transition-all">
            {expanded ? '收起' : '趋势'}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="p-4">
          <TrendChart dates={trendDates} series={series} height={120} prices={prices} />
        </div>
      )}
    </div>
  )
}
