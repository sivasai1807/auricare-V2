"use client";

import {useEffect, useMemo, useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Calendar, User, TrendingUp} from "lucide-react";

type Article = {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: "Technology" | "Healthcare" | "Mental Health" | string;
  readTime: string; // original label (e.g., "5 min read")
  fullContent?: string[]; // array of lines
};

const INITIAL_VISIBLE = 20; // lines shown initially in modal
const STEP_LINES = 100; // lines added per click
const TARGET_LINES = 500; // total lines aimed

// Read time assumptions
const WPM = 200; // words per minute typical
const WORDS_PER_LINE = 12; // avg words per generated line
const EXCERPT_WORDS_EST = 40; // rough average words in excerpt

function estimateMinutesFromLines(linesCount: number, extraWords = 0) {
  const totalWords = linesCount * WORDS_PER_LINE + extraWords;
  return Math.max(1, Math.ceil(totalWords / WPM));
}

// Helper to build 500 lines of text deterministically
function buildLongContent(
  title: string,
  author: string,
  date: string,
  category: string
): string[] {
  const lines: string[] = [];
  const header = `Article: ${title} | Category: ${category} | Author: ${author} | Date: ${new Date(
    date
  ).toLocaleDateString()}`;
  lines.push(header);
  lines.push("");
  for (let i = 1; i <= TARGET_LINES - 2; i++) {
    lines.push(
      `Line ${i}: ${title} — This line expands on ${category.toLowerCase()} context, practical applications, study notes, implementation details, constraints, and considerations. Section ${Math.ceil(
        i / 25
      )} summary with insights, metrics, and examples to make the narrative detailed and educational.`
    );
  }
  return lines;
}

const News = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [visibleLines, setVisibleLines] = useState(INITIAL_VISIBLE);

  // Base articles
  const baseArticles: Article[] = useMemo(
    () => [
      {
        id: 1,
        title: "Revolutionary AI-Powered Health Monitoring System Launched",
        excerpt:
          "New breakthrough in personalized healthcare monitoring using artificial intelligence to predict health issues before they occur.",
        author: "Dr. Sarah Johnson",
        date: "2024-01-15",
        category: "Technology",
        readTime: "5 min read",
      },
      {
        id: 2,
        title: "Telemedicine Adoption Reaches All-Time High",
        excerpt:
          "Healthcare providers worldwide report unprecedented adoption rates of telemedicine services, improving patient access to care.",
        author: "Michael Chen",
        date: "2024-01-12",
        category: "Healthcare",
        readTime: "3 min read",
      },
      {
        id: 3,
        title: "Mental Health Support Through Digital Platforms",
        excerpt:
          "Study shows significant improvement in patient outcomes when using digital mental health support platforms alongside traditional therapy.",
        author: "Dr. Emily Rodriguez",
        date: "2024-01-10",
        category: "Mental Health",
        readTime: "7 min read",
      },
    ],
    []
  );

  // Enrich with generated 500-line content once
  const newsArticles: Article[] = useMemo(() => {
    return baseArticles.map((a) => ({
      ...a,
      fullContent: buildLongContent(a.title, a.author, a.date, a.category),
    }));
  }, [baseArticles]);

  useEffect(() => {
    if (selectedArticle) setVisibleLines(INITIAL_VISIBLE);
  }, [selectedArticle]);

  // Variants
  const containerVariants = {
    hidden: {opacity: 0},
    visible: {opacity: 1, transition: {staggerChildren: 0.1}},
  };
  const itemVariants = {
    hidden: {y: 20, opacity: 0},
    visible: {y: 0, opacity: 1, transition: {type: "spring", stiffness: 100}},
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Technology":
        return "bg-blue-100 text-blue-800";
      case "Healthcare":
        return "bg-green-100 text-green-800";
      case "Mental Health":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalLines = selectedArticle?.fullContent?.length ?? 0;
  const hasMore = visibleLines < totalLines;

  // Dynamic read time (modal)
  const dynamicMinutes = useMemo(() => {
    if (!selectedArticle) return null;
    // Include excerpt words and currently visible long content
    return estimateMinutesFromLines(visibleLines, EXCERPT_WORDS_EST);
  }, [selectedArticle, visibleLines]);

  const handleShowMore = () => {
    if (!selectedArticle?.fullContent) return;
    setVisibleLines((v) =>
      Math.min(v + STEP_LINES, selectedArticle.fullContent!.length)
    );
  };
  const handleShowLess = () => setVisibleLines(INITIAL_VISIBLE);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Healthcare News & Updates
        </h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Stay informed with the latest developments in healthcare technology,
          research, and patient care innovations.
        </p>
      </motion.div>

      {/* Featured Story */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="size-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">Featured Story</h2>
                <p className="text-gray-600">
                  Latest breakthrough in healthcare technology
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Article Grid */}
      <motion.div
        variants={containerVariants}
        className="grid gap-6 md:grid-cols-2"
      >
        {newsArticles.map((article) => (
          <motion.div
            key={article.id}
            variants={itemVariants}
            onClick={() => setSelectedArticle(article)}
            className="cursor-pointer"
          >
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 h-full">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getCategoryColor(article.category)}>
                    {article.category}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {article.readTime}
                  </span>
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
                    <span>{new Date(article.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Detailed Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 relative max-h-[85vh] overflow-hidden"
              initial={{scale: 0.8, opacity: 0}}
              animate={{scale: 1, opacity: 1}}
              exit={{scale: 0.8, opacity: 0}}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedArticle.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={getCategoryColor(selectedArticle.category)}
                    >
                      {selectedArticle.category}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {selectedArticle.readTime}
                    </span>
                    {dynamicMinutes !== null && (
                      <span className="text-sm text-gray-600">
                        · Est now: {dynamicMinutes} min read
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mt-4">{selectedArticle.excerpt}</p>

              {/* Scrollable long content area */}
              <div className="mt-4 border rounded-lg p-3 bg-gray-50 max-h-[48vh] overflow-auto">
                <pre className="whitespace-pre-wrap text-sm leading-6 text-gray-800">
                  {(selectedArticle.fullContent ?? [])
                    .slice(0, visibleLines)
                    .join("\n")}
                </pre>
              </div>

              {/* Controls */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Showing {Math.min(visibleLines, totalLines)} of {totalLines}{" "}
                  lines
                </span>
                <div className="flex items-center gap-2">
                  {hasMore ? (
                    <Button variant="secondary" onClick={handleShowMore}>
                      Show more
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={handleShowLess}>
                      Show less
                    </Button>
                  )}
                  <Button onClick={() => setSelectedArticle(null)}>
                    Close
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 text-gray-500">
                <div className="flex items-center gap-2">
                  <User className="size-4" />
                  <span>{selectedArticle.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <span>
                    {new Date(selectedArticle.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default News;
