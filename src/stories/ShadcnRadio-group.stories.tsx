import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import * as React from "react"
import { Label } from "@/components/ui/label"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"

// Wrapper component for interactive demos
function RadioGroupWrapper(props: {
  defaultValue?: string;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  showLabels?: boolean;
  options?: string;
  spacing?: string;
}) {
  const [value, setValue] = React.useState(props.defaultValue || "");
  const containerClass = props.orientation === 'horizontal' 
    ? `flex flex-row ${props.spacing || 'gap-3'}` 
    : `flex flex-col ${props.spacing || 'gap-3'}`;

  const optionsList = props.options 
    ? props.options.split(',').map(option => option.trim()).filter(option => option.length > 0)
    : ['default', 'comfortable', 'compact'];

  return (
    <RadioGroup value={value} onValueChange={setValue} className={containerClass} disabled={props.disabled}>
      {optionsList.map((option, index) => (
        <div key={option} className="flex items-center gap-3">
          <RadioGroupItem value={option.toLowerCase()} id={`r${index + 1}`} />
          {props.showLabels && <Label htmlFor={`r${index + 1}`}>{option}</Label>}
        </div>
      ))}
    </RadioGroup>
  );
}

const meta: Meta<typeof RadioGroupWrapper> = {
  title: 'Shadcn UI/RadioGroup',
  component: RadioGroupWrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    defaultValue: {
      control: { type: 'text' },
      description: 'Default selected value'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable all radio items'
    },
    orientation: {
      control: { type: 'select' },
      options: ['vertical', 'horizontal'],
      description: 'Layout orientation'
    },
    showLabels: {
      control: { type: 'boolean' },
      description: 'Show/hide labels'
    },
    options: {
      control: { type: 'text' },
      description: 'Radio options (comma separated, e.g: "default,comfortable,compact,extra,premium")'
    },
    spacing: {
      control: { type: 'select' },
      options: ['gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-6'],
      description: 'Gap between items'
    },
  },
  args: {
    defaultValue: 'comfortable',
    disabled: false,
    orientation: 'vertical',
    showLabels: true,
    options: 'default,comfortable,compact',
    spacing: 'gap-3',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const InteractiveDemo: Story = {};

export const Default: Story = {};

// Form wrapper component
function FormRadioGroupWrapper() {
  const [selectedValue, setSelectedValue] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`You selected: ${selectedValue}`);
  };

  const options = ['All new messages', 'Direct messages and mentions', 'Nothing'];

  return (
    <form onSubmit={handleSubmit} className="w-2/3 space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Notify me about...</Label>
        <RadioGroup
          value={selectedValue}
          onValueChange={setSelectedValue}
          className="flex flex-col"
        >
          {options.map((option, index) => (
            <div key={option} className="flex items-center gap-3">
              <RadioGroupItem value={option.toLowerCase().replace(/\s+/g, '-')} id={`form-${index}`} />
              <Label htmlFor={`form-${index}`} className="font-normal">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <Button className="bg-black text-white" type="submit">Submit</Button>
    </form>
  );
}

export const Form: Story = {
  render: () => <FormRadioGroupWrapper />,
};





