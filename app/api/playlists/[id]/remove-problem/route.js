import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const user = await currentUser();
    const playlistId = params.id;

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const { problemId } = await request.json();

    if (!problemId) {
      return NextResponse.json(
        { success: false, error: "Problem ID is required" },
        { status: 400 }
      );
    }

    // Verify playlist ownership
    const playlist = await db.playlist.findFirst({
      where: {
        id: playlistId,
        userId: dbUser.id,
      },
    });

    if (!playlist) {
      return NextResponse.json(
        { success: false, error: "Playlist not found or unauthorized" },
        { status: 404 }
      );
    }

    // Remove problem from playlist
    await db.problemInPlaylist.deleteMany({
      where: {
        playlistId,
        problemId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Problem removed from playlist",
    });
  } catch (error) {
    console.error("Error removing problem from playlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove problem from playlist" },
      { status: 500 }
    );
  }
}
