import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"

interface TooltipDemoProps {
  buttonText?: string
  tooltipText?: string
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function TooltipDemo({
  buttonText = "Hover",
  tooltipText = "Add to library",
  buttonVariant = "outline"
}: TooltipDemoProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={buttonVariant}>{buttonText}</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  )
}

const meta: Meta<typeof TooltipDemo> = {
  title: "Shadcn UI/Tooltip",
  component: TooltipDemo,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    buttonText: {
      control: "text",
      description: "Text displayed on the button",
    },
    tooltipText: {
      control: "text",
      description: "Text displayed in the tooltip",
    },
    buttonVariant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      description: "Button variant/style",
    },
  },
}

export default meta

type Story = StoryObj<typeof TooltipDemo>

export const Default: Story = {
  args: {
    buttonText: "Hover",
    tooltipText: "Add to library",
    buttonVariant: "outline",
  },
}
