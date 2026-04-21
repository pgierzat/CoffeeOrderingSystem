import {
  Card, Text, Badge, Button,
  Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell,
} from '@tremor/react'
import { mockDistributors } from '../data/mock'

export default function Distributors() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            Distributors
          </h1>
          <p className="text-sm text-tremor-content-subtle dark:text-dark-tremor-content-subtle mt-0.5">
            Manage coffee suppliers
          </p>
        </div>
        <Button size="sm">Add distributor</Button>
      </div>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Contact</TableHeaderCell>
              <TableHeaderCell>Base price</TableHeaderCell>
              <TableHeaderCell>Availability</TableHeaderCell>
              <TableHeaderCell>Lead time</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockDistributors.map(d => (
              <TableRow key={d.id}>
                <TableCell>
                  <Text className="font-medium">{d.name}</Text>
                  <Text className="text-xs text-tremor-content-subtle dark:text-dark-tremor-content-subtle">
                    {d.contact_email}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text>{d.contact_phone}</Text>
                </TableCell>
                <TableCell>
                  <Text className="font-medium">{d.base_price.toFixed(2)} PLN/kg</Text>
                </TableCell>
                <TableCell>
                  <Text>{d.availability_kg} kg/day</Text>
                </TableCell>
                <TableCell>
                  <Badge color={d.lead_time_days === 1 ? 'green' : d.lead_time_days === 2 ? 'yellow' : 'red'}>
                    {d.lead_time_days} {d.lead_time_days === 1 ? 'day' : 'days'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge color="green">Active</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="xs" variant="secondary">Edit</Button>
                    <Button size="xs" variant="secondary" color="red">Remove</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
