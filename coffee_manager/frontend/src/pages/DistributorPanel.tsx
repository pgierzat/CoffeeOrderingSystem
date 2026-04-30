import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Text, Badge, Button } from '@tremor/react'
import { mockDistributorSelf } from '../data/mock'
import { useTheme } from '../context/ThemeContext'

type Tier = { threshold: number; price: number }

type DayPrice = {
  day: number
  base_price: number
  availability_kg: number
  tiers: Tier[]
}

type DeliveryParam = {
  building_id: string
  building_name: string
  lead_time_days: number
  fixed_cost_pln: number
}

const fieldCls = "w-full text-sm border border-tremor-border dark:border-dark-tremor-border rounded px-2 py-1.5 bg-tremor-background dark:bg-dark-tremor-background-subtle text-tremor-content-strong dark:text-dark-tremor-content-strong focus:outline-none focus:ring-2 focus:ring-tremor-brand dark:focus:ring-dark-tremor-brand"
const labelCls = "text-xs text-tremor-content-subtle dark:text-dark-tremor-content-subtle mb-1 block"
const iconBtnCls = "text-xs px-1.5 py-0.5 rounded border transition-colors"

export default function DistributorPanel() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const dist = mockDistributorSelf

  const [prices, setPrices] = useState<DayPrice[]>(dist.daily_prices as DayPrice[])
  const [delivery, setDelivery] = useState<DeliveryParam[]>(dist.delivery_params)
  const [saved, setSaved] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('dist_auth')
    navigate('/distributor/login')
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const updateDayField = (day: number, field: 'base_price' | 'availability_kg', value: string) => {
    setPrices(prev => prev.map(p => p.day === day ? { ...p, [field]: parseFloat(value) || 0 } : p))
  }

  const removeDay = (day: number) => {
    setPrices(prev => prev.filter(p => p.day !== day))
  }

  const addDay = () => {
    const maxDay = prices.reduce((m, p) => Math.max(m, p.day), 0)
    setPrices(prev => [...prev, { day: maxDay + 1, base_price: 0, availability_kg: 0, tiers: [] }])
  }

  const updateDayNumber = (oldDay: number, value: string) => {
    const newDay = parseInt(value) || oldDay
    setPrices(prev => prev.map(p => p.day === oldDay ? { ...p, day: newDay } : p))
  }

  const addTier = (day: number) => {
    setPrices(prev => prev.map(p =>
      p.day === day ? { ...p, tiers: [...p.tiers, { threshold: 0, price: 0 }] } : p
    ))
  }

  const removeTier = (day: number, idx: number) => {
    setPrices(prev => prev.map(p =>
      p.day === day ? { ...p, tiers: p.tiers.filter((_, i) => i !== idx) } : p
    ))
  }

  const updateTier = (day: number, idx: number, field: keyof Tier, value: string) => {
    setPrices(prev => prev.map(p =>
      p.day === day
        ? { ...p, tiers: p.tiers.map((t, i) => i === idx ? { ...t, [field]: parseFloat(value) || 0 } : t) }
        : p
    ))
  }

  const updateDelivery = (buildingId: string, field: 'lead_time_days' | 'fixed_cost_pln', value: string) => {
    setDelivery(prev => prev.map(d => d.building_id === buildingId ? { ...d, [field]: parseFloat(value) || 0 } : d))
  }

  const sortedPrices = [...prices].sort((a, b) => a.day - b.day)

  return (
    <div className="min-h-screen bg-tremor-background-muted dark:bg-dark-tremor-background">
      <header className="bg-tremor-background dark:bg-dark-tremor-background-subtle border-b border-tremor-border dark:border-dark-tremor-border px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            ☕ CoffeeOps
          </span>
          <span className="text-xs text-tremor-content-subtle dark:text-dark-tremor-content-subtle border-l border-tremor-border dark:border-dark-tremor-border pl-3 hidden sm:inline">
            Distributor Portal
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggle}
            className="text-xs text-tremor-content dark:text-dark-tremor-content hover:text-tremor-content-strong dark:hover:text-dark-tremor-content-strong transition-colors"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <span className="text-sm text-tremor-content dark:text-dark-tremor-content hidden sm:inline">{dist.name}</span>
          <Button size="xs" variant="secondary" onClick={handleLogout}>Logout</Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Profile */}
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong truncate">
                {dist.name}
              </p>
              <p className="text-xs text-tremor-content-subtle dark:text-dark-tremor-content-subtle mt-0.5">
                {dist.contact_email}
              </p>
            </div>
            <Badge color="green" size="xs">Active</Badge>
          </div>
          <div className="mt-3 pt-3 border-t border-tremor-border dark:border-dark-tremor-border">
            <Text className="text-xs">API Key</Text>
            <code className="text-xs text-tremor-content dark:text-dark-tremor-content bg-tremor-background-muted dark:bg-dark-tremor-background-muted px-2 py-1 rounded mt-1 block break-all">
              {dist.api_key.slice(0, 12)}••••••••••••
            </code>
          </div>
        </Card>

        {/* Daily price list */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
              Daily price list
            </p>
            <div className="flex items-center gap-2">
              {saved && <Text className="text-xs text-green-600">Saved ✓</Text>}
              <Button size="xs" variant="secondary" onClick={addDay}>+ Add day</Button>
              <Button size="xs" onClick={handleSave}>Save changes</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {sortedPrices.map(p => (
              <Card key={p.day} className="space-y-3">
                {/* Day header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs text-tremor-content-subtle dark:text-dark-tremor-content-subtle shrink-0">Day</span>
                    <input
                      type="number" min="1"
                      value={p.day}
                      onChange={e => updateDayNumber(p.day, e.target.value)}
                      className="w-14 text-sm font-medium border border-tremor-border dark:border-dark-tremor-border rounded px-2 py-0.5 bg-tremor-background dark:bg-dark-tremor-background-subtle text-tremor-content-strong dark:text-dark-tremor-content-strong focus:outline-none focus:ring-2 focus:ring-tremor-brand"
                    />
                  </div>
                  <button
                    onClick={() => removeDay(p.day)}
                    className={`${iconBtnCls} border-red-200 text-red-500 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950`}
                    title="Remove day"
                  >
                    ✕
                  </button>
                </div>

                {/* Base fields */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Base price (PLN/kg)</label>
                    <input
                      type="number" step="0.1" min="0"
                      value={p.base_price}
                      onChange={e => updateDayField(p.day, 'base_price', e.target.value)}
                      className={fieldCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Availability (kg)</label>
                    <input
                      type="number" min="0"
                      value={p.availability_kg}
                      onChange={e => updateDayField(p.day, 'availability_kg', e.target.value)}
                      className={fieldCls}
                    />
                  </div>
                </div>

                {/* Discount tiers */}
                <div className="border-t border-tremor-border dark:border-dark-tremor-border pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-tremor-content dark:text-dark-tremor-content">
                      Discount tiers
                    </p>
                    <button
                      onClick={() => addTier(p.day)}
                      className={`${iconBtnCls} border-tremor-border dark:border-dark-tremor-border text-tremor-content dark:text-dark-tremor-content hover:bg-tremor-background-muted dark:hover:bg-dark-tremor-background-muted`}
                    >
                      + tier
                    </button>
                  </div>

                  {p.tiers.length === 0 && (
                    <p className="text-xs text-tremor-content-subtle dark:text-dark-tremor-content-subtle italic">
                      No tiers — base price applies to all quantities.
                    </p>
                  )}

                  {p.tiers.map((t, idx) => (
                    <div key={idx} className="flex items-end gap-1.5">
                      <div className="flex-1 min-w-0">
                        <label className={labelCls}>≥ kg</label>
                        <input
                          type="number" min="0"
                          value={t.threshold}
                          onChange={e => updateTier(p.day, idx, 'threshold', e.target.value)}
                          className={fieldCls}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className={labelCls}>PLN/kg</label>
                        <input
                          type="number" step="0.1" min="0"
                          value={t.price}
                          onChange={e => updateTier(p.day, idx, 'price', e.target.value)}
                          className={fieldCls}
                        />
                      </div>
                      <button
                        onClick={() => removeTier(p.day, idx)}
                        className={`${iconBtnCls} mb-0.5 border-red-200 text-red-400 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950 shrink-0`}
                        title="Remove tier"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            ))}

            {/* Add day inline card */}
            <button
              onClick={addDay}
              className="flex items-center justify-center min-h-[120px] rounded-tremor-default border-2 border-dashed border-tremor-border dark:border-dark-tremor-border text-tremor-content-subtle dark:text-dark-tremor-content-subtle hover:border-tremor-brand dark:hover:border-dark-tremor-brand hover:text-tremor-brand dark:hover:text-dark-tremor-brand transition-colors text-sm"
            >
              + Add day
            </button>
          </div>
        </section>

        {/* Delivery parameters */}
        <section>
          <p className="text-sm font-medium text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis mb-3">
            Delivery parameters per building
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {delivery.map(dp => (
              <Card key={dp.building_id}>
                <p className="text-sm font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong mb-3 truncate">
                  {dp.building_name}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Lead time (days)</label>
                    <input
                      type="number" min="0" step="1"
                      value={dp.lead_time_days}
                      onChange={e => updateDelivery(dp.building_id, 'lead_time_days', e.target.value)}
                      className={fieldCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Fixed cost (PLN)</label>
                    <input
                      type="number" min="0" step="1"
                      value={dp.fixed_cost_pln}
                      onChange={e => updateDelivery(dp.building_id, 'fixed_cost_pln', e.target.value)}
                      className={fieldCls}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <div className="flex justify-end pb-4">
          <div className="flex items-center gap-2">
            {saved && <Text className="text-xs text-green-600">Saved ✓</Text>}
            <Button onClick={handleSave}>Save all changes</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
