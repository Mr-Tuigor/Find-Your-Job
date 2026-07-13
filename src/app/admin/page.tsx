"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  FileText,
  Search as SearchIcon,
  Loader2,
  Crown,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
  _count: { resumes: number };
}

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  useEffect(() => {
    if (session && !isAdmin) {
      router.push("/dashboard");
      return;
    }

    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setUsers(data.users);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (isAdmin) fetchUsers();
  }, [session, isAdmin, router]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error);
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: newRole as "USER" | "ADMIN" } : u
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const totalResumes = users.reduce((sum, u) => sum + u._count.resumes, 0);
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage users and roles</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<Users className="h-5 w-5 text-blue-400" />}
          label="Total Users"
          value={users.length}
        />
        <StatCard
          icon={<FileText className="h-5 w-5 text-emerald-400" />}
          label="Total Resumes"
          value={totalResumes}
        />
        <StatCard
          icon={<Crown className="h-5 w-5 text-amber-400" />}
          label="Admins"
          value={adminCount}
        />
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">
                  User
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">
                  Email
                </th>
                <th className="text-center text-xs font-semibold text-muted-foreground p-4">
                  Resumes
                </th>
                <th className="text-center text-xs font-semibold text-muted-foreground p-4">
                  Role
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">
                        {user.name || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {user.email}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant="secondary" className="text-xs">
                      {user._count.resumes}
                    </Badge>
                  </td>
                  <td className="p-4 text-center">
                    <Select
                      value={user.role}
                      onValueChange={(val) => handleRoleChange(user.id, val as string)}
                    >
                      <SelectTrigger className="w-28 h-8 mx-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}
