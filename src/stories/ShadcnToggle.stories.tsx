import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Bold } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { Italic } from "lucide-react"

import * as React from "react"

type ToggleDemoProps = {
  pressed?: boolean
  disabled?: boolean
}

const ToggleWithText = ({ size }: { size: "sm" | "md" | "lg" }) => {
  const iconSize = size === "sm" ? 16 : size === "lg" ? 32 : 20

  return (
    <Toggle aria-label="Toggle italic">
      <Italic size={iconSize} />
      Italic
    </Toggle>
  )
}

function ToggleDemo({ pressed = false, disabled = false }: ToggleDemoProps) {
  const [on, setOn] = React.useState(pressed)

  return (
    <Toggle
      aria-label="Toggle bold"
      pressed={on}
      onPressedChange={setOn}
      disabled={disabled}
    >
      <Bold className="h-4 w-4" />
    </Toggle>
  )
}

const meta: Meta<typeof ToggleDemo> = {
  title: "Shadcn UI/Toggle",
  component: ToggleDemo,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    pressed: {
      control: "boolean",
      defaultValue: false,
      description: "Trạng thái bật tắt ban đầu",
    },
    disabled: {
      control: "boolean",
      defaultValue: false,
      description: "Vô hiệu hóa toggle",
    },
    
  },
}

export default meta

type Story = StoryObj<typeof ToggleDemo>

export const Default: Story = {
  args: {
    pressed: false,
    disabled: false,
  },
}
export const Outline: StoryObj = {
  render: (args) => {
    const [on, setOn] = React.useState(args.pressed)

    return (
      <Toggle
        variant="outline"
        aria-label="Toggle italic"
        pressed={on}
        onPressedChange={setOn}
        disabled={args.disabled}
      >
        <Italic className="h-4 w-4" />
      </Toggle>
    )
  },
  args: {
    pressed: false,
    disabled: false,
  },
  parameters: {
    layout: "centered",
  },
}
export const WithText: StoryObj = {
  render: (args) => {
    const [on, setOn] = React.useState(args.pressed)

    return (
      <Toggle
        aria-label="Toggle italic"
        pressed={on}
        onPressedChange={setOn}
        disabled={args.disabled}
        className="bg-white hover:bg-[#ddd]"
      >
        <Italic className="mr-2 h-4 w-4" />
        Italic
      </Toggle>
    )
  },
  args: {
    pressed: false,
    disabled: false,
  },
  parameters: {
    layout: "centered",
  },
}
export const WithSizeControl: StoryObj = {
  render: (args) => {
    const iconSizeMap = {
      sm: 16,
      md: 20,
      lg: 32,
    }

    const iconSize = iconSizeMap[args.size ?? "md"]

    return (
      <Toggle size={args.size} aria-label="Toggle italic">
        <Italic size={iconSize} />
      </Toggle>
    )
  },
  args: {
    size: "md",
  },
  argTypes: {
    size: {
      control: { type: "radio" },
      options: ["sm", "md", "lg"],
    },
  },
}
