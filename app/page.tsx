'use client'

import { useMemo, useState } from 'react'
import {
  BarChart3,
  Bell,
  Boxes,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Download,
  Ellipsis,
  Flower2,
  Grid2X2,
  LayoutDashboard,
  Leaf,
  List,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Sprout,
  Tag,
  Users,
  X,
} from 'lucide-react'

const products = [
  { name: 'Monstera Deliciosa', type: 'Tropical plant', price: '$48.00', stock: '38', status: 'Published', image: '/plant-products.png' },
  { name: 'Terracotta Classic Pot', type: 'Planter', price: '$24.00', stock: '112', status: 'Published', image: '/plant-products.png' },
  { name: 'Fiddle Leaf Fig', type: 'Indoor plant', price: '$68.00', stock: '24', status: 'Published', image: '/plant-products.png' },
  { name: 'Handwoven Basket', type: 'Plant accessory', price: '$36.00', stock: '9', status: 'Low stock', image: '/plant-products.png' },
  { name: 'Snake Plant', type: 'Low-light plant', price: '$32.00', stock: '0', status: 'Out of stock', image: '/plant-products.png' },
  { name: 'Speckled Stone Pot', type: 'Planter', price: '$29.00', stock: '61', status: 'Draft', image: '/plant-products.png' },
  { name: 'String of Pearls', type: 'Succulent', price: '$26.00', stock: '17', status: 'Published', image: '/plant-products.png' },
]

const navGroups = [
  { label: 'MAIN', items: [['Overview', LayoutDashboard], ['Orders', ClipboardList], ['Products', Package], ['Customers', Users], ['Collections', Flower2]] },
  { label: 'STORE', items: [['Shop appearance', ShoppingBag], ['Discounts', Tag], ['Analytics', BarChart3]] },
]

export default function Page() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<string[]>([])
  const [view, setView] = useState<'table' | 'grid'>('table')
  const [notice, setNotice] = useState(false)

  const filtered = useMemo(() => products.filter((product) => {
    const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase()) || product.type.toLowerCase().includes(query.toLowerCase())
    const matchesFilter = filter === 'All' || product.status === filter
    return matchesQuery && matchesFilter
  }), [query, filter])

  const toggleSelected = (name: string) => setSelected((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name])
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map((product) => product.name))

  return (
    <main className="min-h-screen bg-[#e9eee9] p-0 text-[#253129] md:p-5 lg:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1600px] overflow-hidden rounded-none border border-[#d6ded7] bg-[#fbfcfa] shadow-[0_18px_50px_rgba(46,67,52,0.08)] md:rounded-[22px]">
        <aside className="hidden w-[220px] shrink-0 flex-col bg-[#dcefe0] px-4 py-5 md:flex">
          <div className="mb-9 flex items-center gap-2 px-2 text-[17px] font-semibold tracking-[-0.02em]">
            <div className="flex size-8 items-center justify-center rounded-[10px] bg-[#316742] text-white"><Sprout className="size-4" /></div>
            leaf & co.
            <ChevronDown className="ml-auto size-4 text-[#66816d]" />
          </div>
          {navGroups.map((group) => <div key={group.label} className="mb-7"><p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.16em] text-[#75917b]">{group.label}</p><nav className="flex flex-col gap-1">{group.items.map(([label, Icon]) => <button key={label as string} onClick={() => label === 'Products' && setFilter('All')} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors ${label === 'Products' ? 'bg-white font-medium text-[#1e3d28] shadow-sm' : 'text-[#597360] hover:bg-white/60'}`}><Icon className="size-[17px]" />{label as string}{label === 'Orders' && <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-[#e37b58] text-[10px] text-white">3</span>}</button>)}</nav></div>)}
          <div className="mt-auto flex flex-col gap-1"><button className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-[#597360] hover:bg-white/60"><CircleHelp className="size-[17px]" />Help center</button><button className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-[#597360] hover:bg-white/60"><Settings className="size-[17px]" />Settings</button></div>
        </aside>

        <section className="min-w-0 flex-1 bg-[#fbfcfa]">
          <header className="flex h-[76px] items-center gap-3 border-b border-[#e5e9e5] px-5 md:px-7">
            <button className="flex size-9 items-center justify-center rounded-lg border border-[#e1e7e1] md:hidden"><Menu className="size-4" /></button>
            <div className="relative max-w-[410px] flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9baa9f]" /><input aria-label="Search store" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, orders..." className="h-10 w-full rounded-xl border border-[#e3e9e3] bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#8bb795]" /></div>
            <div className="ml-auto flex items-center gap-4"><button aria-label="Notifications" className="text-[#829187]"><Bell className="size-[18px]" /></button><div className="hidden items-center gap-2 sm:flex"><div className="flex size-9 items-center justify-center rounded-full bg-[#bed5c2] text-sm font-semibold text-[#365d40]">RA</div><div className="hidden text-left lg:block"><p className="text-[13px] font-medium">Rayan Anderson</p><p className="text-[11px] text-[#8a998e]">Store owner</p></div><ChevronDown className="size-4 text-[#96a39a]" /></div></div>
          </header>

          <div className="px-5 py-7 md:px-7 md:py-8">
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#84a08a]">Your greenhouse</p><h1 className="text-[30px] font-semibold tracking-[-0.04em] text-[#213529]">Products</h1><p className="mt-1 text-sm text-[#829187]">Manage plants, pots, and accessories in your store</p></div><button onClick={() => setNotice(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#316742] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#285a37]"><Plus className="size-4" /> Add product</button></div>

            <div className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4"><Stat icon={Boxes} label="TOTAL PRODUCTS" value="1,248" change="+4.2%" tone="up" /><Stat icon={Leaf} label="TOTAL REVENUE" value="$84,320" change="+12.5%" tone="up" /><Stat icon={ShoppingBag} label="TOTAL ORDERS" value="142" change="-1.4%" tone="down" /><Stat icon={Users} label="CUSTOMERS" value="3,240" change="+2.1%" tone="up" /></div>

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center"><div className="flex flex-1 gap-2"><div className="relative min-w-0 flex-1 sm:max-w-[340px]"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9baa9f]" /><input aria-label="Search by product" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by product name" className="h-10 w-full rounded-xl border border-[#e3e9e3] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#8bb795]" /></div><button className="flex h-10 items-center gap-2 rounded-xl border border-[#e3e9e3] bg-white px-3 text-sm text-[#66746a]"><SlidersHorizontal className="size-4" /> <span className="hidden sm:inline">Filter</span></button><div className="hidden rounded-xl border border-[#e3e9e3] bg-white p-1 sm:flex"><button onClick={() => setView('grid')} className={`rounded-lg p-1.5 ${view === 'grid' ? 'bg-[#e4f1e5] text-[#316742]' : 'text-[#9aaa9e]'}`}><Grid2X2 className="size-4" /></button><button onClick={() => setView('table')} className={`rounded-lg p-1.5 ${view === 'table' ? 'bg-[#e4f1e5] text-[#316742]' : 'text-[#9aaa9e]'}`}><List className="size-4" /></button></div></div><div className="flex gap-1 rounded-xl bg-[#f0f4f0] p-1 text-xs font-medium text-[#7f8e83]">{['All', 'Published', 'Low stock', 'Draft'].map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-lg px-3 py-2 transition ${filter === item ? 'bg-white text-[#31543a] shadow-sm' : 'hover:text-[#31543a]'}`}>{item}</button>)}</div></div>

            {view === 'grid' ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((product) => <ProductCard key={product.name} product={product} selected={selected.includes(product.name)} onSelect={() => toggleSelected(product.name)} />)}</div> : <div className="overflow-hidden rounded-2xl border border-[#e3e9e3] bg-white"><div className="hidden grid-cols-[40px_2fr_1fr_1fr_1fr] items-center border-b border-[#e9ede9] bg-[#fcfdfb] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98a49b] md:grid"><button aria-label="Select all products" onClick={toggleAll} className={`size-4 rounded border ${selected.length === filtered.length && filtered.length ? 'border-[#316742] bg-[#316742] text-white' : 'border-[#cbd5cc]'}`}>{selected.length === filtered.length && filtered.length ? '✓' : ''}</button><span>Product</span><span>Product ID</span><span>Price</span><span>Status</span></div>{filtered.map((product) => <ProductRow key={product.name} product={product} selected={selected.includes(product.name)} onSelect={() => toggleSelected(product.name)} />)}</div>}
            <div className="mt-5 flex items-center justify-between text-xs text-[#8b998e]"><span>Showing {filtered.length} of {products.length} products</span><div className="flex items-center gap-2"><button className="flex size-8 items-center justify-center rounded-lg border border-[#e3e9e3] bg-white"><ChevronLeft className="size-4" /></button><span className="flex size-8 items-center justify-center rounded-lg bg-[#316742] font-medium text-white">1</span><button className="flex size-8 items-center justify-center rounded-lg border border-[#e3e9e3] bg-white"><ChevronRight className="size-4" /></button></div></div>
          </div>
        </section>
      </div>
      {selected.length > 0 && <div className="fixed bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-[#dce4dd] bg-white px-4 py-3 text-sm shadow-xl"><span className="font-medium">{selected.length} selected</span><button className="flex items-center gap-2 rounded-lg border border-[#e2e8e2] px-3 py-2"><Download className="size-4" /> Export</button><button onClick={() => setSelected([])} aria-label="Clear selection"><X className="size-4" /></button></div>}
      {notice && <div role="status" className="fixed bottom-5 right-5 flex items-center gap-3 rounded-xl bg-[#316742] px-4 py-3 text-sm text-white shadow-xl">Product editor ready <button onClick={() => setNotice(false)} aria-label="Dismiss"><X className="size-4" /></button></div>}
    </main>
  )
}

function Stat({ icon: Icon, label, value, change, tone }: { icon: typeof Boxes; label: string; value: string; change: string; tone: 'up' | 'down' }) { return <div className="rounded-2xl border border-[#e3e9e3] bg-white p-4 shadow-[0_2px_7px_rgba(37,49,41,0.03)]"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.03em] text-[#738178]"><Icon className="size-4 text-[#85a38b]" />{label}</div><Ellipsis className="size-4 text-[#b0bab1]" /></div><div className="mt-4 text-[25px] font-semibold tracking-[-0.04em] text-[#253129]">{value}</div><div className={`mt-1 text-xs ${tone === 'up' ? 'text-[#3c9561]' : 'text-[#d66c63]'}`}>{change} <span className="ml-1 text-[#9aa59c]">Last 7 days</span></div></div> }

function ProductRow({ product, selected, onSelect }: { product: typeof products[number]; selected: boolean; onSelect: () => void }) { return <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[#edf0ed] px-4 py-3 last:border-0 md:grid-cols-[40px_2fr_1fr_1fr_1fr]"><button aria-label={`Select ${product.name}`} onClick={onSelect} className={`hidden size-4 rounded border md:block ${selected ? 'border-[#316742] bg-[#316742] text-white' : 'border-[#cbd5cc]'}`}>{selected ? '✓' : ''}</button><div className="flex min-w-0 items-center gap-3"><img src={product.image} alt="" className="size-10 rounded-xl object-cover" /><div className="min-w-0"><p className="truncate text-sm font-medium text-[#304136]">{product.name}</p><p className="text-xs text-[#94a098]">{product.type}</p></div></div><div className="hidden text-sm text-[#66746a] md:block"><p>#{product.name.slice(0, 3).toUpperCase()}24</p><p className="text-xs text-[#a0aaa2]">Mar 12, 2024</p></div><div className="hidden text-sm text-[#34443a] md:block"><p>{product.price}</p><p className="text-xs text-[#a0aaa2]">Stock {product.stock}</p></div><Status status={product.status} /></div> }

function ProductCard({ product, selected, onSelect }: { product: typeof products[number]; selected: boolean; onSelect: () => void }) { return <div className="overflow-hidden rounded-2xl border border-[#e3e9e3] bg-white"><div className="relative h-40 bg-[#edf4ee]"><img src={product.image} alt="" className="size-full object-cover" /><button onClick={onSelect} className={`absolute right-3 top-3 flex size-6 items-center justify-center rounded-full border bg-white/90 text-xs ${selected ? 'border-[#316742] bg-[#316742] text-white' : 'border-white text-transparent'}`}>✓</button></div><div className="p-4"><div className="flex items-start justify-between gap-2"><div><h3 className="text-sm font-medium">{product.name}</h3><p className="mt-1 text-xs text-[#8e9b91]">{product.type}</p></div><Status status={product.status} /></div><div className="mt-4 flex justify-between text-sm"><span>{product.price}</span><span className="text-[#8e9b91]">{product.stock} in stock</span></div></div></div> }

function Status({ status }: { status: string }) { const styles: Record<string, string> = { Published: 'bg-[#e3f5e8] text-[#328354]', 'Low stock': 'bg-[#fff0d8] text-[#be761b]', 'Out of stock': 'bg-[#fde3e0] text-[#c55f58]', Draft: 'bg-[#eef1ef] text-[#7d8880]' }; return <span className={`justify-self-end whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[status]}`}><span className="mr-1">●</span>{status}</span> }
