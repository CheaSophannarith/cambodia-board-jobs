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

interface isRemoteData {
  label: string;
  count: number;
}

interface IsRemoteProps {
  isRemoteData: isRemoteData[];
}

export default function IsRemote({ isRemoteData }: IsRemoteProps) {
  // Define explicit colors for the chart and legend
  const colors = [
    "#2563eb", // blue
    "#16a34a", // green
  ];

  const chartData = isRemoteData.map((item, index) => ({
    label: item.label,
    value: item.count,
    fill: colors[index % colors.length],
  }));

  const chartConfig: ChartConfig = isRemoteData.reduce(
    (config, item, index) => {
      config[item.label.toLowerCase().replace(/\s+/g, "-")] = {
        label: item.label,
        color: colors[index % colors.length],
      };
      return config;
    },
    {} as ChartConfig
  );

  const totalJobs = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip formatter
  const customFormatter = (value: any, name: any) => {
    const numValue = Number(value);
    const percentage = ((numValue / totalJobs) * 100).toFixed(1);
    return `${name}: ${percentage}% (${numValue})`;
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Work Location</CardTitle>
        <CardDescription>Overview remote and onsite jobs</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel formatter={customFormatter} />}
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
                  backgroundColor: item.fill,
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
        <div className="leading-none text-muted-foreground">
          Showing distribution of remote and onsite jobs
        </div>
      </CardFooter>
    </Card>
  );
}
