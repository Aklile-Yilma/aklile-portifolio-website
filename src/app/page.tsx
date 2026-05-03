import { About } from "@/components/about";
import { BookCall } from "@/components/book-call";
import { CaseStudies } from "@/components/case-studies";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { MobileStickyCta } from "@/components/mobile-sticky-cta";
import { Navbar } from "@/components/navbar";
import { Process } from "@/components/process";
import { Services } from "@/components/services";
import { Skills } from "@/components/skills";
import { Testimonials } from "@/components/testimonials";
import { getFeaturedCaseStudies } from "@/lib/case-studies";

export default function Home() {
  const cases = getFeaturedCaseStudies();

  return (
    <>
      <Navbar />
      <main className="pb-20 md:pb-0">
        <Hero />
        <Skills />
        <Services />
        <CaseStudies cases={cases} />
        <Testimonials />
        <Process />
        <About />
        <BookCall />
      </main>
      <Footer />
      <MobileStickyCta />
    </>
  );
}
