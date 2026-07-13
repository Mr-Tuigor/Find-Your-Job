"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Briefcase,
  Upload,
  LayoutDashboard,
  LogOut,
  Shield,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: "/upload", label: "Upload", icon: Upload },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-btn">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="gradient-text">Find</span>
            <span className="text-foreground">YourJob</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {session &&
            navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button
                  variant={isActive(href) ? "secondary" : "ghost"}
                  size="sm"
                  className={`gap-2 ${
                    isActive(href) ? "bg-primary/10 text-primary" : ""
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              </Link>
            ))}

          {session && isAdmin && (
            <Link href="/admin">
              <Button
                variant={isActive("/admin") ? "secondary" : "ghost"}
                size="sm"
                className={`gap-2 ${
                  isActive("/admin") ? "bg-primary/10 text-primary" : ""
                }`}
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </Link>
          )}
        </div>

        {/* User Menu */}
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" className="relative h-9 w-9 rounded-full" />}
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                  {session.user?.name?.charAt(0)?.toUpperCase() ||
                    session.user?.email?.charAt(0)?.toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{session.user?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-red-400 focus:text-red-400 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="gradient-btn text-white border-0">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
