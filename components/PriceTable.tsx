import type { PriceDetail } from '@/lib/types'
import { pct } from '@/lib/utils'

export default function PriceTable({
  prices, totalOrders,
}: {
  prices: Record<string, PriceDetail>
  totalOrders: number
}) {
  const sorted = Object.entries(prices).sort((a, b) => b[1].orders - a[1].orders)
  if (!sorted.length) return null

  return (
    <div className="bg-[#13151f] border border-[#2a2d45] rounded-xl overflow-hidden mb-6">
      <div className="px-4 py-2.5 bg-[#1c1f2e] text-[11px] font-semibold text-[#444870] uppercase tracking-wider">价格档明细</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#1c1f2e]">
            {['价格','订单','件数','自然流','广告流','退货','退货率','占比'].map(h => (
              <th key={h} className="px-4 py-2 text-left text-[11px] text-[#444870] font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map(([price, pd]) => {
            const p = pct(pd.orders, totalOrders)
            const orgP = pct(pd.organic, pd.orders)
            const refund = pd.refund ?? 0
            return (
              <tr key={price} className="border-t border-[#2a2d45] hover:bg-[rgba(255,255,255,0.02)]">
                <td className="px-4 py-2"><span className="bg-[rgba(108,99,255,0.15)] text-[#6c63ff] px-1.5 py-0.5 rounded text-[11px] font-semibold">${parseFloat(price).toFixed(2)}</span></td>
                <td className="px-4 py-2 tabular-nums">{pd.orders.toLocaleString()}</td>
                <td className="px-4 py-2 tabular-nums">{pd.units.toLocaleString()}</td>
                <td className="px-4 py-2 tabular-nums text-[#3ecf8e]">{pd.organic.toLocaleString()} <span className="text-[11px] text-[#444870]">{orgP}%</span></td>
                <td className="px-4 py-2 tabular-nums text-[#f5a623]">{pd.paid.toLocaleString()}</td>
                <td className="px-4 py-2 tabular-nums text-[#e85d75]">{refund.toLocaleString()}</td>
                <td className="px-4 py-2 tabular-nums text-[11px] text-[#e85d75]">{pct(refund, pd.orders)}%</td>
                <td className="px-4 py-2 tabular-nums text-[11px] text-[#444870]">{p}%</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
