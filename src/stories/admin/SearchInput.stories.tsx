import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { useState } from "react";
import { SearchInput } from "@/components/admin/filters/SearchInput";

// Interactive wrapper for Storybook
const SearchInputWrapper = (args: React.ComponentProps<typeof SearchInput>) => {
  const [value, setValue] = useState(args.value || "");

  const handleChange = (newValue: string) => {
    setValue(newValue);
    args.onChange(newValue);
  };

  return <SearchInput {...args} value={value} onChange={handleChange} />;
};

const meta: Meta<typeof SearchInput> = {
  title: "Admin/Filters/SearchInput",
  component: SearchInputWrapper,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A debounced search input component for filtering users. Features real-time search with configurable debounce delay, clear functionality, and accessibility support.",
      },
    },
  },
  argTypes: {
    value: {
      description: "Current search value",
      control: { type: "text" },
    },
    placeholder: {
      description: "Placeholder text for the input",
      control: { type: "text" },
    },
    debounceMs: {
      description: "Debounce delay in milliseconds",
      control: { type: "number", min: 0, max: 2000, step: 100 },
    },
    disabled: {
      description: "Whether the input is disabled",
      control: { type: "boolean" },
    },
    onChange: {
      description: "Callback when search value changes (debounced)",
      action: "change",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  args: {
    value: "",
    placeholder: "Search users...",
    debounceMs: 300,
    disabled: false,
    onChange: fn(),
  },
};

export const WithValue: Story = {
  args: {
    value: "john doe",
    placeholder: "Search users...",
    debounceMs: 300,
    disabled: false,
    onChange: fn(),
  },
};

export const CustomPlaceholder: Story = {
  args: {
    value: "",
    placeholder: "Type to search by name, email, or role...",
    debounceMs: 300,
    disabled: false,
    onChange: fn(),
  },
};

export const FastDebounce: Story = {
  args: {
    value: "",
    placeholder: "Search users...",
    debounceMs: 100,
    disabled: false,
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Search input with fast debounce (100ms) for more responsive searching.",
      },
    },
  },
};

export const SlowDebounce: Story = {
  args: {
    value: "",
    placeholder: "Search users...",
    debounceMs: 1000,
    disabled: false,
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Search input with slow debounce (1000ms) to reduce API calls.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    value: "Cannot edit this",
    placeholder: "Search users...",
    debounceMs: 300,
    disabled: true,
    onChange: fn(),
  },
};

export const EmailSearch: Story = {
  args: {
    value: "user@example.com",
    placeholder: "Search by email address...",
    debounceMs: 300,
    disabled: false,
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Example of searching by email address.",
      },
    },
  },
};

export const LongSearchTerm: Story = {
  args: {
    value:
      "This is a very long search term that might be used to find specific users with detailed information",
    placeholder: "Search users...",
    debounceMs: 300,
    disabled: false,
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Example with a long search term to test input handling.",
      },
    },
  },
};

export const InteractiveDemo: Story = {
  render: function InteractiveDemoRender(args) {
    const [searchValue, setSearchValue] = useState("");
    const [debounceMs, setDebounceMs] = useState(300);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);

    const handleSearchChange = (value: string) => {
      setSearchHistory((prev) => [value, ...prev.slice(0, 4)]);
      args.onChange?.(value);
    };

    return (
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Debounce Delay: {debounceMs}ms
            </label>
            <input
              type="range"
              min="0"
              max="1000"
              step="100"
              value={debounceMs}
              onChange={(e) => setDebounceMs(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <SearchInput
            value={searchValue}
            placeholder="Try typing to see debounced search..."
            debounceMs={debounceMs}
            disabled={false}
            onChange={handleSearchChange}
          />
        </div>

        {searchHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Searches:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {searchHistory.map((term, index) => (
                <li key={index} className="truncate">
                  {term || "(empty)"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
};
