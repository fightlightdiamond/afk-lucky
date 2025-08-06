import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import * as React from "react"



type SwitchDemoProps = {
  id: string
  label: string
  checked: boolean
  description: string
  disabled?: boolean
}

function SwitchDemo({ label, checked }: SwitchDemoProps) {
  const [enabled, setEnabled] = React.useState(checked)

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="airplane-mode"
        checked={enabled}
        onCheckedChange={setEnabled}
      />
      <Label htmlFor="airplane-mode">{label}</Label>
    </div>
  )
}

const meta: Meta<typeof SwitchDemo> = {
  title: "Shadcn UI/Switch",
  component: SwitchDemo,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      defaultValue: "Airplane Mode",
      description: "Nhãn hiển thị bên cạnh Switch",
    },
    checked: {
      control: "boolean",
      defaultValue: false,
      description: "Trạng thái bật/tắt ban đầu của Switch",
    },
  },
}

export default meta

type Story = StoryObj<typeof SwitchDemo>

export const Default: Story = {
  args: {
    label: "Airplane Mode",
    checked: false,
  },
}
export const Form: StoryObj = {
  render: (args) => {
    const [values, setValues] = React.useState(
      Object.fromEntries(args.fields.map((f) => [f.id, f.checked]))
    )

    const handleChange = (id: string, value: boolean) => {
      setValues((prev) => ({ ...prev, [id]: value }))
    }

    return (
      <form className="w-full space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-medium">Email Notifications</h3>
          <div className="space-y-4">
            {args.fields.map((field) => (
              <div
                key={field.id}
                className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"
              >
                <div className="space-y-0.5">
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <p className="text-sm text-muted-foreground">
                    {field.description}
                  </p>
                </div>
                <Switch
                  id={field.id}
                  checked={values[field.id]}
                  onCheckedChange={(val) => handleChange(field.id, val)}
                  disabled={field.disabled}
                />
              </div>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-black/80"
        >
          Submit
        </button>
      </form>
    )
  },
  args: {
    fields: [
      {
        id: "marketing-emails",
        label: "Marketing emails",
        description: "Receive emails about new products, features, and more.",
        checked: false,
      },
      {
        id: "security-emails",
        label: "Security emails",
        description: "Receive emails about your account security.",
        checked: true,
        disabled: true,
      },
    ],
  },
  argTypes: {
    fields: {
      control: { type: "object" }, // ✅ Cho phép thêm/sửa/xoá dễ hơn
      description: "Danh sách các mục switch",
    },
  },
  parameters: {
    layout: "centered",
  },
}

