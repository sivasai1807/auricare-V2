import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, TrendingUp } from 'lucide-react';

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NewsArticleModal } from '@/components/ui/news-article-modal';

const News = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('published_date', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (article: any) => {
    setSelectedArticle(article);
    setModalOpen(true);
  };

  const newsArticles = [
    {
      id: 1,
      title: "Revolutionary AI-Powered Health Monitoring System Launched",
      excerpt: "New breakthrough in personalized healthcare monitoring using artificial intelligence to predict health issues before they occur.",
      author: "Dr. Sarah Johnson",
      date: "2024-01-15",
      category: "Technology",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "Telemedicine Adoption Reaches All-Time High",
      excerpt: "Healthcare providers worldwide report unprecedented adoption rates of telemedicine services, improving patient access to care.",
      author: "Michael Chen",
      date: "2024-01-12",
      category: "Healthcare",
      readTime: "3 min read"
    },
    {
      id: 3,
      title: "Mental Health Support Through Digital Platforms",
      excerpt: "Study shows significant improvement in patient outcomes when using digital mental health support platforms alongside traditional therapy.",
      author: "Dr. Emily Rodriguez",
      date: "2024-01-10",
      category: "Mental Health",
      readTime: "7 min read"
    },
    {
      id: 4,
      title: "Breakthrough in Personalized Medicine",
      excerpt: "Researchers develop new methods for creating personalized treatment plans based on individual genetic profiles and health data.",
      author: "Prof. David Kim",
      date: "2024-01-08",
      category: "Research",
      readTime: "6 min read"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technology':
        return 'bg-blue-100 text-blue-800';
      case 'Healthcare':
        return 'bg-green-100 text-green-800';
      case 'Mental Health':
        return 'bg-purple-100 text-purple-800';
      case 'Research':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="text-center">
        <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Healthcare News & Updates
        </h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Stay informed with the latest developments in healthcare technology, research, and patient care innovations.
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="size-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">Featured Story</h2>
                <p className="text-gray-600">Latest breakthrough in healthcare technology</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={containerVariants}
        className="grid gap-6 md:grid-cols-2"
      >
        {(articles.length > 0 ? articles : newsArticles).map((article) => (
          <motion.div key={article.id} variants={itemVariants}>
            <Card 
              className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 h-full cursor-pointer"
              onClick={() => handleArticleClick(article)}
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getCategoryColor(article.category)}>
                    {article.category}
                  </Badge>
                  <span className="text-xs text-gray-500">{article.read_time || article.readTime}</span>
                </div>
                <CardTitle className="text-lg leading-tight">
                  {article.title}
                </CardTitle>
                <CardDescription className="text-gray-600 line-clamp-3">
                  {article.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <User className="size-4" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <span>{new Date(article.published_date || article.date).toLocaleDateString()}</span>
                  </div>
                </div>
                {article.content && (
                  <div className="mt-4">
                    <Button size="sm" variant="outline" className="w-full">
                      Read Full Article
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <NewsArticleModal 
        article={selectedArticle}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      <motion.div variants={itemVariants}>
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Subscribe to Updates</CardTitle>
            <CardDescription>
              Get the latest healthcare news and updates delivered to your inbox
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
                Subscribe
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default News;