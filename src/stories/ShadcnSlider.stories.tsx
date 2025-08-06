import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Slider } from '@/components/ui/slider'
import React, { useState } from 'react'

type SliderStoryArgs = {
  defaultValue: number[]
  max: number
  step: number
  trackColor: string
  rangeColor: string
  thumbColor: string
}

const meta: Meta<SliderStoryArgs> = {
  title: 'Shadcn UI/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    trackColor: {
      control: { type: 'color' },
      description: 'Màu của thanh nền',
    },
    rangeColor: {
      control: { type: 'color' },
      description: 'Màu của phần đã chọn',
    },
    thumbColor: {
      control: { type: 'color' },
      description: 'Màu của nút kéo',
    },
    defaultValue: {
      control: { type: 'object' },
      description: 'Giá trị mặc định',
    },
    max: {
      control: { type: 'number' },
      description: 'Giá trị tối đa',
    },
    step: {
      control: { type: 'number' },
      description: 'Bước nhảy',
    },
  },
}

export default meta

type Story = StoryObj<SliderStoryArgs>

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<number[]>(args.defaultValue ?? [50])

    return (
      <div className="w-[400px] border border-gray-300 rounded-lg p-0.5 shadow-sm">
        <style>
          {`
            .custom-slider [data-slot="slider-track"] {
              background-color: ${args.trackColor} !important;
            }
            .custom-slider [data-slot="slider-range"] {
              background-color: ${args.rangeColor} !important;
            }
            .custom-slider [data-slot="slider-thumb"] {
              background-color: ${args.thumbColor} !important;
              border-color: ${args.thumbColor} !important;
            }
          `}
        </style>
        <Slider
          defaultValue={args.defaultValue}
          max={args.max}
          step={args.step}
          value={value}
          onValueChange={setValue}
          className="w-full custom-slider"
        />
      </div>
    )
  },
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
    trackColor: '#e2e8f0',
    rangeColor: '#3b82f6',
    thumbColor: '#1d4ed8',
  },
}

