"use client";

import * as React from "react";
import { Calendar, Clock, LucideIcon, Settings, User } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavSecondary() {
    const pathname=usePathname()
  return (
    <SidebarGroup>
    <SidebarGroupLabel>Account</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === "/profile"}>
            <Link href="/profile">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === "/settings"}>
            <Link href="/settings">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === "/history"}>
            <Link href="/history">
              <Clock className="h-4 w-4" />
              <span>Interview History</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === "/calendar"}>
            <Link href="/calendar">
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
  );
}
