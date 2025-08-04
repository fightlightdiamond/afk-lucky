import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { createElement, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface InputOTPStoryArgs {
  maxLength: number;
  disabled: boolean;
  value: string;
  showSeparator: boolean;
  separatorPosition: number;
  labelText: string;
  descriptionText: string;
  errorText: string;
  submitButtonText: string;
  successText: string;
  placeholderText: string;
  buttonVariant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonSize: 'default' | 'sm' | 'lg' | 'icon';
  buttonClassName: string;
}

const meta: Meta<InputOTPStoryArgs> = {
  title: 'Shadcn UI/Input OTP',
  component: InputOTP,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    maxLength: {
      control: { type: 'number', min: 4, max: 12, step: 1 },
      description: 'Số lượng ô tối đa',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Vô hiệu hóa input',
    },
    value: {
      control: { type: 'text' },
      description: 'Giá trị hiện tại',
    },
    showSeparator: {
      control: { type: 'boolean' },
      description: 'Hiển thị dấu phân cách',
    },
    separatorPosition: {
      control: { type: 'number', min: 1, max: 10, step: 1 },
      description: 'Vị trí đặt dấu phân cách (từ trái)',
    },
    // Text customization controls
    labelText: {
      control: { type: 'text' },
      description: 'Nhãn của form',
    },
    descriptionText: {
      control: { type: 'text' },
      description: 'Mô tả hướng dẫn',
    },
    errorText: {
      control: { type: 'text' },
      description: 'Thông báo lỗi',
    },
    submitButtonText: {
      control: { type: 'text' },
      description: 'Text nút submit',
    },
    successText: {
      control: { type: 'text' },
      description: 'Thông báo thành công',
    },
    placeholderText: {
      control: { type: 'text' },
      description: 'Text placeholder/hướng dẫn',
    },
    buttonVariant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Kiểu nút submit',
    },
    buttonSize: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Kích thước nút submit',
    },
    buttonClassName: {
      control: { type: 'text' },
      description: 'CSS class tùy chỉnh cho nút',
    },
  },
  args: {
    maxLength: 6,
    disabled: false,
    value: '',
    showSeparator: true,
    separatorPosition: 3,
    labelText: 'Mã xác thực một lần',
    descriptionText: 'Vui lòng nhập mã xác thực được gửi đến điện thoại của bạn.',
    errorText: 'Mã xác thực phải có đủ {length} ký tự.',
    submitButtonText: 'Xác nhận',
    successText: 'Xác thực thành công!',
    placeholderText: 'Nhập mã {length} chữ số của bạn.',
    buttonVariant: 'default',
    buttonSize: 'default',
    buttonClassName: '',
    onChange: fn(),
    onComplete: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Configurable Default story
export const Default: Story = {
  args: {
    maxLength: 6,
    showSeparator: true,
    separatorPosition: 3,
  },
  render: (args) => {
    const slots = [];
    const groups = [];
    
    // Create slots based on maxLength
    for (let i = 0; i < args.maxLength; i++) {
      slots.push(createElement(InputOTPSlot, { key: i, index: i }));
    }
    
    if (args.showSeparator && args.separatorPosition < args.maxLength) {
      // Split into groups with separator
      const firstGroup = slots.slice(0, args.separatorPosition);
      const secondGroup = slots.slice(args.separatorPosition);
      
      groups.push(
        createElement(InputOTPGroup, { key: 'group1' }, ...firstGroup),
        createElement(InputOTPSeparator, { key: 'separator' }),
        createElement(InputOTPGroup, { key: 'group2' }, ...secondGroup)
      );
    } else {
      // Single group without separator
      groups.push(createElement(InputOTPGroup, { key: 'group1' }, ...slots));
    }
    
    return createElement(InputOTP, { 
      maxLength: args.maxLength,
      disabled: args.disabled,
      value: args.value,
      onChange: args.onChange,
      onComplete: args.onComplete
    }, ...groups);
  },
};

// Pattern with configurable length
export const Pattern: Story = {
  args: {
    maxLength: 6,
    showSeparator: false,
  },
  render: (args) => {
    const REGEXP_ONLY_DIGITS_AND_CHARS = /^[a-zA-Z0-9]+$/;
    const slots = [];
    
    for (let i = 0; i < args.maxLength; i++) {
      slots.push(createElement(InputOTPSlot, { key: i, index: i }));
    }
    
    return createElement(InputOTP, { 
      maxLength: args.maxLength, 
      pattern: REGEXP_ONLY_DIGITS_AND_CHARS,
      disabled: args.disabled
    },
      createElement(InputOTPGroup, null, ...slots)
    );
  },
};

// Controlled with configurable length
export const Controlled: Story = {
  args: {
    maxLength: 6,
    showSeparator: true,
    separatorPosition: 3,
    labelText: 'Mã xác thực',
    placeholderText: 'Nhập mã {length} chữ số của bạn.',
  },
  render: (args) => {
    const [value, setValue] = useState("");
    const slots = [];
    
    for (let i = 0; i < args.maxLength; i++) {
      slots.push(createElement(InputOTPSlot, { key: i, index: i }));
    }
    
    const groups = [];
    if (args.showSeparator && args.separatorPosition < args.maxLength) {
      const firstGroup = slots.slice(0, args.separatorPosition);
      const secondGroup = slots.slice(args.separatorPosition);
      
      groups.push(
        createElement(InputOTPGroup, { key: 'group1' }, ...firstGroup),
        createElement(InputOTPSeparator, { key: 'separator' }),
        createElement(InputOTPGroup, { key: 'group2' }, ...secondGroup)
      );
    } else {
      groups.push(createElement(InputOTPGroup, { key: 'group1' }, ...slots));
    }
    
    return createElement('div', { className: 'space-y-2' },
      createElement(InputOTP, {
        maxLength: args.maxLength,
        value: value,
        onChange: (value: string) => setValue(value),
        disabled: args.disabled
      }, ...groups),
      createElement('div', { className: 'text-center text-sm' },
        value === "" ? 
          args.placeholderText.replace('{length}', args.maxLength.toString()) : 
          `Bạn đã nhập: ${value}`
      )
    );
  },
};

// Preset configurations
export const FourDigits: Story = {
  args: {
    maxLength: 4,
    showSeparator: false,
  },
  render: (args) => {
    const slots = [];
    for (let i = 0; i < 4; i++) {
      slots.push(createElement(InputOTPSlot, { key: i, index: i }));
    }
    
    return createElement(InputOTP, { maxLength: 4 },
      createElement(InputOTPGroup, null, ...slots)
    );
  },
};

export const Disabled: Story = {
  args: {
    maxLength: 6,
    disabled: true,
    showSeparator: true,
    separatorPosition: 3,
  },
  render: (args) => {
    const slots = [];
    for (let i = 0; i < args.maxLength; i++) {
      slots.push(createElement(InputOTPSlot, { key: i, index: i }));
    }
    
    return createElement(InputOTP, { 
      maxLength: args.maxLength, 
      disabled: true 
    },
      createElement(InputOTPGroup, null, ...slots.slice(0, args.separatorPosition)),
      createElement(InputOTPSeparator),
      createElement(InputOTPGroup, null, ...slots.slice(args.separatorPosition))
    );
  },
};

export const WithDescription: Story = {
  args: {
    maxLength: 6,
    showSeparator: true,
    separatorPosition: 3,
    labelText: 'Xác minh số điện thoại',
    descriptionText: 'Chúng tôi đã gửi mã {length} chữ số đến số điện thoại của bạn',
    placeholderText: 'Không nhận được mã?',
    submitButtonText: 'Gửi lại',
  },
  render: (args) => {
    const slots = [];
    for (let i = 0; i < args.maxLength; i++) {
      slots.push(createElement(InputOTPSlot, { key: i, index: i }));
    }
    
    const groups = [];
    if (args.showSeparator && args.separatorPosition < args.maxLength) {
      const firstGroup = slots.slice(0, args.separatorPosition);
      const secondGroup = slots.slice(args.separatorPosition);
      
      groups.push(
        createElement(InputOTPGroup, { key: 'group1' }, ...firstGroup),
        createElement(InputOTPSeparator, { key: 'separator' }),
        createElement(InputOTPGroup, { key: 'group2' }, ...secondGroup)
      );
    } else {
      groups.push(createElement(InputOTPGroup, { key: 'group1' }, ...slots));
    }
    
    return createElement('div', { className: 'space-y-2' },
      createElement('div', { className: 'text-center' },
        createElement('h3', { className: 'text-lg font-medium' }, args.labelText),
        createElement('p', { className: 'text-sm text-muted-foreground' }, 
          args.descriptionText.replace('{length}', args.maxLength.toString())
        )
      ),
      createElement(InputOTP, { maxLength: args.maxLength }, ...groups),
      createElement('p', { className: 'text-center text-sm text-muted-foreground' },
        args.placeholderText + " ",
        createElement('button', { 
          className: 'font-medium text-primary hover:underline',
          type: 'button'
        }, args.submitButtonText)
      )
    );
  },
};

export const DigitsOnly: Story = {
  render: () => {
    const REGEXP_ONLY_DIGITS = /^[0-9]+$/;
    
    return createElement('div', { className: 'space-y-2' },
      createElement(InputOTP, { 
        maxLength: 6, 
        pattern: REGEXP_ONLY_DIGITS 
      },
        createElement(InputOTPGroup, null,
          createElement(InputOTPSlot, { index: 0 }),
          createElement(InputOTPSlot, { index: 1 }),
          createElement(InputOTPSlot, { index: 2 }),
          createElement(InputOTPSlot, { index: 3 }),
          createElement(InputOTPSlot, { index: 4 }),
          createElement(InputOTPSlot, { index: 5 })
        )
      ),
      createElement('p', { className: 'text-center text-sm text-muted-foreground' },
        'Only digits (0-9) are allowed'
      )
    );
  },
};

export const WithValidation: Story = {
  render: () => {
    const [value, setValue] = useState("");
    const [error, setError] = useState("");
    
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
    
    return createElement('div', { className: 'space-y-2' },
      createElement(InputOTP, {
        maxLength: 6,
        value: value,
        onChange: handleChange
      },
        createElement(InputOTPGroup, null,
          createElement(InputOTPSlot, { index: 0 }),
          createElement(InputOTPSlot, { index: 1 }),
          createElement(InputOTPSlot, { index: 2 }),
          createElement(InputOTPSlot, { index: 3 }),
          createElement(InputOTPSlot, { index: 4 }),
          createElement(InputOTPSlot, { index: 5 })
        )
      ),
      error && createElement('p', { className: 'text-center text-sm text-destructive' }, error),
      createElement('p', { className: 'text-center text-sm text-muted-foreground' },
        'Hint: Try entering 123456'
      )
    );
  },
};

export const FormExample: Story = {
  args: {
    maxLength: 6,
    showSeparator: false,
    labelText: 'Mã xác thực một lần',
    descriptionText: 'Vui lòng nhập mã xác thực được gửi đến điện thoại của bạn.',
    errorText: 'Mã xác thực phải có đủ {length} ký tự.',
    submitButtonText: 'Xác nhận',
    successText: 'Form đã được gửi thành công!',
    buttonVariant: 'default',
    buttonSize: 'lg',
    buttonClassName: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300',
  },
  render: (args) => {
    const [value, setValue] = useState("");
    const [error, setError] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (value.length < args.maxLength) {
        setError(args.errorText.replace('{length}', args.maxLength.toString()));
        return;
      }
      
      setError("");
      setIsSubmitted(true);
      
      setTimeout(() => {
        setIsSubmitted(false);
        setValue("");
      }, 2000);
    };
    
    const slots = [];
    for (let i = 0; i < args.maxLength; i++) {
      slots.push(createElement(InputOTPSlot, { key: i, index: i }));
    }
    
    return createElement('form', { 
      onSubmit: handleSubmit,
      className: 'w-2/3 space-y-6 max-w-md'
    },
      createElement('div', { className: 'space-y-2' },
        createElement(Label, { htmlFor: 'otp' }, args.labelText),
        createElement(InputOTP, {
          id: 'otp',
          maxLength: args.maxLength,
          value: value,
          onChange: (newValue: string) => {
            setValue(newValue);
            if (error) setError("");
          },
          disabled: args.disabled
        },
          createElement(InputOTPGroup, null, ...slots)
        ),
        createElement('p', { className: 'text-sm text-muted-foreground' },
          args.descriptionText
        ),
        error && createElement('p', { className: 'text-sm text-destructive' }, error)
      ),
      createElement(Button, { 
        type: 'submit',
        variant: args.buttonVariant,
        size: args.buttonSize,
        disabled: isSubmitted || args.disabled,
        className: `w-full ${args.buttonClassName}`,
      }, isSubmitted ? 'Đang gửi...' : args.submitButtonText),
      
      isSubmitted && createElement('div', { className: 'mt-4 p-4 bg-green-50 border border-green-200 rounded-md' },
        createElement('p', { className: 'text-sm text-green-800' },
          args.successText
        ),
        createElement('pre', { className: 'mt-2 text-xs bg-green-100 p-2 rounded' },
          createElement('code', null, JSON.stringify({ pin: value }, null, 2))
        )
      )
    );
  },
};

export const FormWithValidation: Story = {
  args: {
    maxLength: 6,
    showSeparator: false,
    labelText: 'Xác minh tài khoản',
    descriptionText: 'Nhập mã xác minh được gửi đến điện thoại của bạn',
    errorText: 'Mã xác thực phải có đủ {length} ký tự.',
    submitButtonText: 'Xác minh mã',
    successText: 'Xác minh thành công!',
    placeholderText: 'Vui lòng nhập mã xác thực được gửi đến điện thoại của bạn.',
    buttonVariant: 'default',
    buttonSize: 'lg',
    buttonClassName: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0',
  },
  render: (args) => {
    const [formData, setFormData] = useState({
      pin: "",
      errors: {} as Record<string, string>,
      isSubmitting: false,
      isSubmitted: false
    });
    
    const validatePin = (pin: string) => {
      const errors: Record<string, string> = {};
      
      if (pin.length === 0) {
        errors.pin = "Mã xác thực là bắt buộc.";
      } else if (pin.length < args.maxLength) {
        errors.pin = args.errorText.replace('{length}', args.maxLength.toString());
      } else if (!/^\d+$/.test(pin)) {
        errors.pin = "Mã xác thực chỉ được chứa các chữ số.";
      }
      
      return errors;
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const errors = validatePin(formData.pin);
      
      if (Object.keys(errors).length > 0) {
        setFormData(prev => ({ ...prev, errors }));
        return;
      }
      
      setFormData(prev => ({ ...prev, isSubmitting: true, errors: {} }));
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setFormData(prev => ({ 
        ...prev, 
        isSubmitting: false, 
        isSubmitted: true 
      }));
      
      setTimeout(() => {
        setFormData({
          pin: "",
          errors: {},
          isSubmitting: false,
          isSubmitted: false
        });
      }, 3000);
    };
    
    const handleChange = (newValue: string) => {
      setFormData(prev => ({
        ...prev,
        pin: newValue,
        errors: newValue.length === args.maxLength ? {} : prev.errors
      }));
    };
    
    const slots = [];
    for (let i = 0; i < args.maxLength; i++) {
      slots.push(createElement(InputOTPSlot, { key: i, index: i }));
    }
    
    // Dynamic button styling based on state
    const getButtonClassName = () => {
      if (formData.isSubmitted) {
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg';
      }
      if (formData.isSubmitting) {
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold shadow-lg animate-pulse';
      }
      return args.buttonClassName;
    };
    
    return createElement('div', { className: 'w-full max-w-md space-y-6' },
      createElement('div', { className: 'text-center space-y-2' },
        createElement('h2', { className: 'text-2xl font-bold' }, args.labelText),
        createElement('p', { className: 'text-muted-foreground' },
          args.descriptionText
        )
      ),
      
      createElement('form', { onSubmit: handleSubmit, className: 'space-y-6' },
        createElement('div', { className: 'space-y-2' },
          createElement(Label, { 
            htmlFor: 'pin-validation',
            className: 'text-sm font-medium'
          }, 'Mã xác thực một lần'),
          
          createElement('div', { className: 'flex justify-center' },
            createElement(InputOTP, {
              id: 'pin-validation',
              maxLength: args.maxLength,
              value: formData.pin,
              onChange: handleChange,
              disabled: formData.isSubmitting || formData.isSubmitted
            },
              createElement(InputOTPGroup, null, ...slots)
            )
          ),
          
          createElement('p', { className: 'text-xs text-muted-foreground text-center' },
            args.placeholderText
          ),
          
          formData.errors.pin && createElement('p', { 
            className: 'text-sm text-destructive text-center' 
          }, formData.errors.pin)
        ),
        
        createElement(Button, { 
          type: 'submit',
          variant: args.buttonVariant,
          size: args.buttonSize,
          disabled: formData.isSubmitting || formData.isSubmitted,
          className: `w-full ${getButtonClassName()}`,
        }, 
          formData.isSubmitting ? 'Đang xác minh...' : 
          formData.isSubmitted ? 'Đã xác minh!' : args.submitButtonText
        )
      ),
      
      formData.isSubmitted && createElement('div', { 
        className: 'p-4 bg-green-50 border border-green-200 rounded-lg' 
      },
        createElement('div', { className: 'flex items-center space-x-2' },
          createElement('div', { className: 'w-2 h-2 bg-green-500 rounded-full' }),
          createElement('p', { className: 'text-sm font-medium text-green-800' },
            args.successText
          )
        ),
        createElement('pre', { className: 'mt-2 text-xs bg-white p-2 rounded border' },
          createElement('code', { className: 'text-green-700' },
            JSON.stringify({ pin: formData.pin, timestamp: new Date().toISOString() }, null, 2)
          )
        )
      )
    );
  },
};

export const CustomButtonStyles: Story = {
  args: {
    maxLength: 6,
    showSeparator: false,
    labelText: 'Mã xác thực',
    submitButtonText: 'Xác minh ngay',
    buttonVariant: 'default',
    buttonSize: 'lg',
    buttonClassName: 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-500 border-0 rounded-xl',
  },
  render: (args) => {
    const [value, setValue] = useState("");
    
    const slots = [];
    for (let i = 0; i < args.maxLength; i++) {
      slots.push(createElement(InputOTPSlot, { key: i, index: i }));
    }
    
    return createElement('div', { className: 'space-y-6 max-w-md' },
      createElement('div', { className: 'text-center' },
        createElement('h3', { className: 'text-lg font-semibold' }, args.labelText)
      ),
      createElement(InputOTP, {
        maxLength: args.maxLength,
        value: value,
        onChange: setValue
      },
        createElement(InputOTPGroup, null, ...slots)
      ),
      createElement(Button, { 
        variant: args.buttonVariant,
        size: args.buttonSize,
        className: `w-full ${args.buttonClassName}`,
      }, args.submitButtonText)
    );
  },
};



