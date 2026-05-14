import { useState, useEffect } from 'react'
import {
  Card, Text, Badge,
  Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell,
} from '@tremor/react'
import { api } from '../api/client'
import type { OrderRecord } from '../api/api'

const statusConfig: Record<string, { label: string; color: 'green' | 'blue' | 'gray' | 'yellow' }> = {
  confirmed: { label: 'Confirmed', color: 'blue' },
  pending:   { label: 'Pending',   color: 'yellow' },
  cancelled: { label: 'Cancelled', color: 'gray' },
}

export default function Orders() {
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.orders.listOrders()
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

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
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map(o => {
                const s = statusConfig[o.status ?? ''] ?? statusConfig['confirmed']
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
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
