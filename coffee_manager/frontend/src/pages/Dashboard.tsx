import { Card, Text, ProgressBar, Flex, Badge } from '@tremor/react'
import { mockBuildings, mockOrders } from '../data/mock'

export default function Dashboard() {
  const lowStock = mockBuildings.filter(b => b.fill_percent < 25)
  const lastOrder = mockOrders[0]

  return (
    <div className="max-w-4xl">
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          Dashboard
        </h1>
        <p className="text-sm text-tremor-content-subtle dark:text-dark-tremor-content-subtle mt-0.5">
          Mon, Apr 21 2024
        </p>
      </div>

      {lowStock.length > 0 && (
        <div className="mb-5 p-3 rounded-tremor-default bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900">
          <p className="text-sm text-red-700 dark:text-red-400 font-medium">
            ⚠ Low stock: {lowStock.map(b => b.name).join(', ')}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-5">
        <Card>
          <Text>Total inventory</Text>
          <p className="text-2xl font-bold text-tremor-content-strong dark:text-dark-tremor-content-strong mt-1">
            {mockBuildings.reduce((s, b) => s + b.current_inventory_kg, 0)} kg
          </p>
          <Text className="text-xs mt-1">across {mockBuildings.length} locations</Text>
        </Card>
        <Card>
          <Text>Active distributors</Text>
          <p className="text-2xl font-bold text-tremor-content-strong dark:text-dark-tremor-content-strong mt-1">
            4
          </p>
          <Text className="text-xs mt-1">all available</Text>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <p className="text-sm font-medium text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis mb-4">
            Stock levels
          </p>
          <div className="space-y-3.5">
            {mockBuildings.map(b => (
              <div key={b.id}>
                <Flex className="mb-1">
                  <Text className="text-xs">{b.name}</Text>
                  <Text className={`text-xs font-medium ${b.fill_percent < 25 ? 'text-red-500' : ''}`}>
                    {b.current_inventory_kg} kg
                  </Text>
                </Flex>
                <ProgressBar
                  value={b.fill_percent}
                  color={b.fill_percent < 25 ? 'red' : b.fill_percent < 50 ? 'yellow' : 'blue'}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-medium text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis mb-1">
            Last order
          </p>
          <Text className="text-xs mb-4">{lastOrder.scenario}</Text>

          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-tremor-content dark:text-dark-tremor-content">Distributor</span>
              <span className="text-tremor-content-strong dark:text-dark-tremor-content-strong font-medium">
                {lastOrder.distributor}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-tremor-content dark:text-dark-tremor-content">Building</span>
              <span className="text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {lastOrder.building}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-tremor-content dark:text-dark-tremor-content">Quantity</span>
              <span className="text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {lastOrder.quantity_kg} kg
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-tremor-content dark:text-dark-tremor-content">Total cost</span>
              <span className="text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">
                {lastOrder.total_cost_pln.toLocaleString('en-US')} PLN
              </span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-tremor-content dark:text-dark-tremor-content">Status</span>
              <Badge color="blue" size="xs">Confirmed</Badge>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-tremor-border dark:border-dark-tremor-border">
            <Text className="text-xs">
              {new Date(lastOrder.created_at).toLocaleDateString('en-US', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </Text>
          </div>
        </Card>
      </div>
    </div>
  )
}
