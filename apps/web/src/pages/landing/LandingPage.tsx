import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";
import LandingNavbar from "./components/LandingNavbar";
import HeroSection from "./components/HeroSection";
import PerformanceBenchmarks from "./components/PerformanceBenchmarks";
import ProblemSolutionSection from "./components/ProblemSolutionSection";
import FeaturesSection from "./components/FeaturesSection";
import ObservabilityPreviewSection from "./components/ObservabilityPreviewSection";
import QuickStartSection from "./components/QuickStartSection";
import CtaSection from "./components/CtaSection";
import LandingFooter from "./components/LandingFooter";
export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const pageRef = useRef<HTMLDivElement>(null);
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const page = pageRef.current;
    if (!page || typeof IntersectionObserver === "undefined") return;
    const sections = page.querySelectorAll<HTMLElement>("main > [data-chapter]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("in-view", entry.isIntersecting);
        });
      },
      { threshold: 0.12 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="landing-page-shell"
      ref={pageRef}
      style={{
        backgroundColor: "#000000",
        minHeight: "100vh",
        color: "#FFFFFF",
        overflowX: "clip",
      }}
    >
      <motion.div
        className="landing-scroll-progress"
        style={{ scaleX: progress }}
        aria-hidden="true"
      />
      <LandingNavbar />
      <main>
        <HeroSection />
        <PerformanceBenchmarks />
        <ProblemSolutionSection />
        <FeaturesSection />
        <ObservabilityPreviewSection />
        <QuickStartSection />
        <CtaSection />
      </main>
      <LandingFooter />
      <style>{`
        .landing-page-shell {
          position: relative;
          isolation: isolate;
        }

        .landing-page-shell::before {
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          content: "";
          background:
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px);
          background-size: 96px 96px;
          mask-image: linear-gradient(to bottom, black, transparent 86%);
          opacity: 0.32;
        }

        .landing-scroll-progress {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 30;
          width: 100%;
          height: 2px;
          transform-origin: 0 50%;
          background: linear-gradient(90deg, #67e8f9, #e879f9 68%, #f5c96b);
          pointer-events: none;
        }

        .landing-page-shell main > [data-chapter] {
          position: relative;
        }

        .landing-page-shell main > [data-chapter]::after {
          position: absolute;
          top: 20px;
          right: clamp(22px, 4vw, 64px);
          z-index: 3;
          content: attr(data-chapter);
          color: #565d66;
          font-family: "JetBrains Mono", monospace;
          font-size: 8px;
          letter-spacing: 0.14em;
          opacity: 0;
          transform: translateY(5px);
          transition: opacity 600ms ease, transform 600ms ease;
          pointer-events: none;
        }

        .landing-page-shell main > [data-chapter].in-view::after {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .landing-scroll-progress {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
