import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {
  FaHandsHelping,
  FaBookReader,
  FaUsers,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaArrowLeft,
  FaArrowRight,
  FaArrowUp,
} from "react-icons/fa";
import {MdCampaign} from "react-icons/md";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    img: "/avatars/av-1.jpeg",
    text: "AuriCare changed the way we approached therapy for our child. The structured programs and expert guidance have been life-changing.",
    author: "Parent of 6-year-old",
    role: "Mother",
  },
  {
    img: "/avatars/av-2.jpeg",
    text: "Their learning hubs combine play with therapy. My daughter has improved socially and emotionally through interactive activities.",
    author: "Parent of 10-year-old",
    role: "Mother",
  },
  {
    img: "/avatars/av-3.jpeg",
    text: "We finally found a safe space where our son feels included and celebrated. Highly recommend AuriCare to other parents.",
    author: "Parent of 8-year-old",
    role: "Father",
  },
  {
    img: "/avatars/av-4.jpeg",
    text: "The parent workshops taught me techniques I could apply at home. It gave me confidence and hope.",
    author: "Parent of 7-year-old",
    role: "Father",
  },
  {
    img: "/avatars/av-5.jpeg",
    text: "From therapy to awareness campaigns, AuriCare makes sure no child is left behind. Proud to be a donor and supporter.",
    author: "Community Donor",
    role: "Supporter",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoSlideInterval = useRef<NodeJS.Timeout | null>(null);
  const [showTop, setShowTop] = useState(false);

  // Hero & sections animation
  useEffect(() => {
    gsap.fromTo(
      heroRef.current,
      {opacity: 0, y: -60},
      {opacity: 1, y: 0, duration: 1.5, ease: "power3.out"}
    );
    gsap.fromTo(
      heroImgRef.current,
      {opacity: 0, scale: 0.9},
      {opacity: 1, scale: 1, duration: 1.5, ease: "power2.out", delay: 0.3}
    );

    sectionRefs.current.forEach((section) => {
      if (section) {
        gsap.from(section, {
          scrollTrigger: {trigger: section, start: "top 80%"},
          opacity: 0,
          y: 60,
          duration: 1.2,
          ease: "power3.out",
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // Auto slide
  useEffect(() => {
    if (autoSlideInterval.current) clearInterval(autoSlideInterval.current);
    autoSlideInterval.current = setInterval(
      () => slideTo(currentIndex + 1),
      5000
    );
    return () =>
      autoSlideInterval.current && clearInterval(autoSlideInterval.current);
  }, [currentIndex]);

  const slideTo = (index: number) => {
    const newIndex = (index + testimonials.length) % testimonials.length;
    setCurrentIndex(newIndex);
  };

  const handlePrev = () => slideTo(currentIndex - 1);
  const handleNext = () => slideTo(currentIndex + 1);

  // Show Go-to-top button on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({top: 0, behavior: "smooth"});
  };

  // External Links
  const LINKS = {
    learnMore: "https://www.autismspeaks.org/what-autism",
    supportUs: "https://www.autismspeaks.org/ways-give",
    getInvolved: "https://www.autismspeaks.org/get-involved",
  };
  const openExternal = (url: string) =>
    window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-purple-50 text-gray-800">
      {/* Hero */}
      <section
        ref={heroRef}
        className="h-screen flex flex-col md:flex-row justify-center items-center text-center md:text-left px-6 md:px-20"
      >
        <div className="flex-1">
          <h1 className="text-5xl md:text-6xl font-bold text-purple-700 mb-6">
            Welcome to AuriCare
          </h1>
          <p className="text-lg md:text-xl max-w-2xl text-gray-600 mb-4">
            Empowering Autism Care through Technology, Compassion, and
            Innovation.
          </p>
          <p className="text-md md:text-lg max-w-2xl text-gray-600 mb-8">
            At AuriCare, we provide therapy sessions, interactive learning hubs,
            and parent workshops that create a holistic environment for children
            with autism to thrive.
          </p>
          <div className="flex gap-4 justify-center md:justify-start">
            <button
              onClick={() => navigate("/auth")}
              className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-semibold hover:scale-105 transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/auth?tab=signup")}
              className="px-6 py-3 rounded-2xl border border-purple-600 text-purple-700 font-semibold hover:bg-purple-100 hover:scale-105 transition"
            >
              Sign Up
            </button>
          </div>
        </div>
        <div className="flex-1 mt-10 md:mt-0">
          <img
            ref={heroImgRef}
            src="/hero/hero.png"
            alt="Hero"
            className="w-full max-w-lg mx-auto drop-shadow-lg"
          />
        </div>
      </section>

      {/* Programs */}
      <section
        ref={(el) => (sectionRefs.current[0] = el)}
        className="py-16 px-6 md:px-20 text-center"
      >
        <h2 className="text-3xl font-bold text-purple-700 mb-6">
          Our Programs
        </h2>
        <p className="max-w-3xl mx-auto text-gray-600 mb-10">
          Personalized programs designed to nurture children with autism.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white shadow-lg rounded-2xl flex flex-col items-center hover:scale-105 transition">
            <FaHandsHelping className="text-purple-600 text-4xl mb-4" />
            <h3 className="text-xl font-semibold mb-2">Therapy Sessions</h3>
            <p>One-on-one and group sessions with certified therapists.</p>
          </div>
          <div className="p-6 bg-white shadow-lg rounded-2xl flex flex-col items-center hover:scale-105 transition">
            <FaBookReader className="text-purple-600 text-4xl mb-4" />
            <h3 className="text-xl font-semibold mb-2">Learning Hubs</h3>
            <p>Interactive tools and gamified learning experiences.</p>
          </div>
          <div className="p-6 bg-white shadow-lg rounded-2xl flex flex-col items-center hover:scale-105 transition">
            <FaUsers className="text-purple-600 text-4xl mb-4" />
            <h3 className="text-xl font-semibold mb-2">Parent Workshops</h3>
            <p>Guidance and resources for parents and caregivers.</p>
          </div>
        </div>
      </section>

      {/* Campaigns */}
      <section
        ref={(el) => (sectionRefs.current[1] = el)}
        className="py-16 bg-purple-50 px-6 md:px-20 text-center"
      >
        <h2 className="text-3xl font-bold text-purple-700 mb-6">
          Our Campaigns
        </h2>
        <p className="max-w-3xl mx-auto text-gray-600 mb-10">
          Join our awareness drives, fundraising initiatives, and community
          engagement programs to support autism inclusion and acceptance.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Awareness Drive */}
          <div className="p-6 bg-white shadow-lg rounded-2xl hover:scale-105 transition flex flex-col">
            <MdCampaign className="text-purple-600 text-5xl mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Awareness Drive</h3>
            <div className="w-full h-64 rounded-xl mb-3 bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src="/campaigns/c1.png"
                alt="Awareness Drive"
                className="max-h-full max-w-full object-contain"
                loading="lazy"
              />
            </div>
            <p className="text-gray-600 text-sm mb-3">
              We organize workshops, roadshows, and school/community programs to
              spread knowledge about autism and reduce stigma.
            </p>
            <a
              href={LINKS.learnMore}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:scale-105 transition inline-block text-center"
            >
              Learn More
            </a>
          </div>

          {/* Fundraising */}
          <div className="p-6 bg-white shadow-lg rounded-2xl hover:scale-105 transition flex flex-col">
            <MdCampaign className="text-purple-600 text-5xl mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Fundraising</h3>
            <div className="w-full h-64 rounded-xl overflow-hidden mb-3">
              <img
                src="/campaigns/c2.png"
                alt="Fundraising"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Through charity events, online donation drives, and partnerships
              with organizations, we raise funds to provide therapies at
              subsidized costs for families in need.
            </p>
            <button
              className="mt-auto px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:scale-105 transition"
              onClick={() => openExternal(LINKS.supportUs)}
            >
              Support Us
            </button>
          </div>

          {/* Community Outreach */}
          <div className="p-6 bg-white shadow-lg rounded-2xl hover:scale-105 transition flex flex-col">
            <MdCampaign className="text-purple-600 text-5xl mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Community Outreach</h3>
            <div className="w-full h-64 rounded-xl overflow-hidden mb-3">
              <img
                src="/campaigns/c3.png"
                alt="Community Outreach"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <p className="text-gray-600 text-sm mb-3">
              We work with schools, local NGOs, and volunteers to build
              inclusive environments, host cultural events, and create safe
              spaces for children with autism.
            </p>
            <button
              className="mt-auto px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:scale-105 transition"
              onClick={() => openExternal(LINKS.getInvolved)}
            >
              Get Involved
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section
        ref={(el) => (sectionRefs.current[2] = el)}
        className="py-16 px-6 md:px-20 text-center relative"
      >
        <h2 className="text-3xl font-bold text-purple-700 mb-6">
          What People Say
        </h2>
        <div className="flex items-center justify-center relative w-full max-w-5xl mx-auto">
          {/* Prev */}
          <button
            onClick={handlePrev}
            className="absolute left-0 z-20 p-3 bg-purple-200 rounded-full hover:bg-purple-300 transition transform hover:scale-110 hover:rotate-[-10deg]"
          >
            <FaArrowLeft className="text-purple-700 text-xl" />
          </button>

          {/* Carousel */}
          <div className="relative w-full h-96 flex items-center justify-center overflow-hidden">
            {testimonials.map((t, i) => {
              let pos = i - currentIndex;
              if (pos < -2) pos += testimonials.length;
              if (pos > 2) pos -= testimonials.length;

              const scale =
                pos === 0 ? 1 : pos === 1 || pos === -1 ? 0.85 : 0.7;
              const opacity =
                pos === 0 ? 1 : pos === 1 || pos === -1 ? 0.6 : 0.3;
              const zIndex = pos === 0 ? 20 : pos === 1 || pos === -1 ? 10 : 1;
              const xOffset = pos * 250;

              return (
                <div
                  key={i}
                  className="absolute transition-all duration-700 ease-out p-6 bg-white shadow-lg rounded-2xl flex flex-col items-center w-72 md:w-96"
                  style={{
                    transform: `translateX(${xOffset}px) scale(${scale})`,
                    opacity,
                    zIndex,
                  }}
                >
                  <img
                    src={t.img}
                    alt={`avatar${i}`}
                    className="w-20 h-20 rounded-full mb-4 object-cover shadow-md"
                  />
                  <p className="italic mb-4 text-gray-600 text-center">
                    "{t.text}"
                  </p>
                  <span className="font-semibold text-purple-700">
                    {t.author}
                  </span>
                  <span className="text-sm text-gray-500">{t.role}</span>
                </div>
              );
            })}
          </div>

          {/* Next */}
          <button
            onClick={handleNext}
            className="absolute right-0 z-20 p-3 bg-purple-200 rounded-full hover:bg-purple-300 transition transform hover:scale-110 hover:rotate-[10deg]"
          >
            <FaArrowRight className="text-purple-700 text-xl" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-purple-700 text-white text-center">
        <p className="mb-4">
          &copy; {new Date().getFullYear()} AuriCare. All rights reserved.
        </p>
        <div className="flex justify-center gap-6 text-2xl">
          <FaFacebook className="hover:text-purple-300 cursor-pointer" />
          <FaTwitter className="hover:text-purple-300 cursor-pointer" />
          <FaInstagram className="hover:text-purple-300 cursor-pointer" />
        </div>
      </footer>

      {/* Go-to-top button */}
      {showTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-4 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition transform animate-[float_3s_ease-in-out_infinite]"
        >
          <FaArrowUp className="text-xl" />
        </button>
      )}

      {/* Floating animation keyframes */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
};

export default Home;
