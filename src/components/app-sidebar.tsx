import React from "react";
import { Home, Layers, Compass, Star, Settings, LifeBuoy, Heart, Dog, CreditCard, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarSeparator,
  SidebarInput,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  return (
    <Sidebar className="border-r-4 border-black">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="h-12 w-12 rounded-2xl bg-playful-pink border-4 border-black shadow-solid-sm flex items-center justify-center rotate-3">
            <Dog className="h-7 w-7 text-white" strokeWidth={3} />
          </div>
          <span className="text-2xl font-black tracking-tighter italic">FLU<span className="text-playful-pink">FFY</span></span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-black text-xs uppercase text-muted-foreground px-4 mb-2">Main Menu</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/"}>
                <Link to="/" className="font-bold py-6 px-4 flex gap-3">
                  <Home className="h-5 w-5" /> <span>Landing</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/dashboard"}>
                <Link to="/dashboard" className="font-bold py-6 px-4 flex gap-3">
                  <Heart className="h-5 w-5" /> <span>My Pack</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/admin"}>
                <Link to="/admin" className="font-bold py-6 px-4 flex gap-3">
                  <LayoutDashboard className="h-5 w-5" /> <span>Admin Hub</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/admin/billing"}>
                <Link to="/admin/billing" className="font-bold py-6 px-4 flex gap-3">
                  <CreditCard className="h-5 w-5" /> <span>Fluffy Billing</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator className="my-4 bg-black/10 h-1" />
        <SidebarGroup>
          <SidebarGroupLabel className="font-black text-xs uppercase text-muted-foreground px-4 mb-2">Quick Actions</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/book" className="font-bold py-6 px-4 flex gap-3 text-playful-pink">
                  <Star className="h-5 w-5 fill-playful-pink" /> <span>New Booking</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-6 border-t-4 border-black/5">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Version 1.0.0</p>
          <p className="text-xs font-bold text-playful-blue">Fluffy &copy; 2024</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}