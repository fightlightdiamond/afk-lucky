import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';

const meta: Meta<typeof HoverCard> = {
  title: 'Shadcn UI/HoverCard',
  component: HoverCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    openDelay: {
      control: { type: 'number', min: 0, max: 2000, step: 100 },
      description: 'Thời gian trễ trước khi mở (ms)',
    },
    closeDelay: {
      control: { type: 'number', min: 0, max: 2000, step: 100 },
      description: 'Thời gian trễ trước khi đóng (ms)',
    },
  },
  args: {
    onOpenChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    openDelay: 700,
    closeDelay: 300,
    defaultUser: '@reactjs',
    defaultName: 'React',
    defaultDescription: 'Thư viện JavaScript để xây dựng giao diện người dùng - được phát triển bởi Meta.',
    defaultAvatar: 'https://github.com/facebook.png',
    defaultFallback: 'RC',
    defaultJoinDate: 'Tham gia tháng 5 năm 2013',
  },
  argTypes: {
    defaultUser: { control: 'text', description: 'Tên người dùng hiển thị' },
    defaultName: { control: 'text', description: 'Tên đầy đủ' },
    defaultDescription: { control: 'text', description: 'Mô tả người dùng' },
    defaultAvatar: { control: 'text', description: 'URL hình đại diện' },
    defaultFallback: { control: 'text', description: 'Chữ thay thế avatar' },
    defaultJoinDate: { control: 'text', description: 'Thông tin ngày tham gia' },
  },
  render: (args: any) => (
    <HoverCard openDelay={args.openDelay} closeDelay={args.closeDelay}>
      <HoverCardTrigger asChild>
        <Button variant="link">{args.defaultUser}</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage src={args.defaultAvatar} />
            <AvatarFallback>{args.defaultFallback}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{args.defaultName}</h4>
            <p className="text-sm">
              {args.defaultDescription}
            </p>
            <div className="flex items-center pt-2">
              <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
              <span className="text-xs text-muted-foreground">
                {args.defaultJoinDate}
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const UserProfile: Story = {
  args: {
    openDelay: 500,
    closeDelay: 200,
    userName: 'John Doe',
    userHandle: '@johndoe',
    userBio: 'Full-stack developer passionate about React and TypeScript. Building amazing web experiences.',
    userAvatar: 'https://github.com/shadcn.png',
    userFallback: 'JD',
    joinDate: 'March 2020',
    followers: '1.2k',
    following: '234',
    showStats: true,
    showBadge: true,
    badgeText: 'Pro',
    badgeVariant: 'default' as const,
  },
  argTypes: {
    userName: { control: 'text', description: 'Tên hiển thị của người dùng' },
    userHandle: { control: 'text', description: 'Tên người dùng/handle' },
    userBio: { control: 'text', description: 'Tiểu sử/mô tả người dùng' },
    userAvatar: { control: 'text', description: 'URL hình đại diện' },
    userFallback: { control: 'text', description: 'Chữ thay thế cho avatar' },
    joinDate: { control: 'text', description: 'Ngày tham gia' },
    followers: { control: 'text', description: 'Số người theo dõi' },
    following: { control: 'text', description: 'Số người đang theo dõi' },
    showStats: { control: 'boolean', description: 'Hiển thị thống kê người theo dõi' },
    showBadge: { control: 'boolean', description: 'Hiển thị huy hiệu người dùng' },
    badgeText: { control: 'text', description: 'Nội dung huy hiệu' },
    badgeVariant: { 
      control: 'select', 
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'Kiểu huy hiệu' 
    },
  },
  render: (args: any) => (
    <HoverCard openDelay={args.openDelay} closeDelay={args.closeDelay}>
      <HoverCardTrigger asChild>
        <Button variant="link">{args.userHandle}</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage src={args.userAvatar} />
            <AvatarFallback>{args.userFallback}</AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold">{args.userName}</h4>
              {args.showBadge && (
                <Badge variant={args.badgeVariant} className="text-xs">
                  {args.badgeText}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{args.userHandle}</p>
            <p className="text-sm">{args.userBio}</p>
            {args.showStats && (
              <div className="flex items-center gap-4 pt-2">
                <div className="text-xs">
                  <span className="font-semibold">{args.followers}</span>{" "}
                  <span className="text-muted-foreground">followers</span>
                </div>
                <div className="text-xs">
                  <span className="font-semibold">{args.following}</span>{" "}
                  <span className="text-muted-foreground">following</span>
                </div>
              </div>
            )}
            <div className="flex items-center pt-2">
              <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
              <span className="text-xs text-muted-foreground">
                Joined {args.joinDate}
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const ProductCard: Story = {
  args: {
    productName: 'iPhone 15 Pro',
    productPrice: '$999',
    productDescription: 'The most advanced iPhone yet with A17 Pro chip and titanium design.',
    productImage: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    productRating: '4.8',
    productReviews: '2.1k',
    inStock: true,
    showRating: true,
    showStock: true,
  },
  argTypes: {
    productName: { control: 'text', description: 'Tên sản phẩm' },
    productPrice: { control: 'text', description: 'Giá sản phẩm' },
    productDescription: { control: 'text', description: 'Mô tả sản phẩm' },
    productImage: { control: 'text', description: 'URL hình ảnh sản phẩm' },
    productRating: { control: 'text', description: 'Đánh giá sản phẩm' },
    productReviews: { control: 'text', description: 'Số lượng đánh giá' },
    inStock: { control: 'boolean', description: 'Sản phẩm còn hàng' },
    showRating: { control: 'boolean', description: 'Hiển thị đánh giá' },
    showStock: { control: 'boolean', description: 'Hiển thị trạng thái kho' },
  },
  render: (args: any) => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="outline">{args.productName}</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div className="flex space-x-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={args.productImage} 
                alt={args.productName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-semibold">{args.productName}</h4>
              <p className="text-lg font-bold text-green-600">{args.productPrice}</p>
              {args.showStock && (
                <Badge variant={args.inStock ? 'default' : 'destructive'} className="text-xs">
                  {args.inStock ? 'Còn hàng' : 'Hết hàng'}
                </Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{args.productDescription}</p>
          {args.showRating && (
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {'★'.repeat(5)}
              </div>
              <span className="text-sm font-medium">{args.productRating}</span>
              <span className="text-sm text-muted-foreground">({args.productReviews} đánh giá)</span>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const CompanyCard: Story = {
  args: {
    companyName: 'Vercel',
    companyDescription: 'The platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration.',
    companyLogo: 'https://github.com/vercel.png',
    companyWebsite: 'vercel.com',
    employees: '500+',
    founded: '2015',
    location: 'San Francisco, CA',
    showDetails: true,
  },
  argTypes: {
    companyName: { control: 'text', description: 'Tên công ty' },
    companyDescription: { control: 'text', description: 'Mô tả công ty' },
    companyLogo: { control: 'text', description: 'URL logo công ty' },
    companyWebsite: { control: 'text', description: 'Website công ty' },
    employees: { control: 'text', description: 'Số lượng nhân viên' },
    founded: { control: 'text', description: 'Năm thành lập' },
    location: { control: 'text', description: 'Địa điểm công ty' },
    showDetails: { control: 'boolean', description: 'Hiển thị chi tiết công ty' },
  },
  render: (args: any) => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">{args.companyName}</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={args.companyLogo} />
              <AvatarFallback>{args.companyName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-sm font-semibold">{args.companyName}</h4>
              <p className="text-sm text-muted-foreground">{args.companyWebsite}</p>
            </div>
          </div>
          <p className="text-sm">{args.companyDescription}</p>
          {args.showDetails && (
            <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
              <div>
                <span className="text-muted-foreground">Nhân viên:</span>
                <div className="font-medium">{args.employees}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Thành lập:</span>
                <div className="font-medium">{args.founded}</div>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Địa điểm:</span>
                <div className="font-medium">{args.location}</div>
              </div>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const SimpleText: Story = {
  args: {
    triggerText: 'Di chuột qua đây',
    contentText: 'Đây là hover card đơn giản chỉ có nội dung văn bản.',
    triggerVariant: 'outline' as const,
  },
  argTypes: {
    triggerText: { control: 'text', description: 'Nội dung nút kích hoạt' },
    contentText: { control: 'text', description: 'Nội dung hover card' },
    triggerVariant: { 
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Kiểu nút kích hoạt'
    },
  },
  render: (args: any) => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant={args.triggerVariant}>{args.triggerText}</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <p className="text-sm">{args.contentText}</p>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const WithCustomTrigger: Story = {
  render: () => (
    <div className="space-y-4">
      <HoverCard>
        <HoverCardTrigger asChild>
          <span className="underline cursor-pointer">Di chuột qua văn bản này</span>
        </HoverCardTrigger>
        <HoverCardContent>
          <p className="text-sm">Hover card này được kích hoạt bởi văn bản thay vì nút bấm.</p>
        </HoverCardContent>
      </HoverCard>
      
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="w-5 h-5 bg-blue-500 rounded-full cursor-pointer inline-flex items-center justify-center text-white font-bold">
             ?
          </div>
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="space-y-2">
            <h4 className="font-semibold">Trợ giúp</h4>
            <p className="text-sm">Đây là tooltip trợ giúp được kích hoạt bởi phần tử tùy chỉnh.</p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};



