"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

interface Transaction {
  id: number
  label: string
  amount: number
  type: "income" | "expense" | "bill"
  month: string
  isPaid: boolean
}

interface FinancialAreaChartProps {
  transactions: Transaction[]
}

const chartConfig = {
  income: {
    label: "Income",
    color: "#9caf88",
  },
  expenses: {
    label: "Expenses",
    color: "#d6a5a5",
  },
} satisfies ChartConfig

export function FinancialAreaChart({ transactions }: FinancialAreaChartProps) {
  const [timeRange, setTimeRange] = React.useState("90d")

  // Generate dummy data for last 7 days if no transactions
  const generateDummyData = () => {
    const today = new Date()
    const dummyData = []
    const baseIncome = 150
    const baseExpenses = 80

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
      const dayNum = date.getDate()
      
      // Add some variation to make it look realistic
      const incomeVariation = (Math.sin(i) * 30) + (Math.random() * 20 - 10)
      const expenseVariation = (Math.cos(i * 0.8) * 25) + (Math.random() * 15 - 7.5)
      
      dummyData.push({
        date: `${dayName} ${dayNum}`,
        income: Math.max(0, Math.round(baseIncome + incomeVariation)),
        expenses: Math.max(0, Math.round(baseExpenses + expenseVariation)),
      })
    }
    return dummyData
  }

  // Group transactions by month
  const monthlyData = React.useMemo(() => {
    // If no transactions, use dummy data for last 7 days
    if (!transactions || transactions.length === 0) {
      return generateDummyData()
    }

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const data: Record<string, { income: number; expenses: number; date: string }> = {}

    transactions.forEach((t) => {
      if (!t.month) return
      if (!data[t.month]) {
        data[t.month] = { income: 0, expenses: 0, date: t.month }
      }
      if (t.type === "income") {
        data[t.month].income += t.amount || 0
      } else if (t.type === "expense") {
        data[t.month].expenses += t.amount || 0
      } else if (t.type === "bill" && t.isPaid) {
        data[t.month].expenses += t.amount || 0
      }
    })

    // Convert to array and sort by month order
    const result = months
      .map((month) => ({
        date: month,
        income: data[month]?.income || 0,
        expenses: data[month]?.expenses || 0,
      }))
      .filter((item) => item.income > 0 || item.expenses > 0)

    // If no monthly data, use dummy data
    if (result.length === 0) {
      return generateDummyData()
    }

    return result
  }, [transactions])

  const filteredData = React.useMemo(() => {
    // If data looks like daily data (has day names), handle differently
    const isDailyData = monthlyData.length > 0 && monthlyData[0]?.date?.includes("Mon") || monthlyData[0]?.date?.includes("Tue") || monthlyData[0]?.date?.includes("Wed")
    
    if (isDailyData) {
      // For daily dummy data, show last 7 days
      if (timeRange === "7d" || timeRange === "90d") {
        return monthlyData.slice(-7)
      } else if (timeRange === "30d") {
        return monthlyData.slice(-7) // Still show 7 days for 30d when using dummy data
      } else {
        return monthlyData
      }
    }

    // Original monthly logic
    if (timeRange === "all") return monthlyData
    const now = new Date()
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const currentMonthIndex = now.getMonth()
    
    let monthsToShow = 3
    if (timeRange === "30d") monthsToShow = 1
    else if (timeRange === "7d") return monthlyData.slice(-1)

    const startIndex = Math.max(0, currentMonthIndex - monthsToShow + 1)
    return monthlyData.slice(startIndex)
  }, [monthlyData, timeRange])

  // Always show chart with dummy data if needed
  const displayData = filteredData.length > 0 ? filteredData : generateDummyData()

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Income vs Expenses</CardTitle>
          <CardDescription>
            Showing financial trends over time
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d">Last 3 months</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-4">
        <div className="flex flex-col gap-3">
          {/* Legend bar at top */}
          <div className="flex items-center gap-6 justify-center pb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#9caf88]"></div>
              <span className="text-xs text-[#2d1b2d] font-medium">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#d6a5a5]"></div>
              <span className="text-xs text-[#2d1b2d] font-medium">Expenses</span>
            </div>
          </div>
          {/* Chart */}
          <div className="h-[200px] w-full">
            <ChartContainer
              config={chartConfig}
              className="h-full w-full"
            >
              <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#9caf88"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="#9caf88"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#d6a5a5"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="#d6a5a5"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECE0DA" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tick={{ fill: "#2d1b2d", fontSize: 12 }}
                tickFormatter={(value) => {
                  return value ? value.substring(0, 3) : ""
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#2d1b2d", fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return value || ""
                    }}
                    formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="income"
                type="monotone"
                fill="url(#fillIncome)"
                stroke="#9caf88"
                strokeWidth={2}
                name="Income"
              />
              <Area
                dataKey="expenses"
                type="monotone"
                fill="url(#fillExpenses)"
                stroke="#d6a5a5"
                strokeWidth={2}
                name="Expenses"
              />
            </AreaChart>
          </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
