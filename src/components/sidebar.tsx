"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlobalSearch } from "@/components/global-search";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  CheckSquare,
  StickyNote,
  Settings,
  Search,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Master Data",
    href: "/master-data",
    icon: Package,
    children: [
      { name: "Produk", href: "/master-data/products" },
      { name: "Add-ons", href: "/master-data/addons" },
      { name: "Jasa H2H", href: "/master-data/h2h-services" },
    ],
  },
  {
    name: "Klien",
    href: "/clients",
    icon: Users,
  },
  {
    name: "Kontrak",
    href: "/contracts",
    icon: FileText,
  },
  {
    name: "Todo List",
    href: "/todos",
    icon: CheckSquare,
  },
  {
    name: "Catatan",
    href: "/notes",
    icon: StickyNote,
  },
  {
    name: "Pengaturan",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div className="flex h-full w-64 flex-col border-r bg-background">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-lg font-semibold">v-tax Management</h1>
        </div>
        <div className="p-4 border-b">
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            Cari... (Ctrl+K)
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
              {item.children && isActive && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => {
                    const isChildActive = pathname === child.href;
                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm transition-colors",
                          isChildActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {child.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        </nav>
        <div className="border-t p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tema</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">User</span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

