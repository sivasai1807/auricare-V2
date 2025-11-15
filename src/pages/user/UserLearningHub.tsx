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
import {Input} from "@/components/ui/input";
import {Search, Eye, BookOpen, X, Play} from "lucide-react";
import {useRoleAuth} from "@/hooks/useRoleAuth";
import {listUserDoctorVideos, type Video} from "@/lib/supabase/videos";
import {supabase} from "@/integrations/supabase/client";

const getYouTubeThumbnail = (url: string) => {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "";
};

const getCategoryColor = (category?: string) => {
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

const UserLearningHub = () => {
  const {user} = useRoleAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [modalVideo, setModalVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadVideos = async () => {
      setLoading(true);
      try {
        const doctorVideos = await listUserDoctorVideos(user.id);
        setVideos(doctorVideos);
        localStorage.setItem(
          "user_learning_videos",
          JSON.stringify(doctorVideos)
        );
      } catch (err) {
        console.error(err);
        const saved = localStorage.getItem("user_learning_videos");
        if (saved) setVideos(JSON.parse(saved));
      } finally {
        setLoading(false);
      }
    };

    loadVideos();

    const channel = supabase
      .channel(`user-videos-${user.id}`)
      .on(
        "postgres_changes",
        {event: "*", schema: "public", table: "learning_videos"},
        () => loadVideos()
      )
      .subscribe();

    return () => channel.unsubscribe();
  }, [user]);

  useEffect(() => {
    let filtered = videos;
    if (searchTerm) {
      filtered = filtered.filter((video) =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (video) => (video.category || "General") === selectedCategory
      );
    }
    setFilteredVideos(filtered);
  }, [videos, searchTerm, selectedCategory]);

  const categories = [
    "All",
    ...Array.from(new Set(videos.map((v) => v.category || "General"))),
  ];
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-500">Loading videos...</div>
      </div>
    );

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
        <p className="text-gray-600 mt-2">Videos uploaded by your doctors</p>
      </div>

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
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    selectedCategory === c
                      ? "bg-blue-600 text-white"
                      : "bg-white/50 border"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredVideos.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="text-center py-12">
            <BookOpen className="size-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Videos Available
            </h3>
            <p className="text-gray-500">
              Your doctors haven't uploaded any videos yet.
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
                    <Badge className={getCategoryColor(video.category)}>
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
                    {video.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <div
                    className="relative w-full rounded-md overflow-hidden cursor-pointer"
                    onClick={() => setModalVideo(video)}
                  >
                    {video.thumbnail_url ? (
                      <>
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="text-white size-10" />
                        </div>
                      </>
                    ) : video.video_url &&
                      video.video_url.includes("youtube") ? (
                      <>
                        <img
                          src={getYouTubeThumbnail(video.video_url)}
                          alt={video.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="text-white size-10" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <Play className="text-gray-400 size-10" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {modalVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-md max-w-3xl w-full p-4 relative">
            <button
              className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded"
              onClick={() => setModalVideo(null)}
            >
              <X />
            </button>
            <h2 className="text-xl font-semibold mb-4">{modalVideo.title}</h2>
            <p className="mb-4">{modalVideo.description || "No description"}</p>
            {modalVideo.video_url?.includes("youtube") ? (
              <div className="relative pt-[56.25%] w-full">
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-md"
                  src={
                    modalVideo.video_url.includes("youtube")
                      ? `https://www.youtube.com/embed/${
                          (modalVideo.video_url.match(
                            /(?:v=|\/)([0-9A-Za-z_-]{11})/
                          ) || [])[1]
                        }`
                      : modalVideo.video_url
                  }
                  title={modalVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <video
                className="w-full rounded-md"
                src={modalVideo.video_url || undefined}
                controls
                autoPlay
              />
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UserLearningHub;
