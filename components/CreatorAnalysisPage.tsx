'use client'
import { useEffect, useState, useRef, useCallback } from 'react'

type Product = { id: string; internal_name: string; full_name: string }
type CreatorDaily = {
  product_id: string; date: string; creator: string; channel: string
  orders: number; organic_orders: number; paid_orders: number; refund_orders: number
}

function displayName(p: Product | undefined) {
  return p?.internal_name || p?.full_name || p?.id || '未知'
}
function pct(n: number, d: number) { return d ? Math.round(n / d * 100) : 0 }

const LINE_COLORS = ['#6c63ff','#3ecf8e','#f5a623','#e85d75','#38bdf8','#a78bfa','#fb923c','#34d399']

function TrendChart({ dates, series }: {
  dates: string[]
  series: { label: string; color: string; values: number[]; dash?: number[] }[]
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; idx: number } | null>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const parent = canvas.parentElement!
    const dpr = window.devicePixelRatio || 1
    const W = parent.clientWidth - 4, H = 240
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px'
    canvas.width = W * dpr; canvas.height = H * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr); ctx.clearRect(0, 0, W, H)

    if (!dates.length) {
      ctx.fillStyle = '#444870'; ctx.font = '13px -apple-system,sans-serif'
      ctx.textAlign = 'center'; ctx.fillText('该时间段内无数据', W / 2, H / 2); return
    }

    const allVals = series.flatMap(s => s.values)
    const maxVal = Math.max(...allVals, 1)
    const padL = 52, padR = 16, padT = 24, padB = 40
    const chartW = W - padL - padR, chartH = H - padT - padB

    ctx.strokeStyle = '#2a2d45'; ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padT + (chartH / 4) * i
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke()
      ctx.fillStyle = '#444870'; ctx.font = '10px -apple-system,sans-serif'; ctx.textAlign = 'right'
      ctx.fillText(String(Math.round(maxVal * (1 - i / 4))), padL - 6, y + 4)
    }
    const step = Math.max(1, Math.floor(dates.length / 8))
    ctx.fillStyle = '#444870'; ctx.font = '10px -apple-system,sans-serif'; ctx.textAlign = 'center'
    dates.forEach((d, i) => {
      if (i % step === 0 || i === dates.length - 1)
        ctx.fillText(d.substring(5), padL + (i / (dates.length - 1 || 1)) * chartW, H - padB + 18)
    })

    const xPos = (i: number) => padL + (i / (dates.length - 1 || 1)) * chartW
    const yPos = (v: number) => padT + chartH - (v / maxVal) * chartH

    for (const s of series) {
      ctx.beginPath(); ctx.strokeStyle = s.color; ctx.lineWidth = 2; ctx.lineJoin = 'round'
      ctx.setLineDash(s.dash || [])
      s.values.forEach((v, i) => i === 0 ? ctx.moveTo(xPos(i), yPos(v)) : ctx.lineTo(xPos(i), yPos(v)))
      ctx.stroke(); ctx.setLineDash([])
    }

    // Legend
    let lx = padL
    for (const s of series) {
      ctx.fillStyle = s.color; ctx.fillRect(lx, 8, 14, 2.5)
      ctx.fillStyle = '#7e849e'; ctx.font = '10px -apple-system,sans-serif'; ctx.textAlign = 'left'
      ctx.fillText(s.label, lx + 18, 13)
      lx += ctx.measureText(s.label).width + 42
    }

    canvas.dataset.padL = String(padL); canvas.dataset.padR = String(padR)
    canvas.dataset.chartW = String(chartW); canvas.dataset.W = String(W); canvas.dataset.len = String(dates.length)
  }, [dates, series])

  useEffect(() => { draw() }, [draw])
  useEffect(() => { window.addEventListener('resize', draw); return () => window.removeEventListener('resize', draw) }, [draw])

  function handleMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const padL = parseFloat(canvas.dataset.padL || '52')
    const padR = parseFloat(canvas.dataset.padR || '16')
    const chartW = parseFloat(canvas.dataset.chartW || '0')
    const W = parseFloat(canvas.dataset.W || '0')
    const len = parseInt(canvas.dataset.len || '0')
    if (mx < padL || mx > W - padR || len === 0) { setTooltip(null); return }
    const idx = Math.min(len - 1, Math.max(0, Math.round((mx - padL) / chartW * (len - 1))))
    setTooltip({ x: e.clientX, y: e.clientY, idx })
  }

  return (
    <div className="relative">
      <canvas ref={canvasRef} height={240} onMouseMove={handleMove} onMouseLeave={() => setTooltip(null)} style={{ cursor: 'crosshair' }} />
      {tooltip && (
        <div className="fixed z-50 pointer-events-none bg-[#242840] border border-[#363a58] rounded-xl p-3 shadow-2xl min-w-[160px]"
          style={{ left: tooltip.x + 12, top: tooltip.y - 60 }}>
          <div className="text-xs font-bold text-[#dde1f0] mb-2 pb-1.5 border-b border-[#2a2d45]">{dates[tooltip.idx]}</div>
          {series.map(s => (
            <div key={s.label} className="flex justify-between gap-4 text-xs mb-1">
              <span className="text-[#7e849e] flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: s.color }} />{s.label}
              </span>
              <span className="font-semibold text-[#dde1f0]">{s.values[tooltip.idx]?.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CreatorAnalysisPage({
  products, creatorDaily,
}: {
  products: Product[]
  creatorDaily: CreatorDaily[]
}) {
  const [creatorSearch, setCreatorSearch] = useState('')
  const [selectedCreator, setSelectedCreator] = useState('')
  const [selectedPids, setSelectedPids] = useState<Set<string>>(new Set())
  const [rangeStart, setRangeStart] = useState('')
  const [rangeEnd, setRangeEnd] = useState('')
  const [channelFilter, setChannelFilter] = useState<'all' | '视频' | '直播'>('all')
  const [metricMode, setMetricMode] = useState<'total' | 'breakdown'>('total')

  // All creators
  const allCreators = [...new Set(creatorDaily.map(d => d.creator))].filter(Boolean).sort()
  const filteredCreators = allCreators.filter(c => !creatorSearch || c.toLowerCase().includes(creatorSearch.toLowerCase()))

  function selectCreator(c: string) {
    setSelectedCreator(c)
    // Default: all products this creator has data for
    const pids = new Set(creatorDaily.filter(d => d.creator === c).map(d => d.product_id))
    setSelectedPids(pids)
    const dates = creatorDaily.filter(d => d.creator === c).map(d => d.date).sort()
    if (dates.length) { setRangeStart(dates[0]); setRangeEnd(dates[dates.length - 1]) }
    setChannelFilter('all')
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

  // Filtered entries
  const filtered = creatorDaily.filter(d =>
    d.creator === selectedCreator &&
    d.date >= rangeStart && d.date <= rangeEnd &&
    selectedPids.has(d.product_id) &&
    (channelFilter === 'all' || d.channel === channelFilter)
  )

  const trendDates = allDates.filter(d => d >= rangeStart && d <= rangeEnd)

  // Build trend series
  function buildTrendSeries() {
    if (metricMode === 'total') {
      // One line: total orders per day
      const byDate: Record<string, number> = {}
      for (const d of trendDates) byDate[d] = 0
      for (const e of filtered) { if (byDate[e.date] !== undefined) byDate[e.date] += e.orders }
      return [{ label: '总订单', color: '#6c63ff', values: trendDates.map(d => byDate[d] || 0) }]
    } else {
      // 3 lines: total, organic, paid
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

  // Summary stats
  const totalOrders  = filtered.reduce((s, d) => s + d.orders, 0)
  const totalOrganic = filtered.reduce((s, d) => s + d.organic_orders, 0)
  const totalPaid    = filtered.reduce((s, d) => s + d.paid_orders, 0)
  const totalRefund  = filtered.reduce((s, d) => s + d.refund_orders, 0)
  const videoOrders  = filtered.filter(d => d.channel === '视频').reduce((s, d) => s + d.orders, 0)
  const liveOrders   = filtered.filter(d => d.channel === '直播').reduce((s, d) => s + d.orders, 0)

  // Per-product summary
  const pidSummary = [...selectedPids].map(pid => {
    const entries = filtered.filter(d => d.product_id === pid)
    return {
      pid,
      product: products.find(p => p.id === pid),
      orders: entries.reduce((s, d) => s + d.orders, 0),
    }
  }).filter(p => p.orders > 0).sort((a, b) => b.orders - a.orders)

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
          {filteredCreators.map(c => (
            <div key={c} onClick={() => selectCreator(c)}
              className={`px-3 py-2.5 border-b border-[#2a2d45] cursor-pointer transition-all ${selectedCreator === c ? 'bg-[rgba(108,99,255,0.15)] border-l-2 border-l-[#6c63ff] pl-2.5' : 'hover:bg-[#1c1f2e]'}`}>
              <div className="text-[12px] font-semibold text-[#dde1f0] truncate">{c}</div>
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

            {/* Product multi-select + channel filter */}
            <div className="bg-[#13151f] border border-[#2a2d45] rounded-xl p-4 mb-4">
              <div className="text-[11px] text-[#444870] uppercase tracking-wider mb-2">筛选产品</div>
              <div className="flex flex-wrap gap-2">
                {creatorProducts.map((p, i) => (
                  <button key={p.id} onClick={() => togglePid(p.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all font-medium ${selectedPids.has(p.id) ? 'text-white border-transparent' : 'text-[#7e849e] border-[#2a2d45] bg-[#1c1f2e]'}`}
                    style={selectedPids.has(p.id) ? { background: LINE_COLORS[i % LINE_COLORS.length], borderColor: LINE_COLORS[i % LINE_COLORS.length] } : {}}>
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
                { label: '总订单', value: totalOrders, color: '', sub: '成交+退货' },
                { label: '视频单', value: videoOrders, color: 'text-[#38bdf8]', sub: `${pct(videoOrders, totalOrders)}%` },
                { label: '直播单', value: liveOrders,  color: 'text-[#a78bfa]', sub: `${pct(liveOrders, totalOrders)}%` },
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
              <TrendChart dates={trendDates} series={buildTrendSeries()} />
            </div>

            {/* Per-product breakdown */}
            {pidSummary.length > 1 && (
              <div className="bg-[#13151f] border border-[#2a2d45] rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-[#1c1f2e] text-[11px] font-semibold text-[#444870] uppercase tracking-wider">产品明细</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#1c1f2e] border-t border-[#2a2d45]">
                      {['产品','订单数','占比'].map(h => (
                        <th key={h} className="px-4 py-2 text-left text-[11px] text-[#444870] font-semibold uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pidSummary.map((p, i) => (
                      <tr key={p.pid} className="border-t border-[#2a2d45] hover:bg-[rgba(255,255,255,0.02)]">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ background: LINE_COLORS[i % LINE_COLORS.length] }} />
                            <span className="text-[13px] font-semibold text-[#dde1f0]">{displayName(p.product)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 tabular-nums font-semibold">{p.orders.toLocaleString()}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 bg-[#2a2d45] rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct(p.orders, totalOrders)}%`, background: LINE_COLORS[i % LINE_COLORS.length] }} />
                            </div>
                            <span className="text-xs text-[#444870]">{pct(p.orders, totalOrders)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
