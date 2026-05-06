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
import { siteBaseUrl, siteConfig, whatsappProfileHref } from "@/lib/site-config";

export default function Home() {
  const cases = getFeaturedCaseStudies();
  const baseUrl = siteBaseUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: siteConfig.name,
        description: siteConfig.description,
        url: baseUrl,
        email: siteConfig.email,
        sameAs: [siteConfig.linkedin, siteConfig.upwork, siteConfig.github, whatsappProfileHref()].filter(
          Boolean,
        ),
        knowsAbout: [
          "Next.js",
          "React",
          "TypeScript",
          "Node.js",
          "SaaS",
          "AI automation",
          "Mobile app development",
        ],
      },
      {
        "@type": "WebSite",
        name: siteConfig.name,
        url: baseUrl,
        description: siteConfig.description,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="pb-20 md:pb-0">
        <Hero />
        <Testimonials />
        <CaseStudies cases={cases} />
        <Services />
        <Skills />
        <Process />
        <About />
        <BookCall />
      </main>
      <Footer />
      <MobileStickyCta />
    </>
  );
}
