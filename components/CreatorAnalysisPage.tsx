'use client'
import { useState } from 'react'
import type { Product, CreatorDaily } from '@/lib/types'
import { displayName, pct, medalEmoji, medalLabel } from '@/lib/utils'
import TrendChart from './TrendChart'

const LINE_COLORS = ['#6c63ff','#3ecf8e','#f5a623','#e85d75','#38bdf8','#a78bfa','#fb923c','#34d399']

export default function CreatorAnalysisPage({
  products, creatorDaily, initialCreator, initialPid,
}: {
  products: Product[]
  creatorDaily: CreatorDaily[]
  initialCreator?: string
  initialPid?: string
}) {
  const [creatorSearch, setCreatorSearch] = useState('')
  const [selectedCreator, setSelectedCreator] = useState(initialCreator || '')
  const [selectedPids, setSelectedPids] = useState<Set<string>>(
    initialPid ? new Set([initialPid]) : new Set()
  )
  const [rangeStart, setRangeStart] = useState(() => {
    if (initialCreator) {
      const dates = creatorDaily.filter(d => d.creator === initialCreator).map(d => d.date).sort()
      return dates[0] || ''
    }
    return ''
  })
  const [rangeEnd, setRangeEnd] = useState(() => {
    if (initialCreator) {
      const dates = creatorDaily.filter(d => d.creator === initialCreator).map(d => d.date).sort()
      return dates[dates.length - 1] || ''
    }
    return ''
  })
  const [channelFilter, setChannelFilter] = useState<'all' | '视频' | '直播'>('all')
  const [metricMode, setMetricMode] = useState<'total' | 'breakdown'>('total')
  const [expandedContent, setExpandedContent] = useState<string | null>(null)

  const creatorTotals: Record<string, number> = {}
  for (const d of creatorDaily) {
    if (d.creator) creatorTotals[d.creator] = (creatorTotals[d.creator] || 0) + d.orders
  }
  const allCreators = [...new Set(creatorDaily.map(d => d.creator))].filter(Boolean)
    .sort((a, b) => (creatorTotals[b] || 0) - (creatorTotals[a] || 0))
  const filteredCreators = allCreators.filter(c => !creatorSearch || c.toLowerCase().includes(creatorSearch.toLowerCase()))

  function selectCreator(c: string) {
    setSelectedCreator(c)
    const pids = new Set(creatorDaily.filter(d => d.creator === c).map(d => d.product_id))
    setSelectedPids(pids)
    const dates = creatorDaily.filter(d => d.creator === c).map(d => d.date).sort()
    if (dates.length) { setRangeStart(dates[0]); setRangeEnd(dates[dates.length - 1]) }
    setChannelFilter('all')
    setExpandedContent(null)
  }

  function togglePid(pid: string) {
    setSelectedPids(prev => {
      const next = new Set(prev)
      next.has(pid) ? next.delete(pid) : next.add(pid)
      return next
    })
  }

  const creatorProducts = products.filter(p =>
    creatorDaily.some(d => d.creator === selectedCreator && d.product_id === p.id)
  )

  const allDates = [...new Set(
    creatorDaily.filter(d => d.creator === selectedCreator).map(d => d.date)
  )].sort()
  const minDate = allDates[0] || ''
  const maxDate = allDates[allDates.length - 1] || ''

  function quickRange(t: string) {
    const last = allDates[allDates.length - 1]; if (!last) return
    if (t === 'all') { setRangeStart(allDates[0]); setRangeEnd(last) }
    if (t === '7d')  { setRangeStart(allDates[Math.max(0, allDates.length - 7)]);  setRangeEnd(last) }
    if (t === '14d') { setRangeStart(allDates[Math.max(0, allDates.length - 14)]); setRangeEnd(last) }
    if (t === '30d') { setRangeStart(allDates[Math.max(0, allDates.length - 30)]); setRangeEnd(last) }
  }

  const filtered = creatorDaily.filter(d =>
    d.creator === selectedCreator &&
    d.date >= rangeStart && d.date <= rangeEnd &&
    selectedPids.has(d.product_id) &&
    (channelFilter === 'all' || d.channel === channelFilter)
  )

  const trendDates = allDates.filter(d => d >= rangeStart && d <= rangeEnd)

  function buildTrendSeries() {
    if (metricMode === 'total') {
      const byDate: Record<string, number> = {}
      for (const d of trendDates) byDate[d] = 0
      for (const e of filtered) { if (byDate[e.date] !== undefined) byDate[e.date] += e.orders }
      return [{ label: '总订单', color: '#6c63ff', values: trendDates.map(d => byDate[d] || 0) }]
    } else {
      const byDate: Record<string, { total: number; organic: number; paid: number }> = {}
      for (const d of trendDates) byDate[d] = { total: 0, organic: 0, paid: 0 }
      for (const e of filtered) {
        if (byDate[e.date]) {
          byDate[e.date].total   += e.orders
          byDate[e.date].organic += e.organic_orders
          byDate[e.date].paid    += e.paid_orders
        }
      }
      return [
        { label: '总订单', color: '#6c63ff', values: trendDates.map(d => byDate[d]?.total || 0) },
        { label: '自然流', color: '#3ecf8e', values: trendDates.map(d => byDate[d]?.organic || 0) },
        { label: '广告流', color: '#f5a623', values: trendDates.map(d => byDate[d]?.paid || 0) },
      ]
    }
  }

  const totalOrders  = filtered.reduce((s, d) => s + d.orders, 0)
  const totalOrganic = filtered.reduce((s, d) => s + d.organic_orders, 0)
  const totalPaid    = filtered.reduce((s, d) => s + d.paid_orders, 0)
  const totalRefund  = filtered.reduce((s, d) => s + d.refund_orders, 0)
  const videoOrders  = filtered.filter(d => d.channel === '视频').reduce((s, d) => s + d.orders, 0)
  const liveOrders   = filtered.filter(d => d.channel === '直播').reduce((s, d) => s + d.orders, 0)

  const pidSummary = [...selectedPids].map(pid => {
    const entries = filtered.filter(d => d.product_id === pid)
    return {
      pid,
      product: products.find(p => p.id === pid),
      orders: entries.reduce((s, d) => s + d.orders, 0),
    }
  }).filter(p => p.orders > 0).sort((a, b) => b.orders - a.orders)

  // Content ID analysis per product
  function getContentSummary(pid: string) {
    const entries = filtered.filter(d => d.product_id === pid && d.content_id)
    const contentMap: Record<string, { orders: number; organic: number; paid: number; refund: number; dates: string[] }> = {}
    for (const e of entries) {
      if (!e.content_id) continue
      if (!contentMap[e.content_id]) contentMap[e.content_id] = { orders: 0, organic: 0, paid: 0, refund: 0, dates: [] }
      contentMap[e.content_id].orders  += e.orders
      contentMap[e.content_id].organic += e.organic_orders
      contentMap[e.content_id].paid    += e.paid_orders
      contentMap[e.content_id].refund  += e.refund_orders
      contentMap[e.content_id].dates.push(e.date)
    }
    return Object.entries(contentMap)
      .map(([cid, v]) => ({ contentId: cid, ...v }))
      .sort((a, b) => b.orders - a.orders)
  }

  // Trend for a specific content_id
  function buildContentTrend(contentId: string) {
    const entries = filtered.filter(d => d.content_id === contentId)
    const byDate: Record<string, number> = {}
    for (const d of trendDates) byDate[d] = 0
    for (const e of entries) { if (byDate[e.date] !== undefined) byDate[e.date] += e.orders }
    return [{ label: '订单', color: '#6c63ff', values: trendDates.map(d => byDate[d] || 0) }]
  }

  // Aggregate prices across filtered entries for main trend tooltip
  function buildCreatorPriceMap() {
    const map: Record<string, Record<string, { orders: number; units: number; organic: number; paid: number; refund: number }>> = {}
    for (const e of filtered) {
      if (!e.prices) continue
      if (!map[e.date]) map[e.date] = {}
      for (const [price, pd] of Object.entries(e.prices)) {
        if (!map[e.date][price]) map[e.date][price] = { orders: 0, units: 0, organic: 0, paid: 0, refund: 0 }
        map[e.date][price].orders  += pd.orders
        map[e.date][price].units   += pd.units
        map[e.date][price].organic += pd.organic
        map[e.date][price].paid    += pd.paid
        map[e.date][price].refund  += pd.refund
      }
    }
    return map
  }

  function buildContentPriceMap(contentId: string) {
    const map: Record<string, Record<string, { orders: number; units: number; organic: number; paid: number; refund: number }>> = {}
    for (const e of filtered) {
      if (e.content_id !== contentId || !e.prices) continue
      if (!map[e.date]) map[e.date] = {}
      for (const [price, pd] of Object.entries(e.prices)) {
        if (!map[e.date][price]) map[e.date][price] = { orders: 0, units: 0, organic: 0, paid: 0, refund: 0 }
        map[e.date][price].orders  += pd.orders
        map[e.date][price].units   += pd.units
        map[e.date][price].organic += pd.organic
        map[e.date][price].paid    += pd.paid
        map[e.date][price].refund  += pd.refund
      }
    }
    return map
  }

    return (
    <div className="flex" style={{ height: 'calc(100vh - 52px)' }}>
      {/* Creator sidebar */}
      <div className="w-52 min-w-[208px] bg-[#13151f] border-r border-[#2a2d45] flex flex-col overflow-hidden">
        <div className="p-3 border-b border-[#2a2d45]">
          <div className="text-[10px] font-semibold text-[#444870] uppercase tracking-widest mb-2">达人</div>
          <input placeholder="搜索达人..." value={creatorSearch} onChange={e => setCreatorSearch(e.target.value)}
            className="w-full bg-[#1c1f2e] border border-[#2a2d45] rounded-lg px-2.5 py-1.5 text-xs text-[#dde1f0] outline-none focus:border-[#6c63ff] placeholder-[#444870]" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredCreators.map((c, i) => (
            <div key={c} onClick={() => selectCreator(c)}
              className={`px-3 py-2.5 border-b border-[#2a2d45] cursor-pointer transition-all ${selectedCreator === c ? 'bg-[rgba(108,99,255,0.15)] border-l-2 border-l-[#6c63ff] pl-2.5' : 'hover:bg-[#1c1f2e]'}`}>
              <div className="flex items-center gap-1.5">
                <span className="flex items-center justify-center w-5 text-sm leading-none flex-shrink-0" title={medalLabel(i)}>{medalEmoji(i)}</span>
                <div className="text-[12px] font-semibold text-[#dde1f0] truncate">{c}</div>
              </div>
              <div className="text-[11px] text-[#444870] mt-0.5 pl-6">{(creatorTotals[c] || 0).toLocaleString()} 单</div>
            </div>
          ))}
          {filteredCreators.length === 0 && <div className="px-3 py-4 text-xs text-[#444870]">无匹配达人</div>}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto p-6">
        {!selectedCreator ? (
          <div className="flex items-center justify-center h-full text-[#444870] text-sm">从左侧选择达人</div>
        ) : (
          <>
            <div className="mb-5">
              <div className="text-xl font-bold">{selectedCreator}</div>
              <div className="text-xs text-[#444870] mt-1">覆盖 {creatorProducts.length} 个产品</div>
            </div>

            {/* Product multi-select */}
            <div className="bg-[#13151f] border border-[#2a2d45] rounded-xl p-4 mb-4">
              <div className="text-[11px] text-[#444870] uppercase tracking-wider mb-2">筛选产品</div>
              <div className="flex flex-wrap gap-2">
                {creatorProducts.map((p, i) => (
                  <button key={p.id} onClick={() => togglePid(p.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all font-medium ${selectedPids.has(p.id) ? 'text-white border-transparent' : 'text-[#7e849e] border-[#2a2d45] bg-[#1c1f2e]'}`}
                    style={selectedPids.has(p.id) ? { background: LINE_COLORS[creatorProducts.indexOf(p) % LINE_COLORS.length], borderColor: LINE_COLORS[creatorProducts.indexOf(p) % LINE_COLORS.length] } : {}}>
                    {displayName(p)}
                  </button>
                ))}
              </div>
            </div>

            {/* Time + channel filter */}
            <div className="flex items-center gap-2 flex-wrap mb-6 p-3 bg-[#13151f] border border-[#2a2d45] rounded-xl">
              {['7d','14d','30d','all'].map(t => (
                <button key={t} onClick={() => quickRange(t)}
                  className="px-2.5 py-1 text-xs rounded-md border border-[#2a2d45] text-[#7e849e] bg-[#1c1f2e] hover:border-[#6c63ff] hover:text-white transition-all">
                  {t === 'all' ? '全部' : `近${t.replace('d','天')}`}
                </button>
              ))}
              <div className="flex items-center gap-2 text-xs text-[#444870]">
                <span>从</span>
                <input type="date" value={rangeStart} min={minDate} max={maxDate} onChange={e => setRangeStart(e.target.value)}
                  className="bg-[#1c1f2e] border border-[#2a2d45] rounded-md px-2 py-1 text-xs text-[#dde1f0] outline-none focus:border-[#6c63ff]" style={{colorScheme:'dark'}} />
                <span>至</span>
                <input type="date" value={rangeEnd} min={minDate} max={maxDate} onChange={e => setRangeEnd(e.target.value)}
                  className="bg-[#1c1f2e] border border-[#2a2d45] rounded-md px-2 py-1 text-xs text-[#dde1f0] outline-none focus:border-[#6c63ff]" style={{colorScheme:'dark'}} />
              </div>
              <div className="ml-4 flex rounded-lg overflow-hidden border border-[#2a2d45]">
                {(['all','视频','直播'] as const).map(ch => (
                  <button key={ch} onClick={() => setChannelFilter(ch)}
                    className={`px-3 py-1 text-xs font-medium transition-all ${channelFilter === ch ? 'bg-[#6c63ff] text-white' : 'text-[#7e849e] bg-[#1c1f2e] hover:text-white'}`}>
                    {ch === 'all' ? '全渠道' : ch}
                  </button>
                ))}
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-6 gap-3 mb-6">
              {[
                { label: '总订单', value: totalOrders,  color: '',               sub: '成交+退货' },
                { label: '视频单', value: videoOrders,  color: 'text-[#38bdf8]', sub: `${pct(videoOrders, totalOrders)}%` },
                { label: '直播单', value: liveOrders,   color: 'text-[#a78bfa]', sub: `${pct(liveOrders, totalOrders)}%` },
                { label: '自然流', value: totalOrganic, color: 'text-[#3ecf8e]', sub: `${pct(totalOrganic, totalOrders)}%` },
                { label: '广告流', value: totalPaid,    color: 'text-[#f5a623]', sub: `${pct(totalPaid, totalOrders)}%` },
                { label: '退货',   value: totalRefund,  color: 'text-[#e85d75]', sub: `${pct(totalRefund, totalOrders)}% 退货率` },
              ].map(c => (
                <div key={c.label} className="bg-[#13151f] border border-[#2a2d45] rounded-xl p-3">
                  <div className="text-[11px] text-[#444870] uppercase tracking-wider mb-1.5">{c.label}</div>
                  <div className={`text-xl font-bold ${c.color}`}>{c.value.toLocaleString()}</div>
                  <div className="text-[11px] text-[#444870] mt-1">{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Trend chart */}
            <div className="bg-[#13151f] border border-[#2a2d45] rounded-xl p-5 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[11px] font-semibold text-[#444870] uppercase tracking-widest">每日成交趋势</span>
                <div className="flex rounded-lg overflow-hidden border border-[#2a2d45] ml-auto">
                  {(['total','breakdown'] as const).map(m => (
                    <button key={m} onClick={() => setMetricMode(m)}
                      className={`px-3 py-1 text-xs font-medium transition-all ${metricMode === m ? 'bg-[#6c63ff] text-white' : 'text-[#7e849e] bg-[#1c1f2e] hover:text-white'}`}>
                      {m === 'total' ? '总量' : '渠道拆分'}
                    </button>
                  ))}
                </div>
              </div>
              <TrendChart dates={trendDates} series={buildTrendSeries()} prices={buildCreatorPriceMap()} />
            </div>

            {/* Per-product breakdown with content analysis */}
            {pidSummary.map((p, pi) => {
              const contentList = getContentSummary(p.pid)
              const hasContent = contentList.length > 0
              const isExpanded = expandedContent === p.pid

              return (
                <div key={p.pid} className="bg-[#13151f] border border-[#2a2d45] rounded-xl overflow-hidden mb-4">
                  {/* Product header */}
                  <div className="px-4 py-3 bg-[#1c1f2e] flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: LINE_COLORS[pi % LINE_COLORS.length] }} />
                    <span className="text-sm font-semibold text-[#dde1f0]">{displayName(p.product)}</span>
                    <span className="text-xs text-[#444870] ml-1">{p.orders.toLocaleString()} 单</span>
                    {hasContent && (
                      <button onClick={() => setExpandedContent(isExpanded ? null : p.pid)}
                        className="ml-auto text-xs text-[#6c63ff] hover:text-white transition-all px-2.5 py-1 rounded-md border border-[#6c63ff]/30 hover:bg-[#6c63ff]">
                        {isExpanded ? '收起内容' : `查看 ${contentList.length} 个内容`}
                      </button>
                    )}
                  </div>

                  {/* Content list */}
                  {isExpanded && hasContent && (
                    <div className="p-4">
                      <div className="flex flex-col gap-4">
                        {contentList.map((c, ci) => (
                          <div key={c.contentId} className="border border-[#2a2d45] rounded-xl overflow-hidden">
                            {/* Content header */}
                            <div className="px-4 py-2.5 bg-[#1c1f2e] flex items-center gap-3">
                              <span className="text-[11px] font-bold text-[#6c63ff] bg-[rgba(108,99,255,0.15)] px-2 py-0.5 rounded">
                                视频{ci + 1}
                              </span>
                              <span className="text-[11px] text-[#444870] font-mono truncate max-w-[200px]">{c.contentId}</span>
                              <div className="ml-auto flex items-center gap-4 text-xs">
                                <span className="font-semibold text-[#dde1f0]">{c.orders} 单</span>
                                <span className="text-[#3ecf8e]">自然 {pct(c.organic, c.orders)}%</span>
                                <span className="text-[#f5a623]">广告 {pct(c.paid, c.orders)}%</span>
                                {c.refund > 0 && <span className="text-[#e85d75]">退货 {pct(c.refund, c.orders)}%</span>}
                              </div>
                            </div>
                            {/* Content trend */}
                            <div className="p-4">
                              <TrendChart dates={trendDates} series={buildContentTrend(c.contentId)} height={120} prices={buildContentPriceMap(c.contentId)} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
