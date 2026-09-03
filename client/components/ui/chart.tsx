"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

const INITIAL_DIMENSION = { width: 320, height: 200 } as const

const CHART_ACTIVE_DOT_SIZE = 16

type ChartActiveDotProps = {
  cx?: number
  cy?: number
  color: string
}

/** Perfect circle — equal width/height, centered on (cx, cy). */
function ChartActiveDot({ cx, cy, color }: ChartActiveDotProps) {
  if (cx == null || cy == null) return null

  const size = CHART_ACTIVE_DOT_SIZE
  const half = size / 2

  return (
    <foreignObject
      x={cx - half}
      y={cy - half}
      width={size}
      height={size}
      className="overflow-visible"
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: color,
          boxSizing: "border-box",
          border: "2.5px solid var(--card)",
          boxShadow: "0 0 0 1px rgba(17, 24, 39, 0.08)",
        }}
      />
    </foreignObject>
  )
}

/** Recharts Line `activeDot` renderer — keeps markers circular at any chart size. */
function createChartActiveDot(color: string) {
  return function LineChartActiveDot(props: { cx?: number; cy?: number }) {
    return <ChartActiveDot cx={props.cx} cy={props.cy} color={color} />
  }
}

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
>

function ChartContainer({
  id,
  className,
  children,
  config,
  initialDimension = INITIAL_DIMENSION,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
  initialDimension?: {
    width: number
    height: number
  }
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`

  return (
    <div
      data-slot="chart"
      data-chart={chartId}
      className={cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
        className
      )}
      {...props}
    >
      <ChartStyle id={chartId} config={config} />
      <RechartsPrimitive.ResponsiveContainer
        initialDimension={initialDimension}
        // Coalesce rapid parent resizes (e.g. sidebar toggle) into one redraw.
        debounce={150}
      >
        {children}
      </RechartsPrimitive.ResponsiveContainer>
    </div>
  )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme ?? config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ??
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

/** Shared Nivarak chart tooltip shell — use for every chart. */
function ChartTooltipPanel({
  title,
  children,
  className,
}: {
  title?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "inline-flex flex-col items-start justify-start gap-1.5 overflow-hidden rounded-md bg-card px-3 py-2.5 shadow-[0px_4px_12px_rgba(17,24,39,0.12)] outline-1 -outline-offset-1 outline-border",
        className
      )}
    >
      {title != null ? (
        <div className="text-xs font-semibold wrap-break-word text-foreground">
          {title}
        </div>
      ) : null}
      {title != null && children != null ? (
        <div className="h-px w-full self-stretch bg-divider" />
      ) : null}
      {children}
    </div>
  )
}

/** Single label/value row inside ChartTooltipPanel. */
function ChartTooltipRow({
  label,
  value,
  color,
  valueClassName,
  className,
}: {
  label: React.ReactNode
  value: React.ReactNode
  /** Swatch color; omit to hide the indicator. */
  color?: string
  valueClassName?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-start gap-2 overflow-hidden",
        className
      )}
    >
      {color ? (
        <span
          aria-hidden
          className="size-2 shrink-0 rounded-xs"
          style={{ backgroundColor: color }}
        />
      ) : null}
      <span className="text-xs font-normal wrap-break-word text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "text-xs font-semibold wrap-break-word text-foreground",
          valueClassName
        )}
      >
        {value}
      </span>
    </div>
  )
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipPanel,
  ChartTooltipRow,
  createChartActiveDot,
};
