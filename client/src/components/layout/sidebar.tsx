import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Package,
  Receipt,
  DollarSign,
  CreditCard,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const sidebarNavItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "Inventory",
    icon: Package,
    href: "/inventory",
  },
  {
    title: "Transactions",
    icon: Receipt,
    href: "/transactions",
  },
  {
    title: "Debts",
    icon: CreditCard,
    href: "/debts",
  },
  {
    title: "Expenses",
    icon: DollarSign,
    href: "/expenses",
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  return (
    <div className="flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6" />
          <span>POS System</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-2 py-2">
        <nav className="grid gap-1">
          {sidebarNavItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <Button
                variant={location === item.href ? "secondary" : "ghost"}
                className={cn("w-full justify-start gap-2", {
                  "bg-sidebar-accent text-sidebar-accent-foreground":
                    location === item.href,
                })}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t p-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
