import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type AccordionDemoProps = {
  title1: string
  content1: string
  title2: string
  content2: string
  title3: string
  content3: string
  disabledItems?: string[] // new
}

function AccordionDemo({
  title1,
  content1,
  title2,
  content2,
  title3,
  content3,
  disabledItems = [],
}: AccordionDemoProps) {
  const isDisabled = (key: string) => disabledItems.includes(key)

  return (
    <Accordion type="single" collapsible className="w-[600px]" defaultValue="item-1">
      <AccordionItem value="item-1" disabled={isDisabled("item-1")}>
        <AccordionTrigger>{title1}</AccordionTrigger>
        <AccordionContent>{content1}</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" disabled={isDisabled("item-2")}>
        <AccordionTrigger>{title2}</AccordionTrigger>
        <AccordionContent>{content2}</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3" disabled={isDisabled("item-3")}>
        <AccordionTrigger>{title3}</AccordionTrigger>
        <AccordionContent>{content3}</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

const meta: Meta<typeof AccordionDemo> = {
  title: "Shadcn UI/Accordion",
  component: AccordionDemo,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    title1: {
      control: "text",
      description: "Tiêu đề mục 1",
    },
    content1: {
      control: "text",
      description: "Nội dung mục 1",
    },
    title2: {
      control: "text",
      description: "Tiêu đề mục 2",
    },
    content2: {
      control: "text",
      description: "Nội dung mục 2",
    },
    title3: {
      control: "text",
      description: "Tiêu đề mục 3",
    },
    content3: {
      control: "text",
      description: "Nội dung mục 3",
    },
    disabledItems: {
      control: { type: "check" },
      options: ["item-1", "item-2", "item-3"],
      description: "Chọn mục Accordion bị vô hiệu hoá",
    },
  },
}

export default meta

type Story = StoryObj<typeof AccordionDemo>

export const Default: Story = {
  args: {
    title1: "Product Information",
    content1:
      "Our flagship product combines cutting-edge technology with sleek design. Built with premium materials.",
    title2: "Shipping Details",
    content2:
      "We offer worldwide shipping through trusted courier partners. Delivery takes 3-5 business days.",
    title3: "Return Policy",
    content3:
      "30-day return policy. Return the item in original condition for a full refund.",
    disabledItems: [],
  },
}
