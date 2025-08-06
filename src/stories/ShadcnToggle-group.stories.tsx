import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Bold, Italic, Underline } from "lucide-react"
import * as React from "react"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

type ToggleGroupDemoProps = {
  type: "single" | "multiple"
  variant?: "default" | "outline"
  disabledItems?: string[]
  value?: string
  values?: string[]
}

function ToggleGroupDemo({
  type = "multiple",
  variant = "outline",
  disabledItems = [],
  value,
  values,
  ...rest
}: ToggleGroupDemoProps & { updateArgs?: (args: Partial<ToggleGroupDemoProps>) => void }) {
  const isDisabled = (key: string) => disabledItems.includes(key)

  return (
    <ToggleGroup
      type={type}
      variant={variant}
      value={type === "single" ? value : values}
      onValueChange={(val) => {
        if (rest.updateArgs) {
          rest.updateArgs(type === "single" ? { value: val as string } : { values: val as string[] })
        }
      }}
      className={
        variant === "default"
          ? "bg-white border border-transparent shadow-none"
          : ""
      }
    >
      {["bold", "italic", "strikethrough"].map((item) => (
        <ToggleGroupItem
          key={item}
          value={item}
          aria-label={`Toggle ${item}`}
          disabled={isDisabled(item)}
          className={
            (type === "single" && value === item) ||
            (type === "multiple" && values?.includes(item))
              ? "bg-black text-white"
              : "hover:bg-[#ddd]"
          }
        >
          {item === "bold" && <Bold className="h-4 w-4" />}
          {item === "italic" && <Italic className="h-4 w-4" />}
          {item === "strikethrough" && <Underline className="h-4 w-4" />}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

const meta: Meta<typeof ToggleGroupDemo> = {
  title: "Shadcn UI/ToggleGroup",
  component: ToggleGroupDemo,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: { type: "radio" },
      options: ["single", "multiple"],
      description: "Kiểu chọn: đơn hoặc nhiều",
    },
    variant: {
      control: { type: "radio" },
      options: ["default", "outline"],
      description: "Kiểu hiển thị viền",
    },
    value: {
      control: "radio",
      options: ["", "bold", "italic", "strikethrough"],
      if: { arg: "type", eq: "single" },
      description: "Giá trị đang được chọn (cho single)",
    },
    values: {
      control: "check",
      options: ["bold", "italic", "strikethrough"],
      if: { arg: "type", eq: "multiple" },
      description: "Danh sách giá trị được chọn (cho multiple)",
    },
    disabledItems: {
      control: "check",
      options: ["bold", "italic", "strikethrough"],
      description: "Các nút toggle bị vô hiệu hoá",
    },
  },
}

export default meta

type Story = StoryObj<typeof ToggleGroupDemo>

export const Default: Story = {
  args: {
    type: "multiple",
    variant: "outline",
    values: [],
    disabledItems: [],
  },
}
