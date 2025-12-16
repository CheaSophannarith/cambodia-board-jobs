"use client";

import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface ExperienceLevelData {
  label: string;
  count: number;
}

interface ExperienceLevelProps {
  ExperienceLevelData: ExperienceLevelData[];
}

export default function ExperienceLevel({
  ExperienceLevelData,
}: ExperienceLevelProps) {
  const data = ExperienceLevelData.map((item, index) => ({
    label: item.label,
    value: item.count,
  }));

  const chartConfig = {
    value: {
      label: "Experience Level",
      color: "var(--chart-6)",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experience Level of Jobs</CardTitle>
        <CardDescription>
          Showing distribution of experience levels of jobs
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center px-16">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: 0,
              right: 16,
            }}
            barCategoryGap="10%"
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="value" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="value"
              layout="vertical"
              fill="var(--color-value)"
              radius={4}
            >
              <LabelList
                dataKey="label"
                position="insideLeft"
                offset={8}
                fontSize={12}
                content={({ x, y, width, height, value, index }) => {
                  const barValue = data[index as number]?.value || 0;
                  const fillClass = barValue === 0 ? "fill-foreground" : "fill-white";
                  return (
                    <text
                      x={Number(x) + 8}
                      y={Number(y) + (Number(height) || 0) / 2}
                      textAnchor="start"
                      dominantBaseline="middle"
                      className={fillClass}
                      fontSize={12}
                    >
                      {value}
                    </text>
                  );
                }}
              />
              <LabelList
                dataKey="value"
                className="fill-foreground"
                fontSize={12}
                content={({ x, y, width, height, value, index }) => {
                  const barValue = data[index as number]?.value || 0;
                  if (barValue === 0) {
                    return (
                      <text
                        x={Number(x) + 80}
                        y={Number(y) + (Number(height) || 0) / 2}
                        textAnchor="start"
                        dominantBaseline="middle"
                        className="fill-foreground"
                        fontSize={12}
                      >
                        {value}
                      </text>
                    );
                  }
                  return (
                    <text
                      x={Number(x) + Number(width) + 8}
                      y={Number(y) + (Number(height) || 0) / 2}
                      textAnchor="start"
                      dominantBaseline="middle"
                      className="fill-foreground"
                      fontSize={12}
                    >
                      {value}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing distribution of experience levels
        </div>
      </CardFooter>
    </Card>
  );
}
