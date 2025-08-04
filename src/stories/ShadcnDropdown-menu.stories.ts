import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { createElement, useState } from 'react';

interface DefaultStoryArgs {
  showProfile: boolean;
  showBilling: boolean;
  showSettings: boolean;
  showKeyboardShortcuts: boolean;
  showPreferences: boolean;
  showNotifications: boolean;
  showTeam: boolean;
  showInviteUsers: boolean;
  showNewTeam: boolean;
  showManageTeam: boolean;
  showTeamSettings: boolean;
  showGitHub: boolean;
  showSupport: boolean;
  showAPI: boolean;
  showDocumentation: boolean;
  showFeedback: boolean;
  showChangelog: boolean;
  showLogout: boolean;
  showSwitchAccount: boolean;
  
  // Custom items from external input
  customItems: string;
  customItemsEnabled: boolean;
  customItemsSeparator: string;
  
  // Text customization
  profileText: string;
  billingText: string;
  settingsText: string;
  githubText: string;
  supportText: string;
  logoutText: string;
  preferencesText: string;
  notificationsText: string;
  manageTeamText: string;
  teamSettingsText: string;
  documentationText: string;
  feedbackText: string;
  changelogText: string;
  switchAccountText: string;
}

const meta: Meta<typeof DropdownMenu> = {
  title: 'Shadcn UI/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    modal: {
      control: { type: 'boolean' },
      description: 'Whether the dropdown menu is modal',
    },
  },
  args: {
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Built-in items
    showProfile: true,
    showBilling: true,
    showSettings: true,
    showKeyboardShortcuts: true,
    showPreferences: true,
    showNotifications: false,
    showTeam: true,
    showInviteUsers: true,
    showNewTeam: true,
    showManageTeam: false,
    showTeamSettings: false,
    showGitHub: true,
    showSupport: true,
    showAPI: true,
    showDocumentation: false,
    showFeedback: false,
    showChangelog: false,
    showLogout: true,
    showSwitchAccount: false,
    
    // Custom items
    customItems: 'Dashboard,Analytics,Reports,Export Data',
    customItemsEnabled: true,
    customItemsSeparator: ',',
    
    // Text customization
    profileText: 'Profile',
    billingText: 'Billing',
    settingsText: 'Settings',
    githubText: 'GitHub',
    supportText: 'Support',
    logoutText: 'Log out',
    preferencesText: 'Preferences',
    notificationsText: 'Notifications',
    manageTeamText: 'Manage Team',
    teamSettingsText: 'Team Settings',
    documentationText: 'Documentation',
    feedbackText: 'Send Feedback',
    changelogText: 'Changelog',
    switchAccountText: 'Switch Account',
  },
  argTypes: {
    // Built-in items controls
    showProfile: { control: 'boolean', description: 'Show Profile item' },
    showBilling: { control: 'boolean', description: 'Show Billing item' },
    showSettings: { control: 'boolean', description: 'Show Settings item' },
    showKeyboardShortcuts: { control: 'boolean', description: 'Show Keyboard shortcuts item' },
    showPreferences: { control: 'boolean', description: 'Show Preferences item' },
    showNotifications: { control: 'boolean', description: 'Show Notifications item' },
    showTeam: { control: 'boolean', description: 'Show Team item' },
    showInviteUsers: { control: 'boolean', description: 'Show Invite users submenu' },
    showNewTeam: { control: 'boolean', description: 'Show New Team item' },
    showManageTeam: { control: 'boolean', description: 'Show Manage Team item' },
    showTeamSettings: { control: 'boolean', description: 'Show Team Settings item' },
    showGitHub: { control: 'boolean', description: 'Show GitHub item' },
    showSupport: { control: 'boolean', description: 'Show Support item' },
    showAPI: { control: 'boolean', description: 'Show API item' },
    showDocumentation: { control: 'boolean', description: 'Show Documentation item' },
    showFeedback: { control: 'boolean', description: 'Show Feedback item' },
    showChangelog: { control: 'boolean', description: 'Show Changelog item' },
    showLogout: { control: 'boolean', description: 'Show Logout item' },
    showSwitchAccount: { control: 'boolean', description: 'Show Switch Account item' },
    
    // Custom items controls
    customItemsEnabled: { 
      control: 'boolean', 
      description: 'Enable custom items from input',
      table: { category: 'Custom Items' }
    },
    customItems: { 
      control: 'text', 
      description: 'Custom items separated by separator (e.g., "Item 1,Item 2,Item 3")',
      table: { category: 'Custom Items' }
    },
    customItemsSeparator: { 
      control: 'text', 
      description: 'Separator for custom items (default: comma)',
      table: { category: 'Custom Items' }
    },
    
    // Text controls
    profileText: { control: 'text', description: 'Profile text', table: { category: 'Text Customization' } },
    billingText: { control: 'text', description: 'Billing text', table: { category: 'Text Customization' } },
    settingsText: { control: 'text', description: 'Settings text', table: { category: 'Text Customization' } },
    githubText: { control: 'text', description: 'GitHub text', table: { category: 'Text Customization' } },
    supportText: { control: 'text', description: 'Support text', table: { category: 'Text Customization' } },
    logoutText: { control: 'text', description: 'Logout text', table: { category: 'Text Customization' } },
    preferencesText: { control: 'text', description: 'Preferences text', table: { category: 'Text Customization' } },
    notificationsText: { control: 'text', description: 'Notifications text', table: { category: 'Text Customization' } },
    manageTeamText: { control: 'text', description: 'Manage Team text', table: { category: 'Text Customization' } },
    teamSettingsText: { control: 'text', description: 'Team Settings text', table: { category: 'Text Customization' } },
    documentationText: { control: 'text', description: 'Documentation text', table: { category: 'Text Customization' } },
    feedbackText: { control: 'text', description: 'Feedback text', table: { category: 'Text Customization' } },
    changelogText: { control: 'text', description: 'Changelog text', table: { category: 'Text Customization' } },
    switchAccountText: { control: 'text', description: 'Switch Account text', table: { category: 'Text Customization' } },
  },
  render: (args: DefaultStoryArgs) => {
    // Parse custom items
    const customItemsList = args.customItemsEnabled && args.customItems 
      ? args.customItems.split(args.customItemsSeparator).map(item => item.trim()).filter(item => item.length > 0)
      : [];

    return createElement(DropdownMenu, null,
      createElement(DropdownMenuTrigger, { asChild: true },
        createElement(Button, { variant: 'outline' }, 'Open Menu')
      ),
      createElement(DropdownMenuContent, { className: 'w-56 bg-white', align: 'start' },
        createElement(DropdownMenuLabel, null, 'My Account'),
        createElement(DropdownMenuGroup, null,
          args.showProfile && createElement(DropdownMenuItem, null,
            args.profileText,
            createElement(DropdownMenuShortcut, null, '⇧⌘P')
          ),
          args.showBilling && createElement(DropdownMenuItem, null,
            args.billingText,
            createElement(DropdownMenuShortcut, null, '⌘B')
          ),
          args.showSettings && createElement(DropdownMenuItem, null,
            args.settingsText,
            createElement(DropdownMenuShortcut, null, '⌘S')
          ),
          args.showPreferences && createElement(DropdownMenuItem, null,
            args.preferencesText,
            createElement(DropdownMenuShortcut, null, '⌘,')
          ),
          args.showNotifications && createElement(DropdownMenuItem, null,
            args.notificationsText,
            createElement(DropdownMenuShortcut, null, '⌘N')
          ),
          args.showKeyboardShortcuts && createElement(DropdownMenuItem, null,
            'Keyboard shortcuts',
            createElement(DropdownMenuShortcut, null, '⌘K')
          )
        ),
        createElement(DropdownMenuSeparator),
        createElement(DropdownMenuGroup, null,
          args.showTeam && createElement(DropdownMenuItem, null, 'Team'),
          args.showManageTeam && createElement(DropdownMenuItem, null, args.manageTeamText),
          args.showTeamSettings && createElement(DropdownMenuItem, null, args.teamSettingsText),
          args.showInviteUsers && createElement(DropdownMenuSub, null,
            createElement(DropdownMenuSubTrigger, null, 'Invite users'),
            createElement(DropdownMenuPortal, null,
              createElement(DropdownMenuSubContent, { className: 'bg-white ' },
                createElement(DropdownMenuItem, null, 'Email'),
                createElement(DropdownMenuItem, null, 'Message'),
                createElement(DropdownMenuItem, null, 'Slack'),
                createElement(DropdownMenuItem, null, 'Discord'),
                createElement(DropdownMenuSeparator),
                createElement(DropdownMenuItem, null, 'More...')
              )
            )
          ),
          args.showNewTeam && createElement(DropdownMenuItem, null,
            'New Team',
            createElement(DropdownMenuShortcut, null, '⌘+T')
          )
        ),
        createElement(DropdownMenuSeparator),
        args.showGitHub && createElement(DropdownMenuItem, null, args.githubText),
        args.showSupport && createElement(DropdownMenuItem, null, args.supportText),
        args.showDocumentation && createElement(DropdownMenuItem, null, args.documentationText),
        args.showFeedback && createElement(DropdownMenuItem, null, args.feedbackText),
        args.showChangelog && createElement(DropdownMenuItem, null, args.changelogText),
        args.showAPI && createElement(DropdownMenuItem, { disabled: true }, 'API'),
        
        // Custom items section
        customItemsList.length > 0 && createElement(DropdownMenuSeparator),
        customItemsList.length > 0 && createElement(DropdownMenuLabel, null, 'Custom Items'),
        ...customItemsList.map((item, index) => 
          createElement(DropdownMenuItem, { key: `custom-${index}` }, item)
        ),
        
        createElement(DropdownMenuSeparator),
        args.showSwitchAccount && createElement(DropdownMenuItem, null,
          args.switchAccountText,
          createElement(DropdownMenuShortcut, null, '⌘⇧S')
        ),
        args.showLogout && createElement(DropdownMenuItem, null,
          args.logoutText,
          createElement(DropdownMenuShortcut, null, '⇧⌘Q')
        )
      )
    );
  },
};

export const WithCheckboxes: Story = {
  args: {
    showStatusBar: true,
    showActivityBar: true,
    showPanel: true,
    showSidebar: false,
    showMinimap: false,
    showBreadcrumbs: false,
    showLineNumbers: true,
    showWordWrap: false,
    statusBarText: 'Status Bar',
    activityBarText: 'Activity Bar',
    panelText: 'Panel',
    sidebarText: 'Sidebar',
    minimapText: 'Minimap',
    breadcrumbsText: 'Breadcrumbs',
    lineNumbersText: 'Line Numbers',
    wordWrapText: 'Word Wrap',
  },
  argTypes: {
    showStatusBar: { control: 'boolean', description: 'Show Status Bar checkbox' },
    showActivityBar: { control: 'boolean', description: 'Show Activity Bar checkbox' },
    showPanel: { control: 'boolean', description: 'Show Panel checkbox' },
    showSidebar: { control: 'boolean', description: 'Show Sidebar checkbox' },
    showMinimap: { control: 'boolean', description: 'Show Minimap checkbox' },
    showBreadcrumbs: { control: 'boolean', description: 'Show Breadcrumbs checkbox' },
    showLineNumbers: { control: 'boolean', description: 'Show Line Numbers checkbox' },
    showWordWrap: { control: 'boolean', description: 'Show Word Wrap checkbox' },
    statusBarText: { control: 'text', description: 'Status Bar text' },
    activityBarText: { control: 'text', description: 'Activity Bar text' },
    panelText: { control: 'text', description: 'Panel text' },
    sidebarText: { control: 'text', description: 'Sidebar text' },
    minimapText: { control: 'text', description: 'Minimap text' },
    breadcrumbsText: { control: 'text', description: 'Breadcrumbs text' },
    lineNumbersText: { control: 'text', description: 'Line Numbers text' },
    wordWrapText: { control: 'text', description: 'Word Wrap text' },
  },
  render: (args: any) => {
    const [showStatusBar, setShowStatusBar] = useState(true);
    const [showActivityBar, setShowActivityBar] = useState(false);
    const [showPanel, setShowPanel] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [showMinimap, setShowMinimap] = useState(false);
    const [showBreadcrumbs, setShowBreadcrumbs] = useState(true);
    const [showLineNumbers, setShowLineNumbers] = useState(true);
    const [showWordWrap, setShowWordWrap] = useState(false);

    return createElement(DropdownMenu, null,
      createElement(DropdownMenuTrigger, { asChild: true },
        createElement(Button, { variant: 'outline' }, 'View Options')
      ),
      createElement(DropdownMenuContent, { className: 'w-56 bg-white' },
        createElement(DropdownMenuLabel, null, 'Editor Appearance'),
        createElement(DropdownMenuSeparator),
        args.showStatusBar && createElement(DropdownMenuCheckboxItem, {
          checked: showStatusBar,
          onCheckedChange: setShowStatusBar
        }, args.statusBarText),
        args.showActivityBar && createElement(DropdownMenuCheckboxItem, {
          checked: showActivityBar,
          onCheckedChange: setShowActivityBar,
          disabled: true
        }, args.activityBarText),
        args.showPanel && createElement(DropdownMenuCheckboxItem, {
          checked: showPanel,
          onCheckedChange: setShowPanel
        }, args.panelText),
        args.showSidebar && createElement(DropdownMenuCheckboxItem, {
          checked: showSidebar,
          onCheckedChange: setShowSidebar
        }, args.sidebarText),
        createElement(DropdownMenuSeparator),
        createElement(DropdownMenuLabel, null, 'Editor Features'),
        args.showMinimap && createElement(DropdownMenuCheckboxItem, {
          checked: showMinimap,
          onCheckedChange: setShowMinimap
        }, args.minimapText),
        args.showBreadcrumbs && createElement(DropdownMenuCheckboxItem, {
          checked: showBreadcrumbs,
          onCheckedChange: setShowBreadcrumbs
        }, args.breadcrumbsText),
        args.showLineNumbers && createElement(DropdownMenuCheckboxItem, {
          checked: showLineNumbers,
          onCheckedChange: setShowLineNumbers
        }, args.lineNumbersText),
        args.showWordWrap && createElement(DropdownMenuCheckboxItem, {
          checked: showWordWrap,
          onCheckedChange: setShowWordWrap
        }, args.wordWrapText)
      )
    );
  },
};

export const WithRadioGroup: Story = {
  args: {
    showTop: true,
    showBottom: true,
    showRight: true,
    showLeft: false,
    showCenter: false,
    showFloating: false,
    topText: 'Top',
    bottomText: 'Bottom',
    rightText: 'Right',
    leftText: 'Left',
    centerText: 'Center',
    floatingText: 'Floating',
  },
  argTypes: {
    showTop: { control: 'boolean', description: 'Show Top option' },
    showBottom: { control: 'boolean', description: 'Show Bottom option' },
    showRight: { control: 'boolean', description: 'Show Right option' },
    showLeft: { control: 'boolean', description: 'Show Left option' },
    showCenter: { control: 'boolean', description: 'Show Center option' },
    showFloating: { control: 'boolean', description: 'Show Floating option' },
    topText: { control: 'text', description: 'Top option text' },
    bottomText: { control: 'text', description: 'Bottom option text' },
    rightText: { control: 'text', description: 'Right option text' },
    leftText: { control: 'text', description: 'Left option text' },
    centerText: { control: 'text', description: 'Center option text' },
    floatingText: { control: 'text', description: 'Floating option text' },
  },
  render: (args: any) => {
    const [position, setPosition] = useState('bottom');

    return createElement(DropdownMenu, null,
      createElement(DropdownMenuTrigger, { asChild: true },
        createElement(Button, { variant: 'outline' }, 'Panel Position')
      ),
      createElement(DropdownMenuContent, { className: 'w-56' },
        createElement(DropdownMenuLabel, null, 'Panel Position'),
        createElement(DropdownMenuSeparator),
        createElement(DropdownMenuRadioGroup, { value: position, onValueChange: setPosition },
          args.showTop && createElement(DropdownMenuRadioItem, { value: 'top' }, args.topText),
          args.showBottom && createElement(DropdownMenuRadioItem, { value: 'bottom' }, args.bottomText),
          args.showLeft && createElement(DropdownMenuRadioItem, { value: 'left' }, args.leftText),
          args.showRight && createElement(DropdownMenuRadioItem, { value: 'right' }, args.rightText),
          args.showCenter && createElement(DropdownMenuRadioItem, { value: 'center' }, args.centerText),
          args.showFloating && createElement(DropdownMenuRadioItem, { value: 'floating' }, args.floatingText)
        )
      )
    );
  },
};

export const CustomItemsDemo: Story = {
  args: {
    customItems: 'Dashboard,Analytics,Reports,Export Data,Import Data,Settings,Help Center',
    customItemsSeparator: ',',
    enableShortcuts: true,
    itemPrefix: '📊',
    showItemPrefix: false,
  },
  argTypes: {
    customItems: { 
      control: 'text', 
      description: 'Enter custom items separated by separator'
    },
    customItemsSeparator: { 
      control: 'text', 
      description: 'Separator character (default: comma)'
    },
    enableShortcuts: { 
      control: 'boolean', 
      description: 'Add keyboard shortcuts to custom items'
    },
    itemPrefix: { 
      control: 'text', 
      description: 'Prefix for all custom items (e.g., emoji or icon)'
    },
    showItemPrefix: { 
      control: 'boolean', 
      description: 'Show prefix before each item'
    },
  },
  render: (args: any) => {
    const customItemsList = args.customItems 
      ? args.customItems.split(args.customItemsSeparator).map((item: string) => item.trim()).filter((item: string) => item.length > 0)
      : [];

    const shortcuts = ['⌘1', '⌘2', '⌘3', '⌘4', '⌘5', '⌘6', '⌘7', '⌘8', '⌘9'];

    return createElement(DropdownMenu, null,
      createElement(DropdownMenuTrigger, { asChild: true },
        createElement(Button, { variant: 'outline' }, 'Custom Menu')
      ),
      createElement(DropdownMenuContent, { className: 'w-56' },
        createElement(DropdownMenuLabel, null, 'Custom Menu Items'),
        createElement(DropdownMenuSeparator),
        ...customItemsList.map((item: string, index: number) => 
          createElement(DropdownMenuItem, { key: `custom-${index}` },
            `${args.showItemPrefix ? args.itemPrefix + ' ' : ''}${item}`,
            args.enableShortcuts && shortcuts[index] && createElement(DropdownMenuShortcut, null, shortcuts[index])
          )
        ),
        customItemsList.length === 0 && createElement(DropdownMenuItem, { disabled: true }, 'No custom items added')
      )
    );
  },
};

