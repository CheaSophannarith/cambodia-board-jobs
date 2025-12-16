"use client";

import { TrendingUp } from "lucide-react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

interface PostedJobsLastSixMonthsData {
  month: string;
  count: number;
}

interface PostedJobLastSixMonthsProps {
  PostedJobsLastSixMonthsData: PostedJobsLastSixMonthsData[];
}

const chartConfig = {
  value: {
    label: "Jobs Posted",
    color: "var(--chart-6)",
  },
} satisfies ChartConfig;

export default function PostedJobLastSixMonths({
  PostedJobsLastSixMonthsData,
}: PostedJobLastSixMonthsProps) {
  const chartData = PostedJobsLastSixMonthsData.map((item, index) => ({
    label: item.month.split(" ")[0],
    value: item.count,
  }));

  const totalJobs = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Posted Jobs</CardTitle>
        <CardDescription>
          Showing posted jobs for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="w-full h-[200px]"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" hideLabel />}
            />
            <Line
              dataKey="value"
              type="linear"
              stroke="var(--color-value)"
              strokeWidth={2}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total: {totalJobs} jobs <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing posted jobs in last six months
        </div>
      </CardFooter>
    </Card>
  );
}
