import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center gap-4 border-b bg-card/80 backdrop-blur-md px-4 md:px-6 sticky top-0 z-20">
            <SidebarTrigger className="text-foreground" />
            <div className="flex-1">
              <h1 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                BasketBeats <span className="text-primary">/</span> Admin Console
              </h1>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
