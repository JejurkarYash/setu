import LandingNavbar from "./components/LandingNavbar";
import HeroSection from "./components/HeroSection";
import PerformanceBenchmarks from "./components/PerformanceBenchmarks";
import ProblemSolutionSection from "./components/ProblemSolutionSection";
import FeaturesSection from "./components/FeaturesSection";
export default function LandingPage() {
  return (
    <div
      style={{
        backgroundColor: "#000000",
        minHeight: "100vh",
        color: "#FFFFFF",
        overflowX: "hidden",
      }}
    >
      <LandingNavbar />
      <main>
        <HeroSection />
        <PerformanceBenchmarks />
        <ProblemSolutionSection />
        <FeaturesSection />
        {/* <CtaSection /> */}
      </main>
      {/* <LandingFooter /> */}
    </div>
  );
}
