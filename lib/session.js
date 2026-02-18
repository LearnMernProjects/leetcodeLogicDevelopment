import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const currentUserRole = async () => {
  try {
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
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};
