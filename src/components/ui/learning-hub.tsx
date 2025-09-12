import {useState, useEffect} from "react";
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
import {Input} from "@/components/ui/input";
import {Play, Search, Clock, Eye, BookOpen} from "lucide-react";
import {getCurrentDoctor} from "@/lib/supabase/doctors";
import {
  listDoctorVideosByUploader,
  uploadDoctorVideo,
  updateVideo,
  deleteVideo,
  type Video,
} from "@/lib/supabase/videos";
import {useRoleAuth} from "@/hooks/useRoleAuth";
import {toast} from "@/hooks/use-toast";

type LearningVideo = Video & {
  category?: string;
  duration?: string;
  views?: number;
};

export function LearningHub() {
  const {userRole} = useRoleAuth();
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<LearningVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [uploading, setUploading] = useState(false);
  const [newVideo, setNewVideo] = useState<{
    title: string;
    description: string;
    file: File | null;
  }>({title: "", description: "", file: null});

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, searchTerm, selectedCategory]);

  const fetchVideos = async () => {
    try {
      const data = await listDoctorVideosByUploader();
      setVideos(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching learning videos:", error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const filterVideos = () => {
    let filtered = videos;

    if (searchTerm) {
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (video) => video.category === selectedCategory
      );
    }

    setFilteredVideos(filtered);
  };

  const categories = [
    "All",
    ...Array.from(new Set(videos.map((video) => video.category || "General"))),
  ] as string[];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Medical Education":
        return "bg-blue-100 text-blue-800";
      case "Emergency Medicine":
        return "bg-red-100 text-red-800";
      case "Soft Skills":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-500">
          Loading learning content...
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      className="space-y-6"
    >
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Learning Hub
        </h1>
        <p className="text-gray-600 mt-2">
          Enhance your medical knowledge with our educational content
        </p>
      </div>

      {/* Search, Filter, and Upload (doctors only) */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/50"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="bg-white/50"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          {userRole === "doctor" && (
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <Input
                placeholder="Title"
                value={newVideo.title}
                onChange={(e) =>
                  setNewVideo((v) => ({...v, title: e.target.value}))
                }
              />
              <Input
                placeholder="Description"
                value={newVideo.description}
                onChange={(e) =>
                  setNewVideo((v) => ({...v, description: e.target.value}))
                }
              />
              <input
                type="file"
                accept="video/*"
                onChange={(e) =>
                  setNewVideo((v) => ({
                    ...v,
                    file: e.target.files?.[0] || null,
                  }))
                }
              />
              <Button
                disabled={uploading || !newVideo.title || !newVideo.file}
                onClick={async () => {
                  try {
                    setUploading(true);
                    const owner = (await getCurrentDoctor())?.id || "public";
                    await uploadDoctorVideo(
                      owner,
                      newVideo.file as File,
                      newVideo.title,
                      newVideo.description
                    );
                    setNewVideo({title: "", description: "", file: null});
                    toast({
                      title: "Uploaded",
                      description: "Video uploaded successfully",
                    });
                    fetchVideos();
                  } catch (e: any) {
                    toast({
                      title: "Upload failed",
                      description: e?.message || "Error uploading video",
                      variant: "destructive",
                    });
                  } finally {
                    setUploading(false);
                  }
                }}
              >
                Upload
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="text-center py-12">
            <BookOpen className="size-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Videos Found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
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
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge
                      className={getCategoryColor(video.category || "General")}
                    >
                      {video.category || "General"}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Eye className="size-3" />
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="size-4" />
                      <span>{video.duration || "--:--"}</span>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <a
                        href={video.video_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Play className="size-4 mr-2" />
                        Watch
                      </a>
                    </Button>
                  </div>
                  {userRole === "doctor" && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const title =
                            prompt("New title", video.title) || video.title;
                          const description =
                            prompt(
                              "New description",
                              video.description || ""
                            ) ||
                            video.description ||
                            "";
                          try {
                            await updateVideo(video.id, {title, description});
                            toast({
                              title: "Updated",
                              description: "Video updated",
                            });
                            fetchVideos();
                          } catch (e: any) {
                            toast({
                              title: "Update failed",
                              description: e?.message || "Error",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          if (!confirm("Delete this video?")) return;
                          try {
                            await deleteVideo(video.id, video.video_url);
                            toast({
                              title: "Deleted",
                              description: "Video deleted",
                            });
                            fetchVideos();
                          } catch (e: any) {
                            toast({
                              title: "Delete failed",
                              description: e?.message || "Error",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
