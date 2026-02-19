"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Difficulty, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const difficultyColors = {
  EASY: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HARD: "bg-red-100 text-red-800",
};

export default function PlaylistDetailPage() {
  const params = useParams();
  const playlistId = params.id;
  const [playlist, setPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlaylist();
  }, [playlistId]);

  const loadPlaylist = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/playlists/${playlistId}`);
      const data = await response.json();

      if (data.success) {
        setPlaylist(data.playlist);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error loading playlist:", error);
      toast.error("Failed to load playlist");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveProblem = async (problemId) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/remove-problem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId }),
      });

      const data = await response.json();

      if (data.success) {
        setPlaylist((prev) => ({
          ...prev,
          problems: prev.problems.filter((p) => p.problemId !== problemId),
        }));
        toast.success("Problem removed from playlist");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error removing problem:", error);
      toast.error("Failed to remove problem");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Loading playlist...</div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Playlist not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Link href="/playlists">
        <Button variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Playlists
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{playlist.name}</h1>
        {playlist.description && (
          <p className="text-muted-foreground mt-2">{playlist.description}</p>
        )}
        <Badge variant="secondary" className="mt-4">
          {playlist.problems?.length || 0} problems
        </Badge>
      </div>

      {playlist.problems && playlist.problems.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-16">
            <p className="text-muted-foreground mb-4">
              No problems in this playlist yet.
            </p>
            <Link href="/problems">
              <Button>Browse Problems</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {playlist.problems?.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      {item.problem?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.problem?.description}
                    </p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Badge
                        className={difficultyColors[item.problem?.difficulty]}
                      >
                        {item.problem?.difficulty}
                      </Badge>
                      {item.problem?.tags?.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/problem/${item.problem?.id}`}>
                      <Button size="sm">Solve</Button>
                    </Link>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveProblem(item.problemId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
