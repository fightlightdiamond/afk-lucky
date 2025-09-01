"use client";

import React, { useState } from "react";
import { useResponsive, useDeviceDetection } from "@/hooks";
import { responsive, patterns } from "@/utils/responsive";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function MobileFirstUIDemo() {
  const { currentBreakpoint, isMobile } = useResponsive();
  const deviceInfo = useDeviceDetection();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    category: "",
    newsletter: false,
  });

  const sampleData = [
    { id: 1, name: "John Doe", email: "john@example.com", status: "Active" },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      status: "Inactive",
    },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", status: "Pending" },
  ];

  return (
    <div className={responsive.container()}>
      <div className="space-y-8">
        {/* Header */}
        <div className={patterns.hero}>
          <h1 className="text-fluid-3xl font-bold mb-4">
            Mobile-First UI Components
          </h1>
          <p className="text-fluid-base text-muted-foreground mb-4">
            All components are optimized for mobile devices with touch-friendly
            interactions
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary">Current: {currentBreakpoint}</Badge>
            <Badge variant={deviceInfo.isTouchDevice ? "default" : "outline"}>
              {deviceInfo.isTouchDevice ? "Touch Device" : "Mouse Device"}
            </Badge>
            <Badge variant={isMobile ? "default" : "outline"}>
              {isMobile ? "Mobile" : "Desktop"}
            </Badge>
          </div>
        </div>

        {/* Buttons Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Touch-friendly buttons with minimum 44px touch targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Button Sizes</h4>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">⭐</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Components Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Form Components</CardTitle>
            <CardDescription>
              Mobile-optimized form inputs with larger touch targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="support">Technical Support</SelectItem>
                    <SelectItem value="billing">Billing Question</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message here..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="newsletter"
                  checked={formData.newsletter}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, newsletter: checked as boolean })
                  }
                />
                <Label htmlFor="newsletter">
                  Subscribe to our newsletter for updates
                </Label>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button className="w-full sm:w-auto">Submit Form</Button>
          </CardFooter>
        </Card>

        {/* Dialog Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Dialog</CardTitle>
            <CardDescription>
              Mobile-optimized modal dialogs with proper spacing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mobile-First Dialog</DialogTitle>
                  <DialogDescription>
                    This dialog is optimized for mobile devices with proper
                    touch targets and spacing. The close button is large enough
                    for easy tapping.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    Dialog content goes here. On mobile, this dialog takes up
                    most of the screen width with appropriate margins for
                    comfortable reading.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Dropdown Menu Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Dropdown Menu</CardTitle>
            <CardDescription>
              Touch-friendly dropdown menus with larger tap targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Open Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem>Account Preferences</DropdownMenuItem>
                <DropdownMenuItem>Billing Information</DropdownMenuItem>
                <DropdownMenuItem>Support Center</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>

        {/* Table Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Data Table</CardTitle>
            <CardDescription>
              Responsive table with horizontal scrolling on mobile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "Active"
                            ? "default"
                            : item.status === "Inactive"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            ⋯
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Layout Patterns Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Responsive Layout Patterns</CardTitle>
            <CardDescription>
              Common layout patterns that adapt from mobile to desktop
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Stack to Row Pattern */}
            <div className="mb-8">
              <h4 className="text-sm font-medium mb-3">Stack to Row</h4>
              <div className={patterns.stackToRow + " gap-4"}>
                <div className="flex-1 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-center">
                  <p className="text-sm">Stacks vertically on mobile</p>
                </div>
                <div className="flex-1 p-4 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                  <p className="text-sm">Becomes horizontal on desktop</p>
                </div>
                <div className="flex-1 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg text-center">
                  <p className="text-sm">Maintains equal spacing</p>
                </div>
              </div>
            </div>

            {/* Card Grid Pattern */}
            <div>
              <h4 className="text-sm font-medium mb-3">Responsive Card Grid</h4>
              <div className={patterns.cardGrid}>
                {Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={i}
                    className="p-4 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-lg text-center"
                  >
                    <div className="text-lg font-semibold mb-2">
                      Card {i + 1}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Responsive grid item
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Touch Interaction Info */}
        {deviceInfo.isTouchDevice && (
          <Card>
            <CardHeader>
              <CardTitle>Touch Device Detected</CardTitle>
              <CardDescription>
                All components have been optimized for touch interaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Touch Optimizations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Minimum 44px touch targets</li>
                    <li>• Larger padding and spacing</li>
                    <li>• Touch-friendly shadows</li>
                    <li>• Optimized animations</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Device Info</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Orientation: {deviceInfo.orientation}</li>
                    <li>• Platform: {deviceInfo.platform}</li>
                    <li>
                      • Touch Support: {deviceInfo.isTouchDevice ? "Yes" : "No"}
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
