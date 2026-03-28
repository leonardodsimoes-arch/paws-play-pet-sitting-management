import React from "react";
import { Home, Heart, Dog, CreditCard, LayoutDashboard, Star, LogOut, User as UserIcon, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/use-auth-store";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const userName = useAuthStore(s => s.user?.name);
  const userRole = useAuthStore(s => s.user?.role);
  const logout = useAuthStore(s => s.logout);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const handleLogout = () => {
    logout();
    navigate('/');
  };
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
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/"}>
                <Link to="/" className="font-bold py-6 px-4 flex gap-3">
                  <Home className="h-5 w-5" /> <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isAuthenticated && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === "/dashboard"}>
                    <Link to="/dashboard" className="font-bold py-6 px-4 flex gap-3">
                      <Heart className="h-5 w-5" /> <span>My Pack</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {userRole === 'admin' && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === "/admin"}>
                        <Link to="/admin" className="font-bold py-6 px-4 flex gap-3">
                          <LayoutDashboard className="h-5 w-5" /> <span>Admin Hub</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === "/admin/clients"}>
                        <Link to="/admin/clients" className="font-bold py-6 px-4 flex gap-3">
                          <Users className="h-5 w-5" /> <span>Client Roster</span>
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
                  </>
                )}
              </>
            )}
            {!isAuthenticated && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/login"}>
                  <Link to="/login" className="font-bold py-6 px-4 flex gap-3">
                    <UserIcon className="h-5 w-5" /> <span>Login</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
        {isAuthenticated && (
          <>
            <SidebarSeparator className="my-4 bg-black/10 h-1" />
            <SidebarGroup>
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
          </>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t-4 border-black/5">
        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded-2xl shadow-solid-sm">
              <div className="h-10 w-10 rounded-full bg-playful-yellow border-2 border-black flex items-center justify-center font-black">
                {userName?.[0]}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-black truncate leading-tight">{userName}</p>
                <p className="text-[10px] font-black uppercase text-playful-blue tracking-tighter">{userRole}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-2 border-black font-black hover:bg-playful-pink hover:text-white transition-colors h-10 rounded-xl flex items-center justify-center gap-2"
            >
              <LogOut size={16} /> Logout
            </Button>
          </div>
        ) : (
          <div className="p-2">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Version 1.0.0</p>
            <p className="text-xs font-bold text-playful-blue">Fluffy &copy; 2024</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}