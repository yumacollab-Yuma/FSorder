'use client'
import { useState } from 'react'
import ProductsPage from '@/components/ProductsPage'
import AnalysisPage from '@/components/AnalysisPage'

export default function Home() {
  const [tab, setTab] = useState<'products' | 'analysis'>('products')

  return (
    <div className="min-h-screen bg-[#0c0e14] text-[#dde1f0] font-sans">
      <nav className="sticky top-0 z-50 flex items-center px-6 bg-[#13151f] border-b border-[#2a2d45]" style={{height:52}}>
        <span className="text-[15px] font-bold mr-8 tracking-tight">
          Fire<span className="text-[#6c63ff]">Swan</span>
        </span>
        {(['products','analysis'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 flex items-center gap-2 text-sm border-b-2 transition-all ${tab===t ? 'text-[#dde1f0] border-[#6c63ff]' : 'text-[#7e849e] border-transparent hover:text-[#dde1f0]'}`}
            style={{height:52}}>
            {t === 'products'
              ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>商品档案</>
              : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>订单分析</>
            }
          </button>
        ))}
      </nav>
      {tab === 'products' ? <ProductsPage /> : <AnalysisPage />}
    </div>
  )
}
