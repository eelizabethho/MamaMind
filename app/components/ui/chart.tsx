"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ")
}

// Chart container props
export interface ChartConfig {
  [k: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<string, string> }
  )
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
  childrenClassName?: string
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ id, className, children, childrenClassName, config, ...props }, ref) => {
    const uniqueId = React.useId()
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

    return (
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex h-full w-full flex-col items-center justify-center [&_.recharts-cartesian-axis-tick_text]:fill-[#2d1b2d]/60 [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-white/40",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%" className={childrenClassName}>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    )
  }
)
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(config)
          .filter(([_, config]) => config.color)
          .map(([key, itemConfig]) => {
            const color = itemConfig.theme
              ? `var(--color-${key})`
              : itemConfig.color
            return `[data-chart=${id}] [data-${key}] { ${color ? `color: ${color};` : ""} }`
          })
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.HTMLAttributes<HTMLDivElement> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item.dataKey || item.name || "value"}`
      const itemConfig = item.payload?.chartConfig?.[key]

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(label, payload)}
          </div>
        )
      }

      if (!labelFormatter && typeof label === "string") {
        return <div className={cn("font-medium", labelClassName)}>{label}</div>
      }

      if (!labelFormatter && label) {
        return (
          <div className={cn("font-medium", labelClassName)}>{label}</div>
        )
      }

      return null
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      labelKey,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-white/50 bg-white/95 p-2.5 text-sm shadow-lg backdrop-blur-sm",
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className={cn("grid gap-1.5", nestLabel ? "gap-2" : "mt-1.5")}>
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = item.payload?.chartConfig?.[key]
            const indicatorColor = color || item.payload.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex items-center gap-2 rounded-[6px] px-2 py-1.5",
                  nestLabel
                    ? "bg-white/80 border border-white/50"
                    : "bg-white/50"
                )}
              >
                {!nestLabel && !hideIndicator ? (
                  <div
                    className={cn(
                      "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                      {
                        "h-2.5 w-2.5": indicator === "dot",
                        "h-0.5 w-3": indicator === "dashed",
                        "h-3 w-0.5": indicator === "line",
                      }
                    )}
                    style={
                      {
                        "--color-bg": indicatorColor,
                        "--color-border": indicatorColor,
                      } as React.CSSProperties
                    }
                  />
                ) : null}
                {nestLabel && tooltipLabel ? (
                  <div className={cn("font-medium", labelClassName)}>
                    {typeof labelFormatter === "function"
                      ? labelFormatter(label, [item])
                      : item.name}
                  </div>
                ) : null}
                <div
                  className={cn(
                    "flex flex-1 items-center justify-between gap-4",
                    nestLabel && "pr-0"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[#2d1b2d]/60",
                        nestLabel && "text-[#2d1b2d]"
                      )}
                    >
                      {itemConfig?.label || item.name}
                    </span>
                  </div>
                  {formatter && item.value !== undefined && item.value !== null ? (
                    <span className={cn("font-mono font-medium tabular-nums text-[#2d1b2d]")}>
                      {formatter(item.value, item.name, item, index, item.payload)}
                    </span>
                  ) : (
                    <span className={cn("font-mono font-medium tabular-nums text-[#2d1b2d]")}>
                      {typeof item.value === "number"
                        ? item.value.toFixed(2)
                        : item.value}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Legend> &
    React.HTMLAttributes<HTMLDivElement> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(
  (
    {
      className,
      hideIcon = false,
      payload,
      verticalAlign = "bottom",
      nameKey,
      ...props
    },
    ref
  ) => {
    if (!payload?.length) {
      return null
    }

  const alignClass = props.align === "left" ? "justify-start" : props.align === "right" ? "justify-end" : "justify-center"
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-4",
        alignClass,
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
      {...props}
    >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = item.payload?.chartConfig?.[key]

          return (
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-[#2d1b2d]"
              )}
            >
              {!hideIcon && (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.icon ? (
                <itemConfig.icon />
              ) : null}
              <span className="text-xs text-[#2d1b2d]/70">
                {itemConfig?.label || item.value}
              </span>
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegendContent"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}
