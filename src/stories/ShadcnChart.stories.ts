import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { createElement } from 'react';
import type { ChartConfig } from '@/components/ui/chart';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
} from 'recharts';

interface ChartStoryArgs {
  desktopColor: string;
  mobileColor: string;
  januaryDesktop: number;
  januaryMobile: number;
  februaryDesktop: number;
  februaryMobile: number;
  marchDesktop: number;
  marchMobile: number;
  aprilDesktop: number;
  aprilMobile: number;
  mayDesktop: number;
  mayMobile: number;
  juneDesktop: number;
  juneMobile: number;
}

const meta: Meta<ChartStoryArgs> = {
  title: 'Shadcn UI/Chart',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    desktopColor: {
      control: { type: 'color' },
      description: 'Màu cho Desktop',
    },
    mobileColor: {
      control: { type: 'color' },
      description: 'Màu cho Mobile',
    },
    januaryDesktop: {
      control: { type: 'range', min: 0, max: 500, step: 10 },
      description: 'Desktop tháng 1',
    },
    januaryMobile: {
      control: { type: 'range', min: 0, max: 500, step: 10 },
      description: 'Mobile tháng 1',
    },
    februaryDesktop: {
      control: { type: 'range', min: 0, max: 500, step: 10 },
      description: 'Desktop tháng 2',
    },
    februaryMobile: {
      control: { type: 'range', min: 0, max: 500, step: 10 },
      description: 'Mobile tháng 2',
    },
    marchDesktop: {
      control: { type: 'range', min: 0, max: 500, step: 10 },
      description: 'Desktop tháng 3',
    },
    marchMobile: {
      control: { type: 'range', min: 0, max: 500, step: 10 },
      description: 'Mobile tháng 3',
    },
    aprilDesktop: {
      control: { type: 'range', min: 0, max: 500, step: 10 },
      description: 'Desktop tháng 4',
    },
    aprilMobile: {
      control: { type: 'range', min: 0, max: 500, step: 10 },
      description: 'Mobile tháng 4',
    },
    mayDesktop: {
      control: { type: 'range', min: 0, max: 500, step: 10 },
      description: 'Desktop tháng 5',
    },
    mayMobile: {
      control: { type: 'range', min: 0, max: 500, step: 10 },
      description: 'Mobile tháng 5',
    },
    juneDesktop: {
      control: { type: 'range', min: 0, max: 500, step: 10 },
      description: 'Desktop tháng 6',
    },
    juneMobile: {
      control: { type: 'range', min: 0, max: 500, step: 10 },
      description: 'Mobile tháng 6',
    },
  },
};

export default meta;
type Story = StoryObj<ChartStoryArgs>;

export const Interactive: Story = {
  args: {
    desktopColor: '#2563eb',
    mobileColor: '#dc2626',
    januaryDesktop: 186,
    januaryMobile: 80,
    februaryDesktop: 305,
    februaryMobile: 200,
    marchDesktop: 237,
    marchMobile: 120,
    aprilDesktop: 173,
    aprilMobile: 190,
    mayDesktop: 209,
    mayMobile: 130,
    juneDesktop: 214,
    juneMobile: 140,
  },
  render: (args) => {
    const chartConfig: ChartConfig = {
      desktop: {
        label: 'Desktop',
        color: args.desktopColor,
      },
      mobile: {
        label: 'Mobile',
        color: args.mobileColor,
      },
    };

    const data = [
      { month: 'Jan', desktop: args.januaryDesktop, mobile: args.januaryMobile },
      { month: 'Feb', desktop: args.februaryDesktop, mobile: args.februaryMobile },
      { month: 'Mar', desktop: args.marchDesktop, mobile: args.marchMobile },
      { month: 'Apr', desktop: args.aprilDesktop, mobile: args.aprilMobile },
      { month: 'May', desktop: args.mayDesktop, mobile: args.mayMobile },
      { month: 'Jun', desktop: args.juneDesktop, mobile: args.juneMobile },
    ];

    return createElement('div', { className: 'w-[600px] h-[400px]' },
      createElement(ChartContainer, { config: chartConfig },
        createElement(BarChart, { data },
          createElement(CartesianGrid, { vertical: false }),
          createElement(XAxis, {
            dataKey: 'month',
            tickLine: false,
            tickMargin: 10,
            axisLine: false,
          }),
          createElement(YAxis),
          createElement(ChartTooltip, {
            cursor: false,
            content: createElement(ChartTooltipContent, { indicator: 'dashed' }),
          }),
          createElement(Bar, { 
            dataKey: 'desktop', 
            fill: args.desktopColor,
            radius: 4 
          }),
          createElement(Bar, { 
            dataKey: 'mobile', 
            fill: args.mobileColor,
            radius: 4 
          })
        )
      )
    );
  },
};

export const Simple: Story = {
  args: {
    desktopColor: '#2563eb',
    mobileColor: '#dc2626',
    januaryDesktop: 186,
    januaryMobile: 80,
    februaryDesktop: 305,
    februaryMobile: 200,
    marchDesktop: 237,
    marchMobile: 120,
    aprilDesktop: 173,
    aprilMobile: 190,
    mayDesktop: 209,
    mayMobile: 130,
    juneDesktop: 214,
    juneMobile: 140,
  },
  render: (args) => {
    const data = [
      { month: 'Jan', desktop: args.januaryDesktop, mobile: args.januaryMobile },
      { month: 'Feb', desktop: args.februaryDesktop, mobile: args.februaryMobile },
      { month: 'Mar', desktop: args.marchDesktop, mobile: args.marchMobile },
    ];

    const chartConfig: ChartConfig = {
      desktop: { label: 'Desktop', color: args.desktopColor },
      mobile: { label: 'Mobile', color: args.mobileColor },
    };

    return createElement('div', { className: 'w-[500px] h-[300px]' },
      createElement(ChartContainer, { config: chartConfig },
        createElement(BarChart, { data },
          createElement(XAxis, { dataKey: 'month' }),
          createElement(Bar, { dataKey: 'desktop', fill: args.desktopColor })
        )
      )
    );
  },
};

// Multi Axis Chart
export const MultiAxis: Story = {
  args: {
    desktopColor: '#2563eb',
    mobileColor: '#dc2626',
    januaryDesktop: 186,
    januaryMobile: 80,
    februaryDesktop: 305,
    februaryMobile: 200,
    marchDesktop: 237,
    marchMobile: 120,
    aprilDesktop: 173,
    aprilMobile: 190,
    mayDesktop: 209,
    mayMobile: 130,
    juneDesktop: 214,
    juneMobile: 140,
  },
  render: (args) => {
    const chartConfig: ChartConfig = {
      desktop: { label: 'Desktop', color: args.desktopColor },
      mobile: { label: 'Mobile', color: args.mobileColor },
      revenue: { label: 'Revenue', color: '#16a34a' },
    };

    const data = [
      { month: 'Jan', desktop: args.januaryDesktop, mobile: args.januaryMobile, revenue: args.januaryDesktop * 10 },
      { month: 'Feb', desktop: args.februaryDesktop, mobile: args.februaryMobile, revenue: args.februaryDesktop * 10 },
      { month: 'Mar', desktop: args.marchDesktop, mobile: args.marchMobile, revenue: args.marchDesktop * 10 },
      { month: 'Apr', desktop: args.aprilDesktop, mobile: args.aprilMobile, revenue: args.aprilDesktop * 10 },
      { month: 'May', desktop: args.mayDesktop, mobile: args.mayMobile, revenue: args.mayDesktop * 10 },
      { month: 'Jun', desktop: args.juneDesktop, mobile: args.juneMobile, revenue: args.juneDesktop * 10 },
    ];

    return createElement('div', { className: 'w-[600px] h-[400px]' },
      createElement(ChartContainer, { config: chartConfig },
        createElement(ComposedChart, { data },
          createElement(CartesianGrid, { strokeDasharray: '3 3' }),
          createElement(XAxis, { dataKey: 'month' }),
          createElement(YAxis, { yAxisId: 'left' }),
          createElement(YAxis, { yAxisId: 'right', orientation: 'right' }),
          createElement(ChartTooltip, { content: createElement(ChartTooltipContent) }),
          createElement(Bar, { yAxisId: 'left', dataKey: 'desktop', fill: args.desktopColor }),
          createElement(Bar, { yAxisId: 'left', dataKey: 'mobile', fill: args.mobileColor }),
          createElement(Line, { yAxisId: 'right', type: 'monotone', dataKey: 'revenue', stroke: '#16a34a', strokeWidth: 2 })
        )
      )
    );
  },
};

// Donut Chart
export const DonutChart: Story = {
  args: {
    desktopColor: '#2563eb',
    mobileColor: '#dc2626',
    januaryDesktop: 186,
    januaryMobile: 80,
    februaryDesktop: 305,
    februaryMobile: 200,
    marchDesktop: 237,
    marchMobile: 120,
  },
  render: (args) => {
    const chartConfig: ChartConfig = {
      desktop: { label: 'Desktop', color: args.desktopColor },
      mobile: { label: 'Mobile', color: args.mobileColor },
      tablet: { label: 'Tablet', color: '#16a34a' },
    };

    const pieData = [
      { name: 'desktop', value: args.januaryDesktop + args.februaryDesktop + args.marchDesktop, fill: args.desktopColor },
      { name: 'mobile', value: args.januaryMobile + args.februaryMobile + args.marchMobile, fill: args.mobileColor },
      { name: 'tablet', value: 150, fill: '#16a34a' },
    ];

    return createElement('div', { className: 'w-[500px] h-[500px]' },
      createElement(ChartContainer, { config: chartConfig },
        createElement(PieChart, { 
          width: 500, 
          height: 500
        },
          createElement(Pie, {
            data: pieData,
            dataKey: 'value',
            nameKey: 'name',
            cx: '50%',
            cy: '50%',
            innerRadius: 80,
            outerRadius: 160
          }),
          createElement(ChartTooltip)
        )
      )
    );
  },
};

// Mixed Chart
export const MixedChart: Story = {
  args: {
    desktopColor: '#2563eb',
    mobileColor: '#dc2626',
    januaryDesktop: 186,
    januaryMobile: 80,
    februaryDesktop: 305,
    februaryMobile: 200,
    marchDesktop: 237,
    marchMobile: 120,
    aprilDesktop: 173,
    aprilMobile: 190,
    mayDesktop: 209,
    mayMobile: 130,
    juneDesktop: 214,
    juneMobile: 140,
  },
  render: (args) => {
    const chartConfig: ChartConfig = {
      desktop: { label: 'Desktop', color: args.desktopColor },
      mobile: { label: 'Mobile', color: args.mobileColor },
      trend: { label: 'Trend', color: '#16a34a' },
    };

    const data = [
      { month: 'Jan', desktop: args.januaryDesktop, mobile: args.januaryMobile, trend: (args.januaryDesktop + args.januaryMobile) / 2 },
      { month: 'Feb', desktop: args.februaryDesktop, mobile: args.februaryMobile, trend: (args.februaryDesktop + args.februaryMobile) / 2 },
      { month: 'Mar', desktop: args.marchDesktop, mobile: args.marchMobile, trend: (args.marchDesktop + args.marchMobile) / 2 },
      { month: 'Apr', desktop: args.aprilDesktop, mobile: args.aprilMobile, trend: (args.aprilDesktop + args.aprilMobile) / 2 },
      { month: 'May', desktop: args.mayDesktop, mobile: args.mayMobile, trend: (args.mayDesktop + args.mayMobile) / 2 },
      { month: 'Jun', desktop: args.juneDesktop, mobile: args.juneMobile, trend: (args.juneDesktop + args.juneMobile) / 2 },
    ];

    return createElement('div', { className: 'w-[600px] h-[400px]' },
      createElement(ChartContainer, { config: chartConfig },
        createElement(ComposedChart, { data },
          createElement(CartesianGrid, { vertical: false }),
          createElement(XAxis, { dataKey: 'month' }),
          createElement(YAxis),
          createElement(ChartTooltip, { content: createElement(ChartTooltipContent) }),
          createElement(Bar, { dataKey: 'desktop', fill: args.desktopColor, radius: 4 }),
          createElement(Bar, { dataKey: 'mobile', fill: args.mobileColor, radius: 4 }),
          createElement(Line, { type: 'monotone', dataKey: 'trend', stroke: '#16a34a', strokeWidth: 3 })
        )
      )
    );
  },
};

// Simple Pie Chart
export const SimplePie: Story = {
  args: {
    desktopColor: '#2563eb',
    mobileColor: '#dc2626',
    januaryDesktop: 186,
    januaryMobile: 80,
    februaryDesktop: 305,
    februaryMobile: 200,
    marchDesktop: 237,
    marchMobile: 120,
  },
  render: (args) => {
    const chartConfig: ChartConfig = {
      desktop: { label: 'Desktop', color: args.desktopColor },
      mobile: { label: 'Mobile', color: args.mobileColor },
    };

    const pieData = [
      { name: 'desktop', value: args.januaryDesktop + args.februaryDesktop + args.marchDesktop, fill: args.desktopColor },
      { name: 'mobile', value: args.januaryMobile + args.februaryMobile + args.marchMobile, fill: args.mobileColor },
    ];

    return createElement('div', { className: 'w-[500px] h-[500px]' },
      createElement(ChartContainer, { config: chartConfig },
        createElement(PieChart, { 
          width: 500, 
          height: 500
        },
          createElement(Pie, {
            data: pieData,
            dataKey: 'value',
            nameKey: 'name',
            cx: '50%',
            cy: '50%',
            outerRadius: 160,
            label: true
          }),
          createElement(ChartTooltip)
        )
      )
    );
  },
};

// Simple Area Chart
export const SimpleArea: Story = {
  args: {
    desktopColor: '#2563eb',
    mobileColor: '#dc2626',
    januaryDesktop: 186,
    januaryMobile: 80,
    februaryDesktop: 305,
    februaryMobile: 200,
    marchDesktop: 237,
    marchMobile: 120,
    aprilDesktop: 173,
    aprilMobile: 190,
    mayDesktop: 209,
    mayMobile: 130,
    juneDesktop: 214,
    juneMobile: 140,
  },
  render: (args) => {
    const chartConfig: ChartConfig = {
      desktop: { label: 'Desktop', color: args.desktopColor },
      mobile: { label: 'Mobile', color: args.mobileColor },
    };

    const data = [
      { month: 'Jan', desktop: args.januaryDesktop, mobile: args.januaryMobile },
      { month: 'Feb', desktop: args.februaryDesktop, mobile: args.februaryMobile },
      { month: 'Mar', desktop: args.marchDesktop, mobile: args.marchMobile },
      { month: 'Apr', desktop: args.aprilDesktop, mobile: args.aprilMobile },
      { month: 'May', desktop: args.mayDesktop, mobile: args.mayMobile },
      { month: 'Jun', desktop: args.juneDesktop, mobile: args.juneMobile },
    ];

    return createElement('div', { className: 'w-[600px] h-[400px]' },
      createElement(ChartContainer, { config: chartConfig },
        createElement(AreaChart, { data },
          createElement(CartesianGrid, { strokeDasharray: '3 3' }),
          createElement(XAxis, { dataKey: 'month' }),
          createElement(YAxis),
          createElement(ChartTooltip, { content: createElement(ChartTooltipContent) }),
          createElement(Area, {
            type: 'monotone',
            dataKey: 'desktop',
            stackId: '1',
            stroke: args.desktopColor,
            fill: args.desktopColor,
            fillOpacity: 0.6,
          }),
          createElement(Area, {
            type: 'monotone',
            dataKey: 'mobile',
            stackId: '1',
            stroke: args.mobileColor,
            fill: args.mobileColor,
            fillOpacity: 0.6,
          })
        )
      )
    );
  },
};
