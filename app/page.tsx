import { Hero } from "@/components/home/Hero";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { AIBanner } from "@/components/home/AIBanner";
import { AIStylistSection } from "@/components/home/AIStylistSection";
import { EditorsPicks } from "@/components/home/EditorsPicks";
import { LuxuryBanner } from "@/components/home/LuxuryBanner";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { LookbookPreview } from "@/components/home/LookbookPreview";
import { VideoSection } from "@/components/home/VideoSection";
import { Testimonials } from "@/components/home/Testimonials";
import { InstagramGallery } from "@/components/home/InstagramGallery";
import { Newsletter } from "@/components/home/Newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCollections />
      <AIBanner />
      <AIStylistSection />
      <EditorsPicks />
      <LuxuryBanner />
      <FeaturedProducts />
      <LookbookPreview />
      <VideoSection />
      <Testimonials />
      <InstagramGallery />
      <Newsletter />
    </>
  );
}
