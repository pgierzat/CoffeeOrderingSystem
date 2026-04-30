import { useState } from 'react'
import {
  Card, Text, Button, Badge, Metric, Flex,
  Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell,
  Select, SelectItem, TextInput, NumberInput,
} from '@tremor/react'
import { mockOptimizationResult, mockDistributors, mockBuildings } from '../data/mock'

export default function Optimization() {
  const [ran, setRan] = useState(false)
  const [running, setRunning] = useState(false)
  const [scenarioName, setScenarioName] = useState('')
  const [horizon, setHorizon] = useState('14')
  const [alpha, setAlpha] = useState<number>(0.05)
  const [selectedDist, setSelectedDist] = useState<Set<string>>(
    new Set(mockDistributors.map(d => d.id))
  )
  const [selectedBuild, setSelectedBuild] = useState<Set<string>>(
    new Set(mockBuildings.map(b => b.id))
  )

  const toggle = (set: Set<string>, id: string) => {
    const s = new Set(set)
    s.has(id) ? s.delete(id) : s.add(id)
    return s
  }

  const handleRun = () => {
    setRunning(true)
    setTimeout(() => { setRunning(false); setRan(true) }, 1800)
  }

  const result = mockOptimizationResult
  const canRun = selectedDist.size > 0 && selectedBuild.size > 0

  return (
    <div className="max-w-5xl">
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          Optimization
        </h1>
        <p className="text-sm text-tremor-content-subtle dark:text-dark-tremor-content-subtle mt-0.5">
          Configure a scenario and run the AMPL solver
        </p>
      </div>

      <Card className="mb-5">
        <p className="text-sm font-medium text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis mb-4">
          New scenario
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-tremor-content dark:text-dark-tremor-content mb-1">
              Scenario name
            </label>
            <TextInput
              placeholder="e.g. May 2024 – week 1"
              value={scenarioName}
              onChange={e => setScenarioName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-tremor-content dark:text-dark-tremor-content mb-1">
                Planning horizon (T)
              </label>
              <Select value={horizon} onValueChange={setHorizon}>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="21">21 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </Select>
            </div>

            <div>
              <label className="block text-xs text-tremor-content dark:text-dark-tremor-content mb-1">
                Daily spoilage rate (α)
              </label>
              <NumberInput
                value={alpha}
                onValueChange={v => setAlpha(v ?? 0.05)}
                min={0} max={1} step={0.01}
                placeholder="0.05"
              />
              <p className="text-xs text-tremor-content-subtle dark:text-dark-tremor-content-subtle mt-1">
                fraction of inventory lost per day (e.g. 0.05 = 5%)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs text-tremor-content dark:text-dark-tremor-content mb-2">
                Distributors (D)
              </label>
              <div className="space-y-2">
                {mockDistributors.map(d => (
                  <label key={d.id} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedDist.has(d.id)}
                      onChange={() => setSelectedDist(toggle(selectedDist, d.id))}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-sm text-tremor-content-strong dark:text-dark-tremor-content-strong">
                      {d.name}
                    </span>
                    <span className="text-xs text-tremor-content-subtle dark:text-dark-tremor-content-subtle">
                      {d.base_price} PLN/kg · LT {d.lead_time_days}d
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-tremor-content dark:text-dark-tremor-content mb-2">
                Buildings (B)
              </label>
              <div className="space-y-2">
                {mockBuildings.map(b => (
                  <label key={b.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBuild.has(b.id)}
                      onChange={() => setSelectedBuild(toggle(selectedBuild, b.id))}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-sm text-tremor-content-strong dark:text-dark-tremor-content-strong">
                      {b.name}
                    </span>
                    <span className="text-xs text-tremor-content-subtle dark:text-dark-tremor-content-subtle">
                      {b.daily_demand_kg} kg/day
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-1 flex items-center gap-3">
            <Button onClick={handleRun} loading={running} disabled={running || !canRun}>
              {running ? 'Solver running...' : 'Run optimization'}
            </Button>
            {!canRun && (
              <Text className="text-xs text-red-500">
                Select at least one distributor and one building
              </Text>
            )}
          </div>
        </div>
      </Card>

      {ran && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <Card>
              <Text>Total cost</Text>
              <Metric>{result.total_cost_pln.toLocaleString('en-US')} PLN</Metric>
              <Badge color="green" size="xs" className="mt-2">optimal</Badge>
            </Card>
            <Card>
              <Text>Purchase (after discounts)</Text>
              <Metric>
                {(result.cost_breakdown.purchase_base + result.cost_breakdown.purchase_discount)
                  .toLocaleString('en-US')} PLN
              </Metric>
              <Text className="text-xs text-green-600 mt-1">
                −{Math.abs(result.cost_breakdown.purchase_discount).toLocaleString('en-US')} PLN savings
              </Text>
            </Card>
            <Card>
              <Text>Delivery costs (C_fix)</Text>
              <Metric>{result.cost_breakdown.fixed_delivery.toLocaleString('en-US')} PLN</Metric>
              <Text className="text-xs mt-1">{result.orders.length} deliveries total</Text>
            </Card>
          </div>

          <Card>
            <Flex className="mb-4">
              <p className="text-sm font-medium text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
                Order schedule
              </p>
              <Button size="xs" color="green">Confirm schedule</Button>
            </Flex>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Day (t)</TableHeaderCell>
                  <TableHeaderCell>Distributor (d)</TableHeaderCell>
                  <TableHeaderCell>Building (b)</TableHeaderCell>
                  <TableHeaderCell>Quantity x [kg]</TableHeaderCell>
                  <TableHeaderCell>P₀ [PLN/kg]</TableHeaderCell>
                  <TableHeaderCell>Value</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.orders.map((o, i) => (
                  <TableRow key={i}>
                    <TableCell><Badge color="blue" size="xs">t={o.day}</Badge></TableCell>
                    <TableCell><Text>{o.distributor}</Text></TableCell>
                    <TableCell><Text>{o.building}</Text></TableCell>
                    <TableCell><Text>{o.quantity_kg} kg</Text></TableCell>
                    <TableCell><Text>{o.unit_price.toFixed(2)}</Text></TableCell>
                    <TableCell>
                      <Text className="font-medium">
                        {(o.quantity_kg * o.unit_price).toLocaleString('en-US')} PLN
                      </Text>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  )
}
