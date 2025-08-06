import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { createElement } from 'react';
import * as React from 'react';

const meta: Meta<typeof Select> = {
  title: 'Shadcn UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text',
    },
    label: {
      control: { type: 'text' },
      description: 'Group label',
    },
    options: {
      control: { type: 'text' },
      description: 'Options (format: value1:label1,value2:label2)',
    },
    width: {
      control: { type: 'select' },
      options: ['w-[120px]', 'w-[180px]', 'w-[240px]', 'w-[300px]'],
      description: 'Select width',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable select',
    },
  },
  args: {
    placeholder: 'Select a fruit',
    label: 'Fruits',
    options: 'apple:Apple,banana:Banana,blueberry:Blueberry,grapes:Grapes,pineapple:Pineapple',
    width: 'w-[180px]',
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const optionsList = args.options 
      ? args.options.split(',').map(option => {
          const [value, label] = option.trim().split(':');
          return { value: value?.trim(), label: label?.trim() || value?.trim() };
        }).filter(option => option.value)
      : [];

    return createElement(Select, { disabled: args.disabled },
      createElement(SelectTrigger, { className: args.width },
        createElement(SelectValue, { placeholder: args.placeholder })
      ),
      createElement(SelectContent, {className: 'bg-white'},
        createElement(SelectGroup, null,
          args.label && createElement(SelectLabel, null, args.label),
          ...optionsList.map(option =>
            createElement(SelectItem, { key: option.value, value: option.value }, option.label)
          )
        )
      )
    );
  },
};

export const Scrollable: Story = {
  render: () => {
    return createElement(Select, null,
      createElement(SelectTrigger, { className: 'w-[280px]' },
        createElement(SelectValue, { placeholder: 'Select a timezone' })
      ),
      createElement(SelectContent, null,
        createElement(SelectGroup, null,
          createElement(SelectLabel, null, 'North America'),
          createElement(SelectItem, { value: 'est' }, 'Eastern Standard Time (EST)'),
          createElement(SelectItem, { value: 'cst' }, 'Central Standard Time (CST)'),
          createElement(SelectItem, { value: 'mst' }, 'Mountain Standard Time (MST)'),
          createElement(SelectItem, { value: 'pst' }, 'Pacific Standard Time (PST)'),
          createElement(SelectItem, { value: 'akst' }, 'Alaska Standard Time (AKST)'),
          createElement(SelectItem, { value: 'hst' }, 'Hawaii Standard Time (HST)')
        ),
        createElement(SelectGroup, null,
          createElement(SelectLabel, null, 'Europe & Africa'),
          createElement(SelectItem, { value: 'gmt' }, 'Greenwich Mean Time (GMT)'),
          createElement(SelectItem, { value: 'cet' }, 'Central European Time (CET)'),
          createElement(SelectItem, { value: 'eet' }, 'Eastern European Time (EET)'),
          createElement(SelectItem, { value: 'west' }, 'Western European Summer Time (WEST)'),
          createElement(SelectItem, { value: 'cat' }, 'Central Africa Time (CAT)'),
          createElement(SelectItem, { value: 'eat' }, 'East Africa Time (EAT)')
        ),
        createElement(SelectGroup, null,
          createElement(SelectLabel, null, 'Asia'),
          createElement(SelectItem, { value: 'msk' }, 'Moscow Time (MSK)'),
          createElement(SelectItem, { value: 'ist' }, 'India Standard Time (IST)'),
          createElement(SelectItem, { value: 'cst_china' }, 'China Standard Time (CST)'),
          createElement(SelectItem, { value: 'jst' }, 'Japan Standard Time (JST)'),
          createElement(SelectItem, { value: 'kst' }, 'Korea Standard Time (KST)'),
          createElement(SelectItem, { value: 'ist_indonesia' }, 'Indonesia Central Standard Time (WITA)')
        ),
        createElement(SelectGroup, null,
          createElement(SelectLabel, null, 'Australia & Pacific'),
          createElement(SelectItem, { value: 'awst' }, 'Australian Western Standard Time (AWST)'),
          createElement(SelectItem, { value: 'acst' }, 'Australian Central Standard Time (ACST)'),
          createElement(SelectItem, { value: 'aest' }, 'Australian Eastern Standard Time (AEST)'),
          createElement(SelectItem, { value: 'nzst' }, 'New Zealand Standard Time (NZST)'),
          createElement(SelectItem, { value: 'fjt' }, 'Fiji Time (FJT)')
        ),
        createElement(SelectGroup, null,
          createElement(SelectLabel, null, 'South America'),
          createElement(SelectItem, { value: 'art' }, 'Argentina Time (ART)'),
          createElement(SelectItem, { value: 'bot' }, 'Bolivia Time (BOT)'),
          createElement(SelectItem, { value: 'brt' }, 'Brasilia Time (BRT)'),
          createElement(SelectItem, { value: 'clt' }, 'Chile Standard Time (CLT)')
        )
      )
    );
  },
};

export const Form: Story = {
  args: {
    formTitle: 'Email',
    formOptions: 'm@example.com,m@google.com,m@support.com',
    formDescription: 'You can manage email addresses in your email settings.',
    buttonText: 'Submit',
    buttonColor: 'bg-black text-white',
    optionsSeparator: ',',
    placeholder: 'Select a verified email to display',
  },
  argTypes: {
    formTitle: {
      control: { type: 'text' },
      description: 'Form field label'
    },
    formOptions: {
      control: { type: 'text' },
      description: 'Email options (comma separated, e.g: "user1@example.com,user2@gmail.com")'
    },
    optionsSeparator: {
      control: { type: 'text' },
      description: 'Separator for options (default: comma)'
    },
    formDescription: {
      control: { type: 'text' },
      description: 'Form description text'
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Select placeholder text'
    },
    buttonText: {
      control: { type: 'text' },
      description: 'Submit button text'
    },
    buttonColor: {
      control: { type: 'text' },
      description: 'Button CSS classes'
    },
  },
  render: (args) => {
    const [selectedValue, setSelectedValue] = React.useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert(`You submitted: ${selectedValue}`);
    };

    const optionsList = args.formOptions 
      ? args.formOptions.split(args.optionsSeparator).map(option => option.trim()).filter(option => option.length > 0)
      : [];

    return createElement('form', { 
      onSubmit: handleSubmit, 
      className: 'w-2/3 space-y-6 max-w-md' 
    },
      createElement('div', { className: 'space-y-2' },
        createElement(Label, { htmlFor: 'email' }, args.formTitle),
        createElement(Select, {
          value: selectedValue,
          onValueChange: setSelectedValue
        },
          createElement(SelectTrigger, { id: 'email' },
            createElement(SelectValue, { placeholder: args.placeholder })
          ),
          createElement(SelectContent, {className: 'bg-white'},
            ...optionsList.map(option =>
              createElement(SelectItem, { key: option, value: option }, option)
            )
          )
        ),
        createElement('p', { className: 'text-sm text-muted-foreground' },
          args.formDescription
        )
      ),
      createElement(Button, { 
        type: 'submit',
        className: args.buttonColor
      }, args.buttonText)
    );
  },
};




