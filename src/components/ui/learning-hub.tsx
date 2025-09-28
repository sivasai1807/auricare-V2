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
import {Search, Eye, BookOpen, X, Play} from "lucide-react";
import {toast} from "@/hooks/use-toast";

type LearningVideo = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  views?: number;
  youtube_url?: string;
  manual_file?: string; // local file URL
  thumbnail?: string; // thumbnail data URL
};

// YouTube videos with proper titles
const sampleYouTubeVideos: {url: string; title: string}[] = [
  {
    url: "https://www.youtube.com/watch?v=_snimIOTp9o",
    title: "Introduction to Cardiology",
  },
  {
    url: "https://www.youtube.com/watch?v=tD5QlyV-CvQ",
    title: "Emergency Medicine Basics",
  },
  {
    url: "https://www.youtube.com/watch?v=d2mlWUzA0B4",
    title: "Soft Skills for Doctors",
  },
  {
    url: "https://www.youtube.com/watch?v=w9zISG3BFBs",
    title: "Medical Ethics Overview",
  },
];

const LOCAL_STORAGE_KEY = "learningHubVideos";

const getYouTubeEmbedURL = (url: string) => {
  const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return videoIdMatch
    ? `https://www.youtube.com/embed/${videoIdMatch[1]}`
    : url;
};

const getYouTubeThumbnail = (url: string) => {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "";
};

// Extract first frame of manual video for thumbnail
const generateVideoThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    // Wait until we can seek to the first frame
    video.addEventListener("loadedmetadata", () => {
      // Seek to 0.1s to ensure first frame is not blank
      video.currentTime = 0.1;
    });

    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    });

    video.addEventListener("error", (e) => reject(e));
  });
};
export function LearningHub({readOnly = false}: {readOnly?: boolean}) {
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<LearningVideo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [uploadType, setUploadType] = useState<"manual" | "youtube">("manual");
  const [newVideo, setNewVideo] = useState<{
    title: string;
    description: string;
    youtube_url: string;
    file: File | null;
  }>({title: "", description: "", youtube_url: "", file: null});
  const [modalVideo, setModalVideo] = useState<LearningVideo | null>(null);

  // Load videos on mount
  useEffect(() => {
    const savedVideosStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedVideos: LearningVideo[] = savedVideosStr
      ? JSON.parse(savedVideosStr)
      : [];

    const ytVideos: LearningVideo[] = sampleYouTubeVideos.map((item, i) => ({
      id: `yt-${i}`,
      title: item.title,
      description: "Educational video",
      youtube_url: item.url,
      category: "YouTube",
      views: Math.floor(Math.random() * 5000),
      thumbnail: getYouTubeThumbnail(item.url),
    }));

    setVideos([...ytVideos, ...savedVideos]);
  }, []);

  // Save manual videos only if not read-only
  useEffect(() => {
    if (!readOnly) {
      const localVideos = videos.filter((v) => v.manual_file);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localVideos));
    }
  }, [videos, readOnly]);

  // Filter videos
  useEffect(() => {
    let filtered = videos;
    if (searchTerm) {
      filtered = filtered.filter((video) =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (video) => video.category === selectedCategory
      );
    }
    setFilteredVideos(filtered);
  }, [videos, searchTerm, selectedCategory]);

  const categories = [
    "All",
    ...Array.from(new Set(videos.map((v) => v.category || "General"))),
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Medical Education":
        return "bg-blue-100 text-blue-800";
      case "Emergency Medicine":
        return "bg-red-100 text-red-800";
      case "Soft Skills":
        return "bg-green-100 text-green-800";
      case "YouTube":
        return "bg-yellow-100 text-yellow-800";
      case "Manual":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddManualVideo = async () => {
    if (!newVideo.title || !newVideo.file) return;
    const fileURL = URL.createObjectURL(newVideo.file);
    const thumbnail = await generateVideoThumbnail(newVideo.file);
    const manualVideo: LearningVideo = {
      id: `manual-${Date.now()}`,
      title: newVideo.title,
      description: newVideo.description,
      category: "Manual",
      views: 0,
      manual_file: fileURL,
      thumbnail,
    };
    setVideos((prev) => [...prev, manualVideo]);
    setNewVideo({title: "", description: "", youtube_url: "", file: null});
    toast({title: "Added", description: "Manual video added"});
  };

  const handleAddYouTubeVideo = () => {
    if (!newVideo.title || !newVideo.youtube_url) return;
    const ytVideo: LearningVideo = {
      id: `yt-${Date.now()}`,
      title: newVideo.title,
      description: newVideo.description,
      youtube_url: newVideo.youtube_url,
      category: "YouTube",
      views: 0,
      thumbnail: getYouTubeThumbnail(newVideo.youtube_url),
    };
    setVideos((prev) => [...prev, ytVideo]);
    setNewVideo({title: "", description: "", youtube_url: "", file: null});
    toast({title: "Added", description: "YouTube video added"});
  };

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Learning Hub
        </h1>
      </div>

      {/* Search + Filter */}
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

          {/* Upload Section - hidden in readOnly mode */}
          {!readOnly && (
            <div className="mt-4">
              <div className="flex gap-2 mb-2">
                <Button
                  size="sm"
                  variant={uploadType === "manual" ? "default" : "outline"}
                  onClick={() => setUploadType("manual")}
                >
                  Manual Upload
                </Button>
                <Button
                  size="sm"
                  variant={uploadType === "youtube" ? "default" : "outline"}
                  onClick={() => setUploadType("youtube")}
                >
                  YouTube Upload
                </Button>
              </div>

              {uploadType === "manual" ? (
                <div className="grid gap-2 sm:grid-cols-3">
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
                  <Button onClick={handleAddManualVideo}>Add Video</Button>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="YouTube URL"
                    value={newVideo.youtube_url}
                    onChange={(e) =>
                      setNewVideo((v) => ({
                        ...v,
                        youtube_url: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Title"
                    value={newVideo.title}
                    onChange={(e) =>
                      setNewVideo((v) => ({...v, title: e.target.value}))
                    }
                  />
                  <Button onClick={handleAddYouTubeVideo}>
                    Add YouTube Video
                  </Button>
                </div>
              )}
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
                <CardContent className="flex flex-col gap-2">
                  <div
                    className="relative w-full rounded-md overflow-hidden cursor-pointer"
                    onClick={() => setModalVideo(video)}
                  >
                    {video.thumbnail ? (
                      <>
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="text-white size-10" />
                        </div>
                      </>
                    ) : null}
                  </div>

                  {/* Delete only visible if not readOnly */}
                  {!readOnly && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("Delete this video?")) {
                          setVideos((prev) =>
                            prev.filter((v) => v.id !== video.id)
                          );
                          toast({
                            title: "Deleted",
                            description: "Video removed",
                          });
                        }
                      }}
                    >
                      Delete
                    </Button>
                  )}
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
                autoPlay
              />
            ) : null}
          </div>
        </div>
      )}
    </motion.div>
  );
}
