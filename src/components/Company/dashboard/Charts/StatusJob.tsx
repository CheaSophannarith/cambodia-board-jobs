"use client";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
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

interface StatusJobData {
  label: string;
  count: number;
}

interface StatusJobProps {
  StatusJobData: StatusJobData[];
}

const chartData = (data: StatusJobData[]) => {
  return data.map((item) => ({
    label: item.label,
    value: item.count,
  }));
};

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case "active":
      return "hsl(142, 76%, 36%)"; // green
    case "draft":
      return "hsl(48, 96%, 53%)"; // yellow
    case "expired":
      return "hsl(0, 84%, 60%)"; // red
    case "close":
    case "closed":
      return "hsl(0, 0%, 60%)"; // gray
    default:
      return "hsl(var(--chart-1))";
  }
};

const chartConfig = {
  value: {
    label: "Job Status",
  },
} satisfies ChartConfig;

export default function StatusJob({ StatusJobData }: StatusJobProps) {
  const data = chartData(StatusJobData);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Job Status Distribution</CardTitle>
        <CardDescription>Overview of jobs by status</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 px-8">
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-[200px] w-full"
        >
          <BarChart accessibilityLayer data={data} barCategoryGap="30%">
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="value" radius={8}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getStatusColor(entry.label)}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Job status overview <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing job distribution by status
        </div>
      </CardFooter>
    </Card>
  );
}
