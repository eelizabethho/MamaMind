"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../ui/chart"

interface Transaction {
  id: number
  label: string
  amount: number
  type: "income" | "expense" | "bill"
  month: string
  isPaid: boolean
}

interface FinancialPieChartProps {
  transactions: Transaction[]
  activeMonth: string
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
  bills: {
    label: "Bills",
    color: "#2d1b2d",
  },
} satisfies ChartConfig

export function FinancialPieChart({ transactions, activeMonth }: FinancialPieChartProps) {
  const chartData = React.useMemo(() => {
    const monthlyData = transactions.filter((t) => t.month === activeMonth)
    const income = monthlyData
      .filter((t) => t.type === "income")
      .reduce((a, b) => a + b.amount, 0)
    const expenses = monthlyData
      .filter((t) => t.type === "expense")
      .reduce((a, b) => a + b.amount, 0)
    const bills = monthlyData
      .filter((t) => t.type === "bill" && t.isPaid)
      .reduce((a, b) => a + b.amount, 0)

    // Use dummy data if no real data
    const useDummyData = income === 0 && expenses === 0 && bills === 0
    const dummyIncome = useDummyData ? 1200 : income
    const dummyExpenses = useDummyData ? 650 : expenses
    const dummyBills = useDummyData ? 350 : bills

    const data = []
    if (dummyIncome > 0) {
      data.push({
        category: "income",
        amount: dummyIncome,
        fill: "#9caf88",
      })
    }
    if (dummyExpenses > 0) {
      data.push({
        category: "expenses",
        amount: dummyExpenses,
        fill: "#d6a5a5",
      })
    }
    if (dummyBills > 0) {
      data.push({
        category: "bills",
        amount: dummyBills,
        fill: "#2d1b2d",
      })
    }

    return data
  }, [transactions, activeMonth])

  const total = chartData.reduce((sum, item) => sum + item.amount, 0)

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Financial Breakdown</CardTitle>
        <CardDescription>{activeMonth} 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) => `$${Number(value).toFixed(2)}`}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="amount"
              label={(entry) => {
                const percent = ((entry.amount / total) * 100).toFixed(0)
                return `${percent}%`
              }}
              nameKey="category"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-2">
        <div className="flex items-center gap-2 leading-none font-medium text-[#2d1b2d]">
          Total: ${total.toFixed(2)}
        </div>
        <div className="text-[#2d1b2d]/60 leading-none text-xs">
          Showing breakdown for {activeMonth}
        </div>
      </CardFooter>
    </Card>
  )
}
