import {
  ChartColumn,
  Crosshair,
  LayoutDashboard,
  ListOrdered,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/arsenal", label: "Arsenal", icon: Crosshair },
  { href: "/roadmap", label: "Roadmap", icon: ListOrdered },
  { href: "/analytics", label: "Analytics", icon: ChartColumn },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function isNavActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
