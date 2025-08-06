import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"


import * as React from "react"

type TextareaDemoProps = {
  placeholder: string
  disabled?: boolean
  rows?: number
}

function TextareaDemo({ placeholder, disabled = false, rows = 3 }: TextareaDemoProps) {
  return (
    <Textarea
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
    />
  )
}

const meta: Meta<typeof TextareaDemo> = {
  title: "Shadcn UI/Textarea",
  component: TextareaDemo,
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
      defaultValue: "Type your message here.",
      description: "Placeholder hiển thị trong ô nhập",
    },
    disabled: {
      control: "boolean",
      defaultValue: false,
      description: "Vô hiệu hoá textarea nếu true",
    },
    rows: {
      control: { type: "number", min: 1, max: 10 },
      defaultValue: 3,
      description: "Số dòng hiển thị mặc định",
    },
  },
  parameters: {
    layout: "centered",
  },
}

export default meta

type Story = StoryObj<typeof TextareaDemo>

export const Default: Story = {
  args: {
    placeholder: "Type your message here.",
    disabled: false,
    rows: 3,
  },
}

export const WithLabel: StoryObj = {
  render: (args) => {
    return (
      <div className="grid w-[430px] gap-3">
        <Label htmlFor="message">{args.label}</Label>
        <Textarea
          id="message"
          placeholder={args.placeholder}
          disabled={args.disabled}
          rows={args.rows}
        />
      </div>
    )
  },
  args: {
    label: "Your message",
    placeholder: "Type your message here.",
    disabled: false,
    rows: 3,
  },
  argTypes: {
    label: {
      control: "text",
      description: "Nhãn hiển thị phía trên Textarea",
    },
    placeholder: {
      control: "text",
      description: "Placeholder hiển thị trong ô nhập",
    },
    disabled: {
      control: "boolean",
      description: "Vô hiệu hoá textarea nếu true",
    },
    rows: {
      control: { type: "number", min: 1, max: 10 },
      description: "Số dòng hiển thị mặc định",
    },
  },
  parameters: {
    layout: "centered",
  },
}

export const WithButton: StoryObj = {
  render: (args) => {
    return (
      <div className="grid w-[430px] gap-2">
        <Textarea
          placeholder={args.placeholder}
          disabled={args.disabled}
          rows={args.rows}
        />
        <Button  className="bg-black text-white" disabled={args.buttonDisabled}>{args.buttonLabel}</Button>
      </div>
    )
  },
  args: {
    placeholder: "Type your message here.",
    disabled: false,
    rows: 3,
    buttonLabel: "Send message",
    buttonDisabled: false,
  },
  argTypes: {
    placeholder: {
      control: "text",
      description: "Nội dung placeholder trong textarea",
    },
    disabled: {
      control: "boolean",
      description: "Vô hiệu hoá textarea",
    },
    rows: {
      control: { type: "number", min: 1, max: 10 },
      description: "Số dòng hiển thị của textarea",
    },
    buttonLabel: {
      control: "text",
      description: "Nội dung hiển thị trên nút",
    },
    buttonDisabled: {
      control: "boolean",
      description: "Vô hiệu hoá nút gửi nếu true",
    },
  },
  parameters: {
    layout: "centered",
  },
}

export const Form: StoryObj = {
  render: (args) => {
    const [value, setValue] = React.useState("")

    return (
      <form className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          <Label htmlFor="bio">{args.label}</Label>
          <Textarea
            id="bio"
            placeholder={args.placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="resize-none"
            rows={args.rows}
            disabled={args.disabled}
          />
          <p className="text-sm text-muted-foreground">{args.description}</p>
        </div>
        <Button className="bg-black text-white" type="submit" disabled={args.disabled}>
          {args.buttonLabel}
        </Button>
      </form>
    )
  },
  args: {
    label: "Bio",
    placeholder: "Tell us a little bit about yourself",
    description: "You can @mention other users and organizations.",
    buttonLabel: "Submit",
    disabled: false,
    rows: 4,
  },
  argTypes: {
    label: { control: "text", description: "Nhãn phía trên textarea" },
    placeholder: { control: "text", description: "Gợi ý trong ô nhập" },
    description: { control: "text", description: "Mô tả phụ dưới textarea" },
    buttonLabel: { control: "text", description: "Nội dung nút" },
    disabled: { control: "boolean", description: "Vô hiệu hoá toàn bộ form" },
    rows: {
      control: { type: "number", min: 1, max: 10 },
      description: "Số dòng của textarea",
    },
  },
  parameters: {
    layout: "centered",
  },
}
