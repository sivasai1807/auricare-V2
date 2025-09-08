import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Search, Clock, Eye, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LearningVideo {
  id: string;
  title: string;
  description: string;
  category: string;
  video_url: string;
  thumbnail_url?: string;
  duration: string;
  views: number;
  created_at: string;
}

export function LearningHub() {
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<LearningVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, searchTerm, selectedCategory]);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching learning videos:', error);
      // Set sample data if fetch fails
      const sampleVideos: LearningVideo[] = [
        {
          id: '1',
          title: 'Introduction to Cardiology',
          description: 'Basic concepts and procedures in cardiology',
          category: 'Medical Education',
          video_url: 'https://example.com/video1',
          duration: '15:30',
          views: 1250,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Neurological Assessment Techniques',
          description: 'Comprehensive guide to neurological examinations',
          category: 'Medical Education',
          video_url: 'https://example.com/video2',
          duration: '22:45',
          views: 890,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Pediatric Care Best Practices',
          description: 'Essential practices for pediatric healthcare',
          category: 'Medical Education',
          video_url: 'https://example.com/video3',
          duration: '18:20',
          views: 1100,
          created_at: new Date().toISOString()
        }
      ];
      setVideos(sampleVideos);
    } finally {
      setLoading(false);
    }
  };

  const filterVideos = () => {
    let filtered = videos;

    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(video => video.category === selectedCategory);
    }

    setFilteredVideos(filtered);
  };

  const categories = ['All', ...Array.from(new Set(videos.map(video => video.category)))];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Medical Education':
        return 'bg-blue-100 text-blue-800';
      case 'Emergency Medicine':
        return 'bg-red-100 text-red-800';
      case 'Soft Skills':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-500">Loading learning content...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Learning Hub
        </h1>
        <p className="text-gray-600 mt-2">Enhance your medical knowledge with our educational content</p>
      </div>

      {/* Search and Filter */}
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
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="bg-white/50"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="text-center py-12">
            <BookOpen className="size-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Videos Found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getCategoryColor(video.category)}>
                      {video.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Eye className="size-3" />
                      {video.views.toLocaleString()}
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
                      <span>{video.duration}</span>
                    </div>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <Play className="size-4 mr-2" />
                      Watch
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}