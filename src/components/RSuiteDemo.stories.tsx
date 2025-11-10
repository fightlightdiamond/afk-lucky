import type { Meta, StoryObj } from "@storybook/react";
import RSuiteDemo from "./RSuiteDemo";

const meta = {
  title: "Components/RSuiteDemo",
  component: RSuiteDemo,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RSuiteDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
