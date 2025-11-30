"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface JobTypeData {
  label: string;
  count: number;
}

interface JobTypesProps {
  jobTypeData: JobTypeData[];
}

export default function JobTypes({ jobTypeData }: JobTypesProps) {
  // Define explicit colors for the chart and legend
  const colors = [
    "#2563eb", // blue
    "#16a34a", // green
    "#dc2626", // red
    "#ca8a04", // yellow
    "#9333ea", // purple
  ];

  const chartData = jobTypeData.map((item, index) => ({
    label: item.label,
    value: item.count,
    fill: colors[index % colors.length],
  }));

  const chartConfig: ChartConfig = jobTypeData.reduce((config, item, index) => {
    config[item.label.toLowerCase().replace(/\s+/g, "-")] = {
      label: item.label,
      color: colors[index % colors.length],
    };
    return config;
  }, {} as ChartConfig);

  const totalJobs = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Job Types</CardTitle>
        <CardDescription>Overview of job types</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              innerRadius={60}
              strokeWidth={5}
            />
          </PieChart>
        </ChartContainer>

        {/* Legend with colored labels */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-sm"
                style={{
                  backgroundColor: item.fill
                }}
              />
              <span className="text-sm font-medium">
                {item.label} ({item.value})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total: {totalJobs} jobs <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing distribution of job types
        </div>
      </CardFooter>
    </Card>
  );
}
