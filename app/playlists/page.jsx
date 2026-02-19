"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, ChevronRight } from "lucide-react";
import CreatePlaylistModal from "@/modules/playlists/components/create-playlist-modal";
import { toast } from "sonner";

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/playlists");
      const data = await response.json();

      if (data.success) {
        setPlaylists(data.playlists);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error loading playlists:", error);
      toast.error("Failed to load playlists");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (playlistId) => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;

    try {
      const response = await fetch("/api/playlists", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistId }),
      });

      const data = await response.json();

      if (data.success) {
        setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
        toast.success("Playlist deleted successfully");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast.error("Failed to delete playlist");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Loading playlists...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Playlists</h1>
          <p className="text-muted-foreground mt-2">
            Organize problems into custom playlists
          </p>
        </div>
        <CreatePlaylistModal onSuccess={() => loadPlaylists()} />
      </div>

      {playlists.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-16">
            <p className="text-muted-foreground mb-4">
              No playlists yet. Create one to get started!
            </p>
            <CreatePlaylistModal onSuccess={() => loadPlaylists()} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <Card key={playlist.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2">
                      {playlist.name}
                    </CardTitle>
                    {playlist.description && (
                      <CardDescription className="line-clamp-2">
                        {playlist.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge variant="secondary">
                    {playlist.problems?.length || 0} problems
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Link href={`/playlists/${playlist.id}`} className="flex-1">
                    <Button variant="default" className="w-full">
                      View
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(playlist.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
