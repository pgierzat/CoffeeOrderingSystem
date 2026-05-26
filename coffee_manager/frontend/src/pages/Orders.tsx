import { useState, useEffect } from 'react'
import {
  Card, Text, Badge, Button,
  Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell,
} from '@tremor/react'
import { api } from '../api/client'
import type { OrderRecord } from '../api/api'
import Modal from '../components/Modal'

const STATUSES = ['confirmed', 'pending', 'cancelled'] as const
type OrderStatus = typeof STATUSES[number]

const statusConfig: Record<OrderStatus, { label: string; color: 'blue' | 'yellow' | 'gray' }> = {
  confirmed: { label: 'Confirmed', color: 'blue' },
  pending:   { label: 'Pending',   color: 'yellow' },
  cancelled: { label: 'Cancelled', color: 'gray' },
}

type ModalState =
  | { type: 'none' }
  | { type: 'changeStatus'; order: OrderRecord; selected: OrderStatus }

export default function Orders() {
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<ModalState>({ type: 'none' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    api.orders.listOrders()
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openStatusModal(order: OrderRecord) {
    setError('')
    setModal({ type: 'changeStatus', order, selected: (order.status ?? 'confirmed') as OrderStatus })
  }

  function close() { setModal({ type: 'none' }); setError('') }

  async function handleStatusSave() {
    if (modal.type !== 'changeStatus') return
    setSaving(true); setError('')
    try {
      await api.orders.updateOrderStatus(modal.order.id!, { status: modal.selected })
      load(); close()
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Update failed')
    } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          Order history
        </h1>
        <p className="text-sm text-tremor-content-subtle dark:text-dark-tremor-content-subtle mt-0.5">
          Registry of confirmed order schedules
        </p>
      </div>

      <Card>
        {loading ? (
          <Text>Loading...</Text>
        ) : orders.length === 0 ? (
          <Text className="text-tremor-content-subtle dark:text-dark-tremor-content-subtle">
            No orders yet.
          </Text>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Order ID</TableHeaderCell>
                <TableHeaderCell>Scenario</TableHeaderCell>
                <TableHeaderCell>Items</TableHeaderCell>
                <TableHeaderCell>Total cost</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map(o => {
                const s = statusConfig[(o.status ?? 'confirmed') as OrderStatus] ?? statusConfig['confirmed']
                return (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Text className="font-mono text-xs text-tremor-content-subtle dark:text-dark-tremor-content-subtle">
                        {o.id?.slice(0, 8)}…
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Text className="font-mono text-xs text-tremor-content-subtle dark:text-dark-tremor-content-subtle">
                        {o.scenario_id?.slice(0, 8)}…
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Text>{o.orders?.length ?? 0} deliveries</Text>
                    </TableCell>
                    <TableCell>
                      <Text className="font-semibold">
                        {(o.total_cost_pln ?? 0).toLocaleString('en-US')} PLN
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Text className="text-xs text-tremor-content-subtle dark:text-dark-tremor-content-subtle">
                        {o.created_at ? new Date(o.created_at).toLocaleDateString('en-US') : '—'}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Badge color={s.color}>{s.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="xs" variant="secondary" onClick={() => openStatusModal(o)}>
                        Change status
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {modal.type === 'changeStatus' && (
        <Modal title="Change order status" onClose={close} maxWidth="max-w-sm">
          <div className="space-y-4">
            <p className="text-xs text-tremor-content-subtle dark:text-dark-tremor-content-subtle font-mono">
              Order {modal.order.id?.slice(0, 8)}…
            </p>
            <div className="flex gap-2">
              {STATUSES.map(s => {
                const cfg = statusConfig[s]
                const active = modal.selected === s
                return (
                  <button
                    key={s}
                    onClick={() => setModal({ ...modal, selected: s })}
                    className={`flex-1 py-2 px-3 rounded-tremor-default border text-sm font-medium transition-colors ${
                      active
                        ? 'bg-tremor-brand text-white border-tremor-brand dark:bg-dark-tremor-brand dark:border-dark-tremor-brand'
                        : 'border-tremor-border dark:border-dark-tremor-border text-tremor-content dark:text-dark-tremor-content hover:bg-tremor-background-muted dark:hover:bg-dark-tremor-background'
                    }`}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2 pt-2 border-t border-tremor-border dark:border-dark-tremor-border">
              <Button onClick={handleStatusSave} loading={saving} disabled={modal.selected === modal.order.status}>
                Save
              </Button>
              <Button variant="secondary" onClick={close}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
