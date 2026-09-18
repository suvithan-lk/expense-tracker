export const navigationItems = [
  { label: "Dashboard", href: "/dashboard", icon: "grid" },
  { label: "Income", href: "/income", icon: "arrow-up" },
  { label: "Expenses", href: "/expenses", icon: "arrow-down" },
  { label: "Budgets", href: "/budgets", icon: "target" },
  { label: "Reports", href: "/reports", icon: "chart" },
  { label: "Settings", href: "/settings", icon: "settings" },
] as const;

export type NavigationIcon = (typeof navigationItems)[number]["icon"];
