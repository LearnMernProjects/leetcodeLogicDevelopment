'use server';

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function currentUserRole() {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }

  const dbUser = await db.user.findUnique({
    where: {
      clerkId: user.id,
    },
  });

  return dbUser?.role || null;
}

export async function onBoardUser() {
  const user = await currentUser();
  
  if (!user) {
    return;
  }

  const userExists = await db.user.findUnique({
    where: {
      clerkId: user.id,
    },
  });

  if (userExists) {
    return userExists;
  }

  const newUser = await db.user.create({
    data: {
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    },
  });

  return newUser;
}

export async function ensureUserInDatabase() {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }

  const dbUser = await db.user.findUnique({
    where: {
      clerkId: user.id,
    },
  });

  if (dbUser) {
    return dbUser;
  }

  // Create user if doesn't exist
  return onBoardUser();
}

export async function setUserRole(email, role) {
  try {
    const user = await currentUser();
    
    // Check if current user is admin
    const currentUserRole = await currentUserRole();
    if (currentUserRole !== "ADMIN") {
      return { success: false, error: "Only admins can change user roles" };
    }

    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role)) {
      return { success: false, error: `Invalid role. Must be one of: ${validRoles.join(", ")}` };
    }

    const updatedUser = await db.user.update({
      where: { email },
      data: { role }
    });

    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("Error setting user role:", error);
    return { success: false, error: error.message };
  }
}
