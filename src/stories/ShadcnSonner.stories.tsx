import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import * as React from "react"

// Component nhận props từ Storybook controls
type SonnerDemoProps = {
  buttonText: string
  toastTitle: string
  toastDescription?: string
  actionLabel?: string
}

function SonnerDemo({
  buttonText,
  toastTitle,
  toastDescription,
  actionLabel,
}: SonnerDemoProps) {
  return (
    <>
      <Toaster position="top-center" />
      <Button
        variant="outline"
        onClick={() =>
          toast(toastTitle, {
            description: toastDescription,
            action: actionLabel
              ? {
                  label: actionLabel,
                  onClick: () => console.log("Undo clicked"),
                }
              : undefined,
          })
        }
      >
        {buttonText}
      </Button>
    </>
  )
}

// Metadata Storybook
const meta: Meta<typeof SonnerDemo> = {
  title: "Shadcn UI/Sonner",
  component: SonnerDemo,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    buttonText: {
      control: "text",
      defaultValue: "Show Toast",
    },
    toastTitle: {
      control: "text",
      defaultValue: "Event has been created",
    },
    toastDescription: {
      control: "text",
      defaultValue: "Sunday, December 03, 2023 at 9:00 AM",
    },
    actionLabel: {
      control: "text",
      defaultValue: "Undo",
    },
  },
}

export default meta

type Story = StoryObj<typeof SonnerDemo>

export const Default: Story = {
  args: {
    buttonText: "Show Toast",
    toastTitle: "Event has been created",
    toastDescription: "Sunday, December 03, 2023 at 9:00 AM",
    actionLabel: "Undo",
  },
}
