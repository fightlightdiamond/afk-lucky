import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof InputOTP> = {
  title: 'shadcn/InputOTP',
  component: InputOTP,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    maxLength: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Maximum number of characters',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
  },
  args: {
    maxLength: 6,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic example
export const Default: Story = {
  args: {
    maxLength: 6,
    disabled: false,
  },
  render: (args) => {
    return (
      <InputOTP maxLength={args.maxLength} disabled={args.disabled}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    );
  },
};

// Pattern validation
export const Pattern: Story = {
  args: {
    maxLength: 6,
    disabled: false,
  },
  render: (args) => {
    const REGEXP_ONLY_DIGITS = /^[0-9]+$/;
    
    return (
      <div className="space-y-2">
        <InputOTP 
          maxLength={args.maxLength} 
          pattern={REGEXP_ONLY_DIGITS.source}
          disabled={args.disabled}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <p className="text-center text-sm text-muted-foreground">
          Only digits (0-9) are allowed
        </p>
      </div>
    );
  },
};

// Separator example
export const Separator: Story = {
  args: {
    maxLength: 6,
    disabled: false,
  },
  render: (args) => {
    return (
      <InputOTP maxLength={args.maxLength} disabled={args.disabled}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    );
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    maxLength: 4,
    disabled: true,
  },
  render: (args) => {
    return (
      <InputOTP maxLength={args.maxLength} disabled={args.disabled}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
    );
  },
};

// Wrapper component for validation story
const ValidationWrapper = () => {
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState("");
  
  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (newValue.length === 6) {
      if (newValue === "123456") {
        setError("");
      } else {
        setError("Invalid code. Try 123456");
      }
    } else {
      setError("");
    }
  };
  
  return (
    <div className="space-y-2">
      <InputOTP
        maxLength={6}
        value={value}
        onChange={handleChange}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

// Interactive with validation
export const WithValidation: Story = {
  args: {
    maxLength: 6,
  },
  render: () => <ValidationWrapper />,
};

// Wrapper component for form integration story
const FormIntegrationWrapper = () => {
  const [value, setValue] = React.useState("");
  
  return (
    <div className="space-y-4">
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp">Enter verification code</Label>
          <InputOTP
            id="otp"
            maxLength={4}
            value={value}
            onChange={setValue}
            disabled={false}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button type="submit" disabled={value.length !== 4}>
          Verify
        </Button>
      </form>
    </div>
  );
};

// Form integration example
export const FormIntegration: Story = {
  args: {
    maxLength: 4,
  },
  render: () => <FormIntegrationWrapper />,
};

// Wrapper component for two-factor auth story
const TwoFactorAuthWrapper = () => {
  const [value, setValue] = React.useState("");
  
  return (
    <div className="max-w-md mx-auto space-y-6 p-6 border rounded-lg">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
        <p className="text-sm text-gray-600">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>
      <div className="space-y-4">
        <InputOTP
          id="two-factor-code"
          maxLength={6}
          value={value}
          onChange={setValue}
          disabled={false}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <div className="flex gap-2">
          <Button className="flex-1" variant="outline">
            Resend Code
          </Button>
          <Button className="flex-1" disabled={value.length !== 6}>
            Verify
          </Button>
        </div>
      </div>
    </div>
  );
};

// Two-factor authentication example
export const TwoFactorAuth: Story = {
  args: {
    maxLength: 6,
  },
  render: () => <TwoFactorAuthWrapper />,
};
