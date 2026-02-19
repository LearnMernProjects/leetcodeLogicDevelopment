"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { ensureUserInDatabase } from "@/modules/auth/actions";

export async function getAllPlaylists() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return [];

    const dbUser = await ensureUserInDatabase();
    if (!dbUser) return [];

    const playlists = await db.playlist.findMany({
      where: { userId: dbUser.id },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return playlists;
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return [];
  }
}

export async function getPlaylistById(playlistId) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) throw new Error("Not authenticated");

    const dbUser = await ensureUserInDatabase();
    if (!dbUser) throw new Error("User not found");

    const playlist = await db.playlist.findFirst({
      where: {
        id: playlistId,
        userId: dbUser.id,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    if (!playlist) throw new Error("Playlist not found");
    return playlist;
  } catch (error) {
    console.error("Error fetching playlist:", error);
    throw error;
  }
}

export async function createPlaylist(data) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) throw new Error("Not authenticated");

    const dbUser = await ensureUserInDatabase();
    if (!dbUser) throw new Error("User not found");

    const playlist = await db.playlist.create({
      data: {
        name: data.name,
        description: data.description || null,
        userId: dbUser.id,
      },
    });

    return playlist;
  } catch (error) {
    console.error("Error creating playlist:", error);
    throw error;
  }
}

export async function updatePlaylist(playlistId, data) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) throw new Error("Not authenticated");

    const dbUser = await ensureUserInDatabase();
    if (!dbUser) throw new Error("User not found");

    // Verify ownership
    const playlist = await db.playlist.findFirst({
      where: { id: playlistId, userId: dbUser.id },
    });

    if (!playlist) throw new Error("Playlist not found or unauthorized");

    const updated = await db.playlist.update({
      where: { id: playlistId },
      data: {
        name: data.name || undefined,
        description: data.description || undefined,
      },
    });

    return updated;
  } catch (error) {
    console.error("Error updating playlist:", error);
    throw error;
  }
}

export async function deletePlaylist(playlistId) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) throw new Error("Not authenticated");

    const dbUser = await ensureUserInDatabase();
    if (!dbUser) throw new Error("User not found");

    // Verify ownership
    const playlist = await db.playlist.findFirst({
      where: { id: playlistId, userId: dbUser.id },
    });

    if (!playlist) throw new Error("Playlist not found or unauthorized");

    await db.playlist.delete({
      where: { id: playlistId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting playlist:", error);
    throw error;
  }
}

export async function removeProblemFromPlaylist(playlistId, problemId) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) throw new Error("Not authenticated");

    const dbUser = await ensureUserInDatabase();
    if (!dbUser) throw new Error("User not found");

    // Verify ownership
    const playlist = await db.playlist.findFirst({
      where: { id: playlistId, userId: dbUser.id },
    });

    if (!playlist) throw new Error("Playlist not found or unauthorized");

    await db.problemInPlaylist.deleteMany({
      where: {
        playlistId,
        problemId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing problem from playlist:", error);
    throw error;
  }
}
