import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createElement } from 'react';

type SheetStoryArgs = {
  // Default story controls
  title: string;
  description: string;
  triggerText: string;
  submitText: string;
  closeText: string;
  side: 'top' | 'right' | 'bottom' | 'left';
  
  // Form fields
  formFields: string;
  fieldSeparator: string;
  
  // Field customization
  field1Label: string;
  field1Value: string;
  field2Label: string;
  field2Value: string;
  field3Label: string;
  field3Value: string;
  field4Label: string;
  field4Value: string;
  field5Label: string;
  field5Value: string;
};

const meta: Meta<SheetStoryArgs> = {
  title: 'Shadcn UI/Sheet',
  component: Sheet,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Basic controls
    title: { control: 'text', description: 'Sheet title' },
    description: { control: 'text', description: 'Sheet description' },
    triggerText: { control: 'text', description: 'Trigger button text' },
    submitText: { control: 'text', description: 'Submit button text' },
    closeText: { control: 'text', description: 'Close button text' },
    side: {
      control: { type: 'select' },
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Side from which the sheet slides in',
    },
    
    // Form fields
    formFields: { 
      control: 'text', 
      description: 'Form fields (comma separated, e.g., "Name,Username,Email")' 
    },
    fieldSeparator: { control: 'text', description: 'Field separator character' },
    
    // Individual field controls
    field1Label: { control: 'text', description: 'Field 1 label', table: { category: 'Field Customization' } },
    field1Value: { control: 'text', description: 'Field 1 default value', table: { category: 'Field Customization' } },
    field2Label: { control: 'text', description: 'Field 2 label', table: { category: 'Field Customization' } },
    field2Value: { control: 'text', description: 'Field 2 default value', table: { category: 'Field Customization' } },
    field3Label: { control: 'text', description: 'Field 3 label', table: { category: 'Field Customization' } },
    field3Value: { control: 'text', description: 'Field 3 default value', table: { category: 'Field Customization' } },
    field4Label: { control: 'text', description: 'Field 4 label', table: { category: 'Field Customization' } },
    field4Value: { control: 'text', description: 'Field 4 default value', table: { category: 'Field Customization' } },
    field5Label: { control: 'text', description: 'Field 5 label', table: { category: 'Field Customization' } },
    field5Value: { control: 'text', description: 'Field 5 default value', table: { category: 'Field Customization' } },
  },
  args: {
    onOpenChange: fn(),
  },
};

export default meta;
type Story = StoryObj<SheetStoryArgs>;

export const Default: Story = {
  args: {
    title: 'Edit profile',
    description: "Make changes to your profile here. Click save when you're done.",
    triggerText: 'Open',
    submitText: 'Save changes',
    closeText: 'Close',
    side: 'right',
    formFields: 'Name,Username',
    fieldSeparator: ',',
    field1Label: 'Name',
    field1Value: 'Pedro Duarte',
    field2Label: 'Username',
    field2Value: '@peduarte',
    field3Label: '',
    field3Value: '',
    field4Label: '',
    field4Value: '',
    field5Label: '',
    field5Value: '',
  },
  render: (args) => {
    const fieldsList = args.formFields 
      ? args.formFields.split(args.fieldSeparator).map(field => field.trim()).filter(field => field.length > 0)
      : [];

    const fieldData = [
      { label: args.field1Label, value: args.field1Value },
      { label: args.field2Label, value: args.field2Value },
      { label: args.field3Label, value: args.field3Value },
      { label: args.field4Label, value: args.field4Value },
      { label: args.field5Label, value: args.field5Value },
    ].filter(field => field.label.length > 0);

    const finalFields = fieldsList.length > 0 
      ? fieldsList.map((field, index) => ({
          label: fieldData[index]?.label || field,
          value: fieldData[index]?.value || '',
        }))
      : fieldData;

    return createElement(Sheet, null,
      createElement(SheetTrigger, { asChild: true },
        createElement(Button, { variant: 'outline' }, args.triggerText)
      ),
      createElement(SheetContent, { side: args.side , className: 'bg-white' },
        createElement(SheetHeader, null,
          createElement(SheetTitle, null, args.title),
          createElement(SheetDescription, null, args.description)
        ),
        createElement('div', { className: 'grid flex-1 auto-rows-min gap-6 px-4' },
          ...finalFields.map((field, index) =>
            createElement('div', { key: index, className: 'grid gap-3' },
              createElement(Label, { htmlFor: `field-${index}` }, field.label),
              createElement(Input, { 
                id: `field-${index}`, 
                defaultValue: field.value,
                placeholder: `Enter ${field.label.toLowerCase()}...`
              })
            )
          )
        ),
        createElement(SheetFooter, null,
          createElement(Button, { type: 'submit', className: 'bg-black text-white' }, args.submitText),
          createElement(SheetClose, { asChild: true },
            createElement(Button, { variant: 'outline' }, args.closeText)
          )
        )
      )
    );
  },
};

export const LeftSide: Story = {
  args: {
    title: 'Settings',
    description: 'Configure your application settings.',
    triggerText: 'Open Left',
    submitText: 'Apply',
    closeText: 'Cancel',
    side: 'left',
    formFields: 'Theme,Language,Timezone',
    fieldSeparator: ',',
    field1Label: 'Theme',
    field1Value: 'Dark',
    field2Label: 'Language',
    field2Value: 'English',
    field3Label: 'Timezone',
    field3Value: 'UTC+7',
    field4Label: '',
    field4Value: '',
    field5Label: '',
    field5Value: '',
  },
  render: (args) => {
    const fieldsList = args.formFields 
      ? args.formFields.split(args.fieldSeparator).map(field => field.trim()).filter(field => field.length > 0)
      : [];

    const fieldData = [
      { label: args.field1Label, value: args.field1Value },
      { label: args.field2Label, value: args.field2Value },
      { label: args.field3Label, value: args.field3Value },
      { label: args.field4Label, value: args.field4Value },
      { label: args.field5Label, value: args.field5Value },
    ].filter(field => field.label.length > 0);

    const finalFields = fieldsList.length > 0 
      ? fieldsList.map((field, index) => ({
          label: fieldData[index]?.label || field,
          value: fieldData[index]?.value || '',
        }))
      : fieldData;

    return createElement(Sheet, null,
      createElement(SheetTrigger, { asChild: true },
        createElement(Button, { variant: 'outline' }, args.triggerText)
      ),
      createElement(SheetContent, { side: args.side, className: 'bg-white'  },
        createElement(SheetHeader, null,
          createElement(SheetTitle, null, args.title),
          createElement(SheetDescription, null, args.description)
        ),
        createElement('div', { className: 'grid flex-1 auto-rows-min gap-6 px-4' },
          ...finalFields.map((field, index) =>
            createElement('div', { key: index, className: 'grid gap-3' },
              createElement(Label, { htmlFor: `left-field-${index}` }, field.label),
              createElement(Input, { 
                id: `left-field-${index}`, 
                defaultValue: field.value,
                placeholder: `Enter ${field.label.toLowerCase()}...`
              })
            )
          )
        ),
        createElement(SheetFooter, null,
          createElement(Button, { className: 'bg-black text-white' }, args.submitText),
          createElement(SheetClose, { asChild: true },
            createElement(Button, { variant: 'outline' }, args.closeText)
          )
        )
      )
    );
  },
};

export const TopSide: Story = {
  args: {
    title: 'Notifications',
    description: 'Manage your notification preferences.',
    triggerText: 'Open Top',
    submitText: 'Save',
    closeText: 'Close',
    side: 'top',
    formFields: 'Email Notifications,Push Notifications',
    fieldSeparator: ',',
    field1Label: 'Email Notifications',
    field1Value: 'Enabled',
    field2Label: 'Push Notifications',
    field2Value: 'Disabled',
    field3Label: '',
    field3Value: '',
    field4Label: '',
    field4Value: '',
    field5Label: '',
    field5Value: '',
  },
  render: (args) => {
    const fieldsList = args.formFields 
      ? args.formFields.split(args.fieldSeparator).map(field => field.trim()).filter(field => field.length > 0)
      : [];

    const fieldData = [
      { label: args.field1Label, value: args.field1Value },
      { label: args.field2Label, value: args.field2Value },
      { label: args.field3Label, value: args.field3Value },
      { label: args.field4Label, value: args.field4Value },
      { label: args.field5Label, value: args.field5Value },
    ].filter(field => field.label.length > 0);

    const finalFields = fieldsList.length > 0 
      ? fieldsList.map((field, index) => ({
          label: fieldData[index]?.label || field,
          value: fieldData[index]?.value || '',
        }))
      : fieldData;

    return createElement(Sheet, null,
      createElement(SheetTrigger, { asChild: true },
        createElement(Button, { variant: 'outline' }, args.triggerText)
      ),
      createElement(SheetContent, { side: args.side, className: 'bg-white'  },
        createElement(SheetHeader, null,
          createElement(SheetTitle, null, args.title),
          createElement(SheetDescription, null, args.description)
        ),
        createElement('div', { className: 'grid flex-1 auto-rows-min gap-6 px-4' },
          ...finalFields.map((field, index) =>
            createElement('div', { key: index, className: 'grid gap-3' },
              createElement(Label, { htmlFor: `top-field-${index}` }, field.label),
              createElement(Input, { 
                id: `top-field-${index}`, 
                defaultValue: field.value,
                placeholder: `Enter ${field.label.toLowerCase()}...`
              })
            )
          )
        ),
        createElement(SheetFooter, null,
          createElement(Button, { className: 'bg-black text-white' }, args.submitText),
          createElement(SheetClose, { asChild: true },
            createElement(Button, { variant: 'outline' }, args.closeText)
          )
        )
      )
    );
  },
};

export const BottomSide: Story = {
  args: {
    title: 'Quick Actions',
    description: 'Perform quick actions from here.',
    triggerText: 'Open Bottom',
    submitText: 'Execute',
    closeText: 'Cancel',
    side: 'bottom',
    formFields: 'Action,Priority,Notes',
    fieldSeparator: ',',
    field1Label: 'Action',
    field1Value: '',
    field2Label: 'Priority',
    field2Value: 'Medium',
    field3Label: 'Notes',
    field3Value: '',
    field4Label: '',
    field4Value: '',
    field5Label: '',
    field5Value: '',
  },
  render: (args) => {
    const fieldsList = args.formFields 
      ? args.formFields.split(args.fieldSeparator).map(field => field.trim()).filter(field => field.length > 0)
      : [];

    const fieldData = [
      { label: args.field1Label, value: args.field1Value },
      { label: args.field2Label, value: args.field2Value },
      { label: args.field3Label, value: args.field3Value },
      { label: args.field4Label, value: args.field4Value },
      { label: args.field5Label, value: args.field5Value },
    ].filter(field => field.label.length > 0);

    const finalFields = fieldsList.length > 0 
      ? fieldsList.map((field, index) => ({
          label: fieldData[index]?.label || field,
          value: fieldData[index]?.value || '',
        }))
      : fieldData;

    return createElement(Sheet, null,
      createElement(SheetTrigger, { asChild: true },
        createElement(Button, { variant: 'outline' }, args.triggerText)
      ),
      createElement(SheetContent, { side: args.side, className: 'bg-white' },
        createElement(SheetHeader, null,
          createElement(SheetTitle, null, args.title),
          createElement(SheetDescription, null, args.description)
        ),
        createElement('div', { className: 'grid flex-1 auto-rows-min gap-6 px-4' },
          ...finalFields.map((field, index) =>
            createElement('div', { key: index, className: 'grid gap-3' },
              createElement(Label, { htmlFor: `bottom-field-${index}` }, field.label),
              createElement(Input, { 
                id: `bottom-field-${index}`, 
                defaultValue: field.value,
                placeholder: `Enter ${field.label.toLowerCase()}...`
              })
            )
          )
        ),
        createElement(SheetFooter, null,
          createElement(Button, { className: 'bg-black text-white' }, args.submitText),
          createElement(SheetClose, { asChild: true },
            createElement(Button, { variant: 'outline' }, args.closeText)
          )
        )
      )
    );
  },
};
