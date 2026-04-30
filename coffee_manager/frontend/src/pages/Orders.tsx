import {
  Card, Text, Badge,
  Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell,
} from '@tremor/react'
import { mockOrders } from '../data/mock'

const statusConfig: Record<string, { label: string; color: 'green' | 'blue' | 'gray' }> = {
  confirmed: { label: 'Confirmed', color: 'blue' },
  delivered: { label: 'Delivered', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'gray' },
}

export default function Orders() {
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
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>ID</TableHeaderCell>
              <TableHeaderCell>Scenario</TableHeaderCell>
              <TableHeaderCell>Distributor</TableHeaderCell>
              <TableHeaderCell>Building</TableHeaderCell>
              <TableHeaderCell>Quantity</TableHeaderCell>
              <TableHeaderCell>Total cost</TableHeaderCell>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockOrders.map(o => {
              const s = statusConfig[o.status] ?? statusConfig['confirmed']
              return (
                <TableRow key={o.id}>
                  <TableCell>
                    <Text className="font-mono text-xs text-tremor-content-subtle dark:text-dark-tremor-content-subtle">
                      {o.id}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Text className="text-sm">{o.scenario}</Text>
                  </TableCell>
                  <TableCell>
                    <Text className="font-medium">{o.distributor}</Text>
                  </TableCell>
                  <TableCell>
                    <Text>{o.building}</Text>
                  </TableCell>
                  <TableCell>
                    <Text>{o.quantity_kg} kg</Text>
                  </TableCell>
                  <TableCell>
                    <Text className="font-semibold">
                      {o.total_cost_pln.toLocaleString('en-US')} PLN
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Text className="text-xs text-tremor-content-subtle dark:text-dark-tremor-content-subtle">
                      {new Date(o.created_at).toLocaleDateString('en-US')}
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
      </Card>
    </div>
  )
}
