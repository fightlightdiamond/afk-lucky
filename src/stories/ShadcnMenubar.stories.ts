import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { createElement, useState } from 'react';

type MenubarStoryArgs = {
  // File Menu
  showFileMenu: boolean;
  fileMenuText: string;
  showNewTab: boolean;
  showNewWindow: boolean;
  showIncognito: boolean;
  showShare: boolean;
  showPrint: boolean;
  
  // Edit Menu
  showEditMenu: boolean;
  editMenuText: string;
  showUndo: boolean;
  showRedo: boolean;
  showFind: boolean;
  showCutCopyPaste: boolean;
  
  // View Menu
  showViewMenu: boolean;
  viewMenuText: string;
  showBookmarksBar: boolean;
  showFullURLs: boolean;
  showReload: boolean;
  showFullscreen: boolean;
  showSidebar: boolean;
  
  // Profiles Menu
  showProfilesMenu: boolean;
  profilesMenuText: string;
  selectedProfile: string;
  profiles: string;
  showEditProfile: boolean;
  showAddProfile: boolean;
  
  // Customization
  customMenus: string;
  customMenusEnabled: boolean;
  menuSeparator: string;
  
  // Text customization
  newTabText: string;
  newWindowText: string;
  incognitoText: string;
  shareText: string;
  printText: string;
  undoText: string;
  redoText: string;
  findText: string;
  cutText: string;
  copyText: string;
  pasteText: string;
  bookmarksBarText: string;
  fullURLsText: string;
  reloadText: string;
  fullscreenText: string;
  sidebarText: string;
};

const meta: Meta<MenubarStoryArgs> = {
  title: 'Shadcn UI/Menubar',
  component: Menubar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // File Menu Controls
    showFileMenu: { control: 'boolean', description: 'Show File menu' },
    fileMenuText: { control: 'text', description: 'File menu text' },
    showNewTab: { control: 'boolean', description: 'Show New Tab item' },
    showNewWindow: { control: 'boolean', description: 'Show New Window item' },
    showIncognito: { control: 'boolean', description: 'Show Incognito item' },
    showShare: { control: 'boolean', description: 'Show Share submenu' },
    showPrint: { control: 'boolean', description: 'Show Print item' },
    
    // Edit Menu Controls
    showEditMenu: { control: 'boolean', description: 'Show Edit menu' },
    editMenuText: { control: 'text', description: 'Edit menu text' },
    showUndo: { control: 'boolean', description: 'Show Undo/Redo items' },
    showFind: { control: 'boolean', description: 'Show Find submenu' },
    showCutCopyPaste: { control: 'boolean', description: 'Show Cut/Copy/Paste items' },
    
    // View Menu Controls
    showViewMenu: { control: 'boolean', description: 'Show View menu' },
    viewMenuText: { control: 'text', description: 'View menu text' },
    showBookmarksBar: { control: 'boolean', description: 'Show Bookmarks Bar option' },
    showFullURLs: { control: 'boolean', description: 'Show Full URLs option' },
    showReload: { control: 'boolean', description: 'Show Reload items' },
    showFullscreen: { control: 'boolean', description: 'Show Fullscreen toggle' },
    showSidebar: { control: 'boolean', description: 'Show Sidebar toggle' },
    
    // Profiles Menu Controls
    showProfilesMenu: { control: 'boolean', description: 'Show Profiles menu' },
    profilesMenuText: { control: 'text', description: 'Profiles menu text' },
    selectedProfile: { control: 'text', description: 'Selected profile name' },
    profiles: { control: 'text', description: 'Profile names (comma separated)' },
    showEditProfile: { control: 'boolean', description: 'Show Edit Profile item' },
    showAddProfile: { control: 'boolean', description: 'Show Add Profile item' },
    
    // Custom Menus
    customMenus: { control: 'text', description: 'Custom menu names (comma separated)' },
    customMenusEnabled: { control: 'boolean', description: 'Enable custom menus' },
    menuSeparator: { control: 'text', description: 'Menu separator character' },
    
    // Text Customization
    newTabText: { control: 'text', description: 'New Tab text', table: { category: 'Text Customization' } },
    newWindowText: { control: 'text', description: 'New Window text', table: { category: 'Text Customization' } },
    incognitoText: { control: 'text', description: 'Incognito text', table: { category: 'Text Customization' } },
    shareText: { control: 'text', description: 'Share text', table: { category: 'Text Customization' } },
    printText: { control: 'text', description: 'Print text', table: { category: 'Text Customization' } },
    undoText: { control: 'text', description: 'Undo text', table: { category: 'Text Customization' } },
    redoText: { control: 'text', description: 'Redo text', table: { category: 'Text Customization' } },
    findText: { control: 'text', description: 'Find text', table: { category: 'Text Customization' } },
    cutText: { control: 'text', description: 'Cut text', table: { category: 'Text Customization' } },
    copyText: { control: 'text', description: 'Copy text', table: { category: 'Text Customization' } },
    pasteText: { control: 'text', description: 'Paste text', table: { category: 'Text Customization' } },
    bookmarksBarText: { control: 'text', description: 'Bookmarks Bar text', table: { category: 'Text Customization' } },
    fullURLsText: { control: 'text', description: 'Full URLs text', table: { category: 'Text Customization' } },
    reloadText: { control: 'text', description: 'Reload text', table: { category: 'Text Customization' } },
    fullscreenText: { control: 'text', description: 'Fullscreen text', table: { category: 'Text Customization' } },
    sidebarText: { control: 'text', description: 'Sidebar text', table: { category: 'Text Customization' } },
  },
  args: {
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// MenubarDemo equivalent - Default story
export const Default: Story = {
  args: {
    // File Menu
    showFileMenu: true,
    fileMenuText: 'File',
    showNewTab: true,
    showNewWindow: true,
    showIncognito: true,
    showShare: true,
    showPrint: true,
    
    // Edit Menu
    showEditMenu: true,
    editMenuText: 'Edit',
    showUndo: true,
    showFind: true,
    showCutCopyPaste: true,
    
    // View Menu
    showViewMenu: true,
    viewMenuText: 'View',
    showBookmarksBar: true,
    showFullURLs: true,
    showReload: true,
    showFullscreen: true,
    showSidebar: true,
    
    // Profiles Menu
    showProfilesMenu: true,
    profilesMenuText: 'Profiles',
    selectedProfile: 'benoit',
    profiles: 'andy,benoit,Luis',
    showEditProfile: true,
    showAddProfile: true,
    
    // Custom
    customMenus: '',
    customMenusEnabled: false,
    menuSeparator: ',',
    
    // Text
    newTabText: 'New Tab',
    newWindowText: 'New Window',
    incognitoText: 'New Incognito Window',
    shareText: 'Share',
    printText: 'Print...',
    undoText: 'Undo',
    redoText: 'Redo',
    findText: 'Find',
    cutText: 'Cut',
    copyText: 'Copy',
    pasteText: 'Paste',
    bookmarksBarText: 'Always Show Bookmarks Bar',
    fullURLsText: 'Always Show Full URLs',
    reloadText: 'Reload',
    fullscreenText: 'Toggle Fullscreen',
    sidebarText: 'Hide Sidebar',
  },
  render: (args) => {
    const [bookmarksBarChecked, setBookmarksBarChecked] = useState(false);
    const [fullURLsChecked, setFullURLsChecked] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState(args.selectedProfile);
    
    const profilesList = args.profiles 
      ? args.profiles.split(args.menuSeparator).map(p => p.trim()).filter(p => p.length > 0)
      : [];
    
    const customMenusList = args.customMenusEnabled && args.customMenus
      ? args.customMenus.split(args.menuSeparator).map(m => m.trim()).filter(m => m.length > 0)
      : [];

    return createElement(Menubar, null,
      // File Menu
      args.showFileMenu && createElement(MenubarMenu, null,
        createElement(MenubarTrigger, null, args.fileMenuText),
        createElement(MenubarContent, null,
          args.showNewTab && createElement(MenubarItem, null,
            args.newTabText,
            createElement(MenubarShortcut, null, '⌘T')
          ),
          args.showNewWindow && createElement(MenubarItem, null,
            args.newWindowText,
            createElement(MenubarShortcut, null, '⌘N')
          ),
          args.showIncognito && createElement(MenubarItem, { disabled: true }, args.incognitoText),
          (args.showNewTab || args.showNewWindow || args.showIncognito) && args.showShare && createElement(MenubarSeparator),
          args.showShare && createElement(MenubarSub, null,
            createElement(MenubarSubTrigger, null, args.shareText),
            createElement(MenubarSubContent, null,
              createElement(MenubarItem, null, 'Email link'),
              createElement(MenubarItem, null, 'Messages'),
              createElement(MenubarItem, null, 'Notes')
            )
          ),
          args.showShare && args.showPrint && createElement(MenubarSeparator),
          args.showPrint && createElement(MenubarItem, null,
            args.printText,
            createElement(MenubarShortcut, null, '⌘P')
          )
        )
      ),
      
      // Edit Menu
      args.showEditMenu && createElement(MenubarMenu, null,
        createElement(MenubarTrigger, null, args.editMenuText),
        createElement(MenubarContent, null,
          args.showUndo && createElement(MenubarItem, null,
            args.undoText,
            createElement(MenubarShortcut, null, '⌘Z')
          ),
          args.showUndo && createElement(MenubarItem, null,
            args.redoText,
            createElement(MenubarShortcut, null, '⇧⌘Z')
          ),
          args.showUndo && args.showFind && createElement(MenubarSeparator),
          args.showFind && createElement(MenubarSub, null,
            createElement(MenubarSubTrigger, null, args.findText),
            createElement(MenubarSubContent, null,
              createElement(MenubarItem, null, 'Search the web'),
              createElement(MenubarSeparator),
              createElement(MenubarItem, null, 'Find...'),
              createElement(MenubarItem, null, 'Find Next'),
              createElement(MenubarItem, null, 'Find Previous')
            )
          ),
          args.showFind && args.showCutCopyPaste && createElement(MenubarSeparator),
          args.showCutCopyPaste && createElement(MenubarItem, null, args.cutText),
          args.showCutCopyPaste && createElement(MenubarItem, null, args.copyText),
          args.showCutCopyPaste && createElement(MenubarItem, null, args.pasteText)
        )
      ),
      
      // View Menu
      args.showViewMenu && createElement(MenubarMenu, null,
        createElement(MenubarTrigger, null, args.viewMenuText),
        createElement(MenubarContent, null,
          args.showBookmarksBar && createElement(MenubarCheckboxItem, {
            checked: bookmarksBarChecked,
            onCheckedChange: setBookmarksBarChecked
          }, args.bookmarksBarText),
          args.showFullURLs && createElement(MenubarCheckboxItem, {
            checked: fullURLsChecked,
            onCheckedChange: setFullURLsChecked
          }, args.fullURLsText),
          (args.showBookmarksBar || args.showFullURLs) && args.showReload && createElement(MenubarSeparator),
          args.showReload && createElement(MenubarItem, { inset: true },
            args.reloadText,
            createElement(MenubarShortcut, null, '⌘R')
          ),
          args.showReload && createElement(MenubarItem, { disabled: true, inset: true },
            'Force Reload',
            createElement(MenubarShortcut, null, '⇧⌘R')
          ),
          args.showReload && args.showFullscreen && createElement(MenubarSeparator),
          args.showFullscreen && createElement(MenubarItem, { inset: true }, args.fullscreenText),
          args.showFullscreen && args.showSidebar && createElement(MenubarSeparator),
          args.showSidebar && createElement(MenubarItem, { inset: true }, args.sidebarText)
        )
      ),
      
      // Profiles Menu
      args.showProfilesMenu && createElement(MenubarMenu, null,
        createElement(MenubarTrigger, null, args.profilesMenuText),
        createElement(MenubarContent, null,
          createElement(MenubarRadioGroup, {
            value: selectedProfile,
            onValueChange: setSelectedProfile
          },
            ...profilesList.map(profile => 
              createElement(MenubarRadioItem, { 
                key: profile, 
                value: profile.toLowerCase() 
              }, profile)
            )
          ),
          profilesList.length > 0 && (args.showEditProfile || args.showAddProfile) && createElement(MenubarSeparator),
          args.showEditProfile && createElement(MenubarItem, { inset: true }, 'Edit...'),
          args.showEditProfile && args.showAddProfile && createElement(MenubarSeparator),
          args.showAddProfile && createElement(MenubarItem, { inset: true }, 'Add Profile...')
        )
      ),
      
      // Custom Menus
      ...customMenusList.map((menuName, index) => 
        createElement(MenubarMenu, { key: `custom-${index}` },
          createElement(MenubarTrigger, null, menuName),
          createElement(MenubarContent, null,
            createElement(MenubarItem, null, `${menuName} Item 1`),
            createElement(MenubarItem, null, `${menuName} Item 2`),
            createElement(MenubarSeparator),
            createElement(MenubarItem, { disabled: true }, `${menuName} Disabled`)
          )
        )
      )
    );
  },
};

export const SimpleMenubar: Story = {
  args: {
    showFileMenu: true,
    fileMenuText: 'File',
    showNewTab: true,
    showNewWindow: false,
    showIncognito: false,
    showShare: false,
    showPrint: true,
    
    showEditMenu: true,
    editMenuText: 'Edit',
    showUndo: true,
    showFind: false,
    showCutCopyPaste: true,
    
    showViewMenu: false,
    showProfilesMenu: false,
    customMenusEnabled: false,
  },
  render: (args) => createElement(Menubar, null,
    createElement(MenubarMenu, null,
      createElement(MenubarTrigger, null, args.fileMenuText),
      createElement(MenubarContent, null,
        createElement(MenubarItem, null,
          args.newTabText,
          createElement(MenubarShortcut, null, '⌘T')
        ),
        createElement(MenubarSeparator),
        createElement(MenubarItem, null,
          args.printText,
          createElement(MenubarShortcut, null, '⌘P')
        )
      )
    ),
    createElement(MenubarMenu, null,
      createElement(MenubarTrigger, null, args.editMenuText),
      createElement(MenubarContent, null,
        createElement(MenubarItem, null,
          args.undoText,
          createElement(MenubarShortcut, null, '⌘Z')
        ),
        createElement(MenubarItem, null,
          args.redoText,
          createElement(MenubarShortcut, null, '⇧⌘Z')
        ),
        createElement(MenubarSeparator),
        createElement(MenubarItem, null, args.cutText),
        createElement(MenubarItem, null, args.copyText),
        createElement(MenubarItem, null, args.pasteText)
      )
    )
  ),
};

export const CustomMenubar: Story = {
  args: {
    showFileMenu: false,
    showEditMenu: false,
    showViewMenu: false,
    showProfilesMenu: false,
    customMenusEnabled: true,
    customMenus: 'Dashboard,Analytics,Settings,Help',
    menuSeparator: ',',
  },
  render: (args) => {
    const customMenusList = args.customMenusEnabled && args.customMenus
      ? args.customMenus.split(args.menuSeparator).map(m => m.trim()).filter(m => m.length > 0)
      : [];

    return createElement(Menubar, null,
      ...customMenusList.map((menuName, index) => 
        createElement(MenubarMenu, { key: `custom-${index}` },
          createElement(MenubarTrigger, null, menuName),
          createElement(MenubarContent, null,
            createElement(MenubarItem, null, `View ${menuName}`),
            createElement(MenubarItem, null, `Edit ${menuName}`),
            createElement(MenubarSeparator),
            createElement(MenubarSub, null,
              createElement(MenubarSubTrigger, null, 'Export'),
              createElement(MenubarSubContent, null,
                createElement(MenubarItem, null, 'Export as PDF'),
                createElement(MenubarItem, null, 'Export as CSV'),
                createElement(MenubarItem, null, 'Export as JSON')
              )
            ),
            createElement(MenubarSeparator),
            createElement(MenubarItem, { disabled: true }, `Delete ${menuName}`)
          )
        )
      )
    );
  },
};

export const VietnameseMenubar: Story = {
  args: {
    showFileMenu: true,
    fileMenuText: 'Tệp',
    showNewTab: true,
    showNewWindow: true,
    showIncognito: true,
    showShare: true,
    showPrint: true,
    
    showEditMenu: true,
    editMenuText: 'Chỉnh sửa',
    showUndo: true,
    showFind: true,
    showCutCopyPaste: true,
    
    showViewMenu: true,
    viewMenuText: 'Hiển thị',
    showBookmarksBar: true,
    showFullURLs: true,
    showReload: true,
    showFullscreen: true,
    showSidebar: true,
    
    showProfilesMenu: true,
    profilesMenuText: 'Hồ sơ',
    selectedProfile: 'minh',
    profiles: 'Minh,Hoa,Nam',
    showEditProfile: true,
    showAddProfile: true,
    
    // Vietnamese text
    newTabText: 'Tab mới',
    newWindowText: 'Cửa sổ mới',
    incognitoText: 'Cửa sổ ẩn danh',
    shareText: 'Chia sẻ',
    printText: 'In...',
    undoText: 'Hoàn tác',
    redoText: 'Làm lại',
    findText: 'Tìm kiếm',
    cutText: 'Cắt',
    copyText: 'Sao chép',
    pasteText: 'Dán',
    bookmarksBarText: 'Luôn hiển thị thanh bookmark',
    fullURLsText: 'Luôn hiển thị URL đầy đủ',
    reloadText: 'Tải lại',
    fullscreenText: 'Chuyển đổi toàn màn hình',
    sidebarText: 'Ẩn thanh bên',
  },
  render: (args) => {
    const [bookmarksBarChecked, setBookmarksBarChecked] = useState(false);
    const [fullURLsChecked, setFullURLsChecked] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState('minh');
    
    const profilesList = ['Minh', 'Hoa', 'Nam'];

    return createElement(Menubar, null,
      createElement(MenubarMenu, null,
        createElement(MenubarTrigger, null, args.fileMenuText),
        createElement(MenubarContent, null,
          createElement(MenubarItem, null,
            args.newTabText,
            createElement(MenubarShortcut, null, '⌘T')
          ),
          createElement(MenubarItem, null,
            args.newWindowText,
            createElement(MenubarShortcut, null, '⌘N')
          ),
          createElement(MenubarItem, { disabled: true }, args.incognitoText),
          createElement(MenubarSeparator),
          createElement(MenubarSub, null,
            createElement(MenubarSubTrigger, null, args.shareText),
            createElement(MenubarSubContent, null,
              createElement(MenubarItem, null, 'Gửi qua email'),
              createElement(MenubarItem, null, 'Tin nhắn'),
              createElement(MenubarItem, null, 'Ghi chú')
            )
          ),
          createElement(MenubarSeparator),
          createElement(MenubarItem, null,
            args.printText,
            createElement(MenubarShortcut, null, '⌘P')
          )
        )
      ),
      
      createElement(MenubarMenu, null,
        createElement(MenubarTrigger, null, args.editMenuText),
        createElement(MenubarContent, null,
          createElement(MenubarItem, null,
            args.undoText,
            createElement(MenubarShortcut, null, '⌘Z')
          ),
          createElement(MenubarItem, null,
            args.redoText,
            createElement(MenubarShortcut, null, '⇧⌘Z')
          ),
          createElement(MenubarSeparator),
          createElement(MenubarSub, null,
            createElement(MenubarSubTrigger, null, args.findText),
            createElement(MenubarSubContent, null,
              createElement(MenubarItem, null, 'Tìm trên web'),
              createElement(MenubarSeparator),
              createElement(MenubarItem, null, 'Tìm kiếm...'),
              createElement(MenubarItem, null, 'Tìm tiếp theo'),
              createElement(MenubarItem, null, 'Tìm trước đó')
            )
          ),
          createElement(MenubarSeparator),
          createElement(MenubarItem, null, args.cutText),
          createElement(MenubarItem, null, args.copyText),
          createElement(MenubarItem, null, args.pasteText)
        )
      ),
      
      createElement(MenubarMenu, null,
        createElement(MenubarTrigger, null, args.viewMenuText),
        createElement(MenubarContent, null,
          createElement(MenubarCheckboxItem, {
            checked: bookmarksBarChecked,
            onCheckedChange: setBookmarksBarChecked
          }, args.bookmarksBarText),
          createElement(MenubarCheckboxItem, {
            checked: fullURLsChecked,
            onCheckedChange: setFullURLsChecked
          }, args.fullURLsText),
          createElement(MenubarSeparator),
          createElement(MenubarItem, { inset: true },
            args.reloadText,
            createElement(MenubarShortcut, null, '⌘R')
          ),
          createElement(MenubarItem, { disabled: true, inset: true },
            'Tải lại mạnh',
            createElement(MenubarShortcut, null, '⇧⌘R')
          ),
          createElement(MenubarSeparator),
          createElement(MenubarItem, { inset: true }, args.fullscreenText),
          createElement(MenubarSeparator),
          createElement(MenubarItem, { inset: true }, args.sidebarText)
        )
      ),
      
      createElement(MenubarMenu, null,
        createElement(MenubarTrigger, null, args.profilesMenuText),
        createElement(MenubarContent, null,
          createElement(MenubarRadioGroup, {
            value: selectedProfile,
            onValueChange: setSelectedProfile
          },
            ...profilesList.map(profile => 
              createElement(MenubarRadioItem, { 
                key: profile, 
                value: profile.toLowerCase() 
              }, profile)
            )
          ),
          createElement(MenubarSeparator),
          createElement(MenubarItem, { inset: true }, 'Chỉnh sửa...'),
          createElement(MenubarSeparator),
          createElement(MenubarItem, { inset: true }, 'Thêm hồ sơ...')
        )
      )
    );
  },
};

export const ApplicationMenubar: Story = {
  args: {
    customMenusEnabled: true,
    customMenus: 'Application,Window,Tools,Help',
    menuSeparator: ',',
  },
  render: (args) => createElement(Menubar, null,
    createElement(MenubarMenu, null,
      createElement(MenubarTrigger, null, 'Application'),
      createElement(MenubarContent, null,
        createElement(MenubarItem, null, 'About Application'),
        createElement(MenubarSeparator),
        createElement(MenubarItem, null, 'Preferences...', createElement(MenubarShortcut, null, '⌘,')),
        createElement(MenubarSeparator),
        createElement(MenubarItem, null, 'Hide Application', createElement(MenubarShortcut, null, '⌘H')),
        createElement(MenubarItem, null, 'Hide Others', createElement(MenubarShortcut, null, '⌥⌘H')),
        createElement(MenubarItem, null, 'Show All'),
        createElement(MenubarSeparator),
        createElement(MenubarItem, null, 'Quit Application', createElement(MenubarShortcut, null, '⌘Q'))
      )
    ),
    
    createElement(MenubarMenu, null,
      createElement(MenubarTrigger, null, 'Window'),
      createElement(MenubarContent, null,
        createElement(MenubarItem, null, 'Minimize', createElement(MenubarShortcut, null, '⌘M')),
        createElement(MenubarItem, null, 'Zoom'),
        createElement(MenubarSeparator),
        createElement(MenubarItem, null, 'Bring All to Front'),
        createElement(MenubarSeparator),
        createElement(MenubarItem, null, 'Main Window'),
        createElement(MenubarItem, null, 'Inspector'),
        createElement(MenubarItem, { disabled: true }, 'Console')
      )
    ),
    
    createElement(MenubarMenu, null,
      createElement(MenubarTrigger, null, 'Tools'),
      createElement(MenubarContent, null,
        createElement(MenubarItem, null, 'Developer Tools', createElement(MenubarShortcut, null, '⌥⌘I')),
        createElement(MenubarItem, null, 'JavaScript Console', createElement(MenubarShortcut, null, '⌥⌘J')),
        createElement(MenubarSeparator),
        createElement(MenubarSub, null,
          createElement(MenubarSubTrigger, null, 'Extensions'),
          createElement(MenubarSubContent, null,
            createElement(MenubarItem, null, 'Manage Extensions'),
            createElement(MenubarItem, null, 'Get More Extensions'),
            createElement(MenubarSeparator),
            createElement(MenubarItem, { disabled: true }, 'No Extensions Installed')
          )
        ),
        createElement(MenubarSeparator),
        createElement(MenubarItem, null, 'Task Manager', createElement(MenubarShortcut, null, '⇧⌘Esc'))
      )
    ),
    
    createElement(MenubarMenu, null,
      createElement(MenubarTrigger, null, 'Help'),
      createElement(MenubarContent, null,
        createElement(MenubarItem, null, 'Documentation'),
        createElement(MenubarItem, null, 'Keyboard Shortcuts'),
        createElement(MenubarItem, null, 'Release Notes'),
        createElement(MenubarSeparator),
        createElement(MenubarItem, null, 'Report Issue'),
        createElement(MenubarItem, null, 'Contact Support'),
        createElement(MenubarSeparator),
        createElement(MenubarItem, null, 'Check for Updates')
      )
    )
  ),
};

export const MinimalMenubar: Story = {
  args: {
    showFileMenu: true,
    fileMenuText: 'Menu',
    showNewTab: false,
    showNewWindow: false,
    showIncognito: false,
    showShare: false,
    showPrint: false,
    
    showEditMenu: false,
    showViewMenu: false,
    showProfilesMenu: false,
    customMenusEnabled: false,
  },
  render: (args) => createElement(Menubar, null,
    createElement(MenubarMenu, null,
      createElement(MenubarTrigger, null, args.fileMenuText),
      createElement(MenubarContent, null,
        createElement(MenubarItem, null, 'Home'),
        createElement(MenubarItem, null, 'About'),
        createElement(MenubarItem, null, 'Contact'),
        createElement(MenubarSeparator),
        createElement(MenubarItem, null, 'Settings'),
        createElement(MenubarItem, null, 'Logout')
      )
    )
  ),
};