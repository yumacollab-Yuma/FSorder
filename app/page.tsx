'use client'
import { useState, useEffect, useCallback } from 'react'
import ProductsPage from '@/components/ProductsPage'
import AnalysisPage from '@/components/AnalysisPage'
import OverviewPage from '@/components/OverviewPage'
import ProductCreatorPage from '@/components/ProductCreatorPage'
import CreatorAnalysisPage from '@/components/CreatorAnalysisPage'

// Types are defined in lib/types.ts
import type { Product, DailyEntry, CreatorDaily, CreatorCommission } from '@/lib/types'

type Tab = 'overview' | 'analysis' | 'product-creator' | 'creator-analysis' | 'products'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: '全产品看板', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { id: 'analysis', label: '单品分析', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { id: 'product-creator', label: '产品达人', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
  { id: 'creator-analysis', label: '达人分析', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { id: 'products', label: '商品档案', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
]

export default function Home() {
  const [tab, setTab] = useState<Tab>('overview')
  const [products, setProducts] = useState<Product[]>([])
  const [daily, setDaily] = useState<DailyEntry[]>([])
  const [creatorDaily, setCreatorDaily] = useState<CreatorDaily[]>([])
  const [creatorCommission, setCreatorCommission] = useState<CreatorCommission[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/data')
    const d = await res.json()
    setProducts(d.products || [])
    setDaily(d.daily || [])
    setCreatorDaily(d.creatorDaily || [])
    setCreatorCommission(d.creatorCommission || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="min-h-screen bg-[#0c0e14] text-[#dde1f0] font-sans">
      <nav className="sticky top-0 z-50 flex items-center px-6 bg-[#13151f] border-b border-[#2a2d45]" style={{ height: 52 }}>
        <span className="text-[15px] font-bold mr-8 tracking-tight">Fire<span className="text-[#6c63ff]">Swan</span></span>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 flex items-center gap-2 text-sm border-b-2 transition-all ${tab === t.id ? 'text-[#dde1f0] border-[#6c63ff]' : 'text-[#7e849e] border-transparent hover:text-[#dde1f0]'}`}
            style={{ height: 52 }}>
            {t.icon}{t.label}
          </button>
        ))}
        {loading && (
          <div className="ml-auto flex items-center gap-2 text-xs text-[#444870]">
            <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            加载中...
          </div>
        )}
      </nav>

      {loading ? (
        <div className="flex items-center justify-center h-[calc(100vh-52px)] text-[#444870] text-sm gap-2">
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          正在加载数据...
        </div>
      ) : (
        <>
          {tab === 'overview'        && <OverviewPage products={products} daily={daily} />}
          {tab === 'analysis'        && <AnalysisPage products={products} daily={daily} onDataRefresh={fetchData} />}
          {tab === 'product-creator' && <ProductCreatorPage products={products} creatorDaily={creatorDaily} creatorCommission={creatorCommission} />}
          {tab === 'creator-analysis'&& <CreatorAnalysisPage products={products} creatorDaily={creatorDaily} />}
          {tab === 'products'        && <ProductsPage onDataRefresh={fetchData} />}
        </>
      )}
    </div>
  )
}
