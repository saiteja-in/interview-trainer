"use client"
import {
    BarChart,
    Brain,
    Code,
    FolderIcon,
    Home,
    LayoutDashboard,
    MoreHorizontalIcon,
    ShareIcon,
    Upload,
    Users,
    type LucideIcon,
  } from "lucide-react";
  
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
  } from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
  
  export function NavNavigation() {
    const { isMobile } = useSidebar();
    const pathname = usePathname()
  
    return (
        <SidebarGroup>
          <SidebarGroupLabel >Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/interview/behavioral")}>
                  <Link href="/interview/new?type=behavioral">
                    <Users className="h-4 w-4" />
                    <span>Behavioral</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/interview/popular")}>
                  <Link href="/interview/new?type=popular">
                    <BarChart className="h-4 w-4" />
                    <span>Popular Interviews</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/interview/resume")}>
                  <Link href="/interview/resume">
                    <Upload className="h-4 w-4" />
                    <span>Resume-Based</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
    );
  }
  