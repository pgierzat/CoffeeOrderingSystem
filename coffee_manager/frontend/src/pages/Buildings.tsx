import {
  Card, Text, Badge, Button, ProgressBar, Flex,
  Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell,
} from '@tremor/react'
import { mockBuildings } from '../data/mock'

export default function Buildings() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            Buildings
          </h1>
          <p className="text-sm text-tremor-content-subtle dark:text-dark-tremor-content-subtle mt-0.5">
            Delivery locations and stock levels
          </p>
        </div>
        <Button size="sm">Add building</Button>
      </div>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Building</TableHeaderCell>
              <TableHeaderCell>Location</TableHeaderCell>
              <TableHeaderCell>Stock</TableHeaderCell>
              <TableHeaderCell>Daily demand</TableHeaderCell>
              <TableHeaderCell>Stock lasts</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockBuildings.map(b => {
              const daysLeft = Math.floor(b.current_inventory_kg / b.daily_demand_kg)
              return (
                <TableRow key={b.id}>
                  <TableCell>
                    <Text className="font-medium">{b.name}</Text>
                  </TableCell>
                  <TableCell>
                    <Text className="text-xs text-tremor-content-subtle dark:text-dark-tremor-content-subtle">
                      {b.location}
                    </Text>
                  </TableCell>
                  <TableCell className="w-44">
                    <Flex className="mb-1">
                      <Text className="text-xs">{b.current_inventory_kg} kg</Text>
                      <Text className="text-xs text-tremor-content-subtle dark:text-dark-tremor-content-subtle">
                        {b.max_capacity_kg} kg max
                      </Text>
                    </Flex>
                    <ProgressBar
                      value={b.fill_percent}
                      color={b.fill_percent < 25 ? 'red' : b.fill_percent < 50 ? 'yellow' : 'blue'}
                    />
                  </TableCell>
                  <TableCell>
                    <Text>{b.daily_demand_kg} kg/day</Text>
                  </TableCell>
                  <TableCell>
                    <Badge color={daysLeft <= 3 ? 'red' : daysLeft <= 7 ? 'yellow' : 'green'}>
                      ~{daysLeft} days
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="xs" variant="secondary">Edit</Button>
                      <Button size="xs" variant="secondary">Inventory</Button>
                    </div>
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
