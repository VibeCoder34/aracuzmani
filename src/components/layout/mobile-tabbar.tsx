"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, GitCompare, User } from "lucide-react";
import { cn } from "@/lib/cn";

const tabs = [
  { name: "Ana Sayfa", href: "/", icon: Home },
  { name: "Araçlar", href: "/cars", icon: Search },
  { name: "Karşılaştır", href: "/compare", icon: GitCompare },
  { name: "Profil", href: "/profile", icon: User },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || 
            (tab.href !== "/" && pathname.startsWith(tab.href));
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

