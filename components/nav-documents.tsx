"use client"
import {
    BarChart,
    Brain,
    Code,
    FolderIcon,
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
  
  export function NavDocuments() {
    const { isMobile } = useSidebar();
    const pathname = usePathname()
  
    return (
        <SidebarGroup>
          <SidebarGroupLabel >Interview Practice</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/interview/dsa")}>
                  <Link href="/interview/new?type=dsa">
                    <Code className="h-4 w-4" />
                    <span>DSA Interview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/interview/system")}>
                  <Link href="/interview/new?type=system">
                    <Brain className="h-4 w-4" />
                    <span>System Design</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/interview/behavioral")}>
                  <Link href="/interview/new?type=behavioral">
                    <Users className="h-4 w-4" />
                    <span>Behavioral</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/interview/popular")}>
                  <Link href="/interview/popular">
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
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
    );
  }
  