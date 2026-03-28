import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut, Dog } from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";
import { useNavigate, Link } from "react-router-dom";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  const navigate = useNavigate();
  const logout = useAuthStore(s => s.logout);
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className={className}>
        <header className="sticky top-0 z-30 w-full bg-background/95 backdrop-blur border-b-4 border-black h-20">
          <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="scale-125" />
              <Link to="/" className="hidden md:flex items-center gap-2 group">
                <div className="w-10 h-10 bg-playful-pink border-2 border-black rounded-xl shadow-solid-sm flex items-center justify-center group-hover:rotate-6 transition-transform">
                  <Dog className="w-6 h-6 text-white" strokeWidth={3} />
                </div>
                <span className="text-xl font-black tracking-tighter italic">FLU<span className="text-playful-pink">FFY</span></span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle className="hover:bg-playful-yellow/20" />
              <Button 
                onClick={handleLogout}
                className="playful-btn bg-playful-pink text-white flex items-center gap-2 h-12 px-6 border-black shadow-solid hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-solid-sm active:scale-95"
              >
                <LogOut size={18} strokeWidth={3} />
                <span className="hidden sm:inline">Log Out</span>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1">
          {container ? (
            <div className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12" + (contentClassName ? ` ${contentClassName}` : "")}>
              {children}
            </div>
          ) : (
            children
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}