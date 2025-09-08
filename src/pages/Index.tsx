import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, MessageSquare, CalendarCheck2, LineChart, Heart } from "lucide-react";

const Index = () => {
  const canonical = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  return (
    <main className="min-h-screen bg-background">
      <Helmet>
        <title>AuriCare — Futuristic Autism Management Platform</title>
        <meta name="description" content="AuriCare — calm, data‑driven autism support: therapy tracking, AI assistant, caregiver tools." />
        {canonical && <link rel="canonical" href={canonical} />}
      </Helmet>

      <section className="container mx-auto py-20 md:py-28">
        <div className="mx-auto max-w-5xl text-center animate-enter">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm bg-secondary/70 text-muted-foreground">
            <Sparkles className="size-4" /> Calm, accessible, data‑driven
          </div>
          <h1 className="mt-6 font-heading text-4xl md:text-6xl font-semibold tracking-tight">
            AuriCare — calm, data‑driven autism support for families and therapists.
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground">
            Track therapy progress, chat with Auri, schedule routines, and access calming sensory tools — all in one secure, accessible platform.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth"><Button variant="hero" size="xl">Create a free family profile</Button></Link>
            <Link to="/chatbot"><Button variant="glow" size="lg">Ask Auri</Button></Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:scale-105 transition-transform duration-200">
            <CardContent className="pt-6">
              <MessageSquare className="size-6 text-primary" />
              <h2 className="mt-3 font-semibold text-xl">AI Assistant "Auri"</h2>
              <p className="mt-2 text-muted-foreground">Safe, multi‑turn Q&A for behavior strategies, routines, and emergency guidance.</p>
            </CardContent>
          </Card>
          <Card className="hover:scale-105 transition-transform duration-200">
            <CardContent className="pt-6">
              <LineChart className="size-6 text-primary" />
              <h2 className="mt-3 font-semibold text-xl">Therapy Tracker</h2>
              <p className="mt-2 text-muted-foreground">Log sessions and visualize milestones across skills with exportable summaries.</p>
            </CardContent>
          </Card>
          <Card className="hover:scale-105 transition-transform duration-200">
            <CardContent className="pt-6">
              <CalendarCheck2 className="size-6 text-primary" />
              <h2 className="mt-3 font-semibold text-xl">Daily Visual Scheduler</h2>
              <p className="mt-2 text-muted-foreground">Build pictogram‑based routines with timers and caregiver notifications.</p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-10 text-center">
          <Link to="/about" className="text-primary hover:underline">Explore all features</Link>
        </div>
      </section>

      <section className="container mx-auto py-14 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <Heart className="size-8 mx-auto text-primary" />
          <h2 className="mt-4 text-3xl font-semibold font-heading">Privacy, Accessibility, and Trust</h2>
          <p className="mt-2 text-muted-foreground">WCAG 2.1 AA, role‑based access, and HIPAA/GDPR‑ready policies. Your family’s data is protected with care.</p>
        </div>
      </section>
    </main>
  );
};

export default Index;
