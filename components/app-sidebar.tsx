import * as React from "react";

import { SearchForm } from "./search-form";
import { VersionSwitcher } from "./version-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  Home,
  MessageSquare,
} from "lucide-react";
import { NavMain } from "./nav-main";
import { NavDocuments } from "./nav-documents";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { Button } from "./ui/button";
import { ExtendedUser } from "@/schemas";
import { currentUser } from "@/lib/auth";
import { NavNavigation } from "./nav-navigation";

// This is sample data.

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const user = (await currentUser()) as ExtendedUser;
  return (
    <Sidebar {...props}>
      <SidebarHeader >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link
                href="/"
                className="flex items-center gap-2 py-5 justify-center"
              >
                <Home className="h-7 w-7 text-primary" />
                <span className="text-xl font-bold">IntereviewAI</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <div className="flex flex-col gap-3">

          <SearchForm />
          <Button asChild className="w-full justify-start gap-2">
          <Link href="/interview/new">
            <MessageSquare className="h-4 w-4" />
            <span>Start New Interview</span>
          </Link>
        </Button>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* <NavMain items={data.navMain} /> */}
        <NavNavigation/>
        <NavDocuments />
        <NavSecondary />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user}/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
