'use server';

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

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
