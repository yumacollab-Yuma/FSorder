'use client'
import { useState } from 'react'
import ProductsPage from '@/components/ProductsPage'
import AnalysisPage from '@/components/AnalysisPage'
import OverviewPage from '@/components/OverviewPage'

export default function Home() {
  const [tab, setTab] = useState<'products' | 'analysis' | 'overview'>('overview')

  const tabs = [
    {
      id: 'overview' as const,
      label: '全产品看板',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
        </svg>
      ),
    },
    {
      id: 'analysis' as const,
      label: '订单分析',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
    },
    {
      id: 'products' as const,
      label: '商品档案',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-[#0c0e14] text-[#dde1f0] font-sans">
      <nav className="sticky top-0 z-50 flex items-center px-6 bg-[#13151f] border-b border-[#2a2d45]" style={{height:52}}>
        <span className="text-[15px] font-bold mr-8 tracking-tight">
          Fire<span className="text-[#6c63ff]">Swan</span>
        </span>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 flex items-center gap-2 text-sm border-b-2 transition-all ${tab===t.id ? 'text-[#dde1f0] border-[#6c63ff]' : 'text-[#7e849e] border-transparent hover:text-[#dde1f0]'}`}
            style={{height:52}}>
            {t.icon}{t.label}
          </button>
        ))}
      </nav>
      {tab === 'overview'  && <OverviewPage />}
      {tab === 'analysis'  && <AnalysisPage />}
      {tab === 'products'  && <ProductsPage />}
    </div>
  )
}
