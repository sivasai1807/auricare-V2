"use client";

import React, {useEffect, useState} from "react";
import {motion} from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Play, X, Eye, BookOpen} from "lucide-react";

type Video = {
  id: string;
  title: string;
  description: string;
  category?: string;
  views?: number;
  youtube_url?: string;
  manual_file?: string;
  thumbnail?: string;
};

function getYouTubeEmbedURL(url: string) {
  const videoId = new URL(url).searchParams.get("v");
  return `https://www.youtube.com/embed/${videoId}`;
}

function getCategoryColor(category: string) {
  switch (category.toLowerCase()) {
    case "education":
      return "bg-blue-100 text-blue-800";
    case "health":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export const ReadOnlyLearningHub: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [modalVideo, setModalVideo] = useState<Video | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const storedVideos = JSON.parse(
      localStorage.getItem("learning_videos") || "[]"
    );
    setVideos(storedVideos);
  }, []);

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div className="space-y-6">
      {/* Search */}
      <input
        type="text"
        placeholder="Search videos..."
        className="w-full border rounded-md px-3 py-2"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* No videos */}
      {filteredVideos.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl text-center py-12">
          <CardContent>
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Videos Available
            </h3>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => (
            <motion.div
              key={video.id}
              initial={{opacity: 0, scale: 0.9}}
              animate={{opacity: 1, scale: 1}}
              transition={{duration: 0.3}}
            >
              <Card
                className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => setModalVideo(video)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge
                      className={getCategoryColor(video.category || "General")}
                    >
                      {video.category || "General"}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Eye className="w-3 h-3" />
                      {(video.views || 0).toLocaleString()}
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {video.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {video.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {video.thumbnail ? (
                    <div className="relative w-full rounded-md overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="text-white w-10 h-10" />
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-md max-w-3xl w-full p-4 relative">
            <Button
              className="absolute top-2 right-2"
              size="sm"
              variant="outline"
              onClick={() => setModalVideo(null)}
            >
              <X />
            </Button>
            <h2 className="text-xl font-semibold mb-4">{modalVideo.title}</h2>
            <p className="mb-4">{modalVideo.description}</p>
            {modalVideo.youtube_url ? (
              <div className="relative pt-[56.25%] w-full">
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-md"
                  src={getYouTubeEmbedURL(modalVideo.youtube_url)}
                  title={modalVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : modalVideo.manual_file ? (
              <video
                className="w-full rounded-md"
                src={modalVideo.manual_file}
                controls
              />
            ) : null}
          </div>
        </div>
      )}
    </motion.div>
  );
};
