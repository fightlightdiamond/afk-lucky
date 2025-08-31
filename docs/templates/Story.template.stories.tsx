import type { Meta, StoryObj } from "@storybook/react";
import { ComponentName } from "./ComponentName";

const meta: Meta<typeof ComponentName> = {
  title: "Domain/ComponentName",
  component: ComponentName,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Brief description of the component and its purpose.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    // Define arg types for controls
    variant: {
      control: { type: "select" },
      options: ["default", "primary", "secondary"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    // Default args
  },
};

// Variant stories
export const Primary: Story = {
  args: {
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
};

// State stories
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

// Interactive story
export const Interactive: Story = {
  args: {
    onClick: () => alert("Clicked!"),
  },
};
