import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { resumes: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ users });
  } catch (error) {
    console.error("Admin users error:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, newRole } = body;

    if (!userId || !["USER", "ADMIN"].includes(newRole)) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    // Prevent self-demotion
    if (userId === session.user.id && newRole !== "ADMIN") {
      return Response.json(
        { error: "You cannot remove your own admin role" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, email: true, role: true },
    });

    return Response.json({ user: updatedUser });
  } catch (error) {
    console.error("Admin update error:", error);
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }
}
