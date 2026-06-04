import Header from '@/components/Header';
import ScrollAnimation from '@/components/ScrollAnimation';
import PPFSection from '@/components/PPFSection';
import TintSection from '@/components/TintSection';
import VinylSection from '@/components/VinylSection';
import CeramicSection from '@/components/CeramicSection';
import StickersSection from '@/components/StickersSection';
import GallerySection from '@/components/GallerySection';
import AdvantagesSection from '@/components/AdvantagesSection';
import FAQSection from '@/components/FAQSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="bg-black w-full">
      <Header />
      <ScrollAnimation />
      <PPFSection />
      <TintSection />
      <VinylSection />
      <CeramicSection />
      <StickersSection />
      <GallerySection />
      <AdvantagesSection />
      <FAQSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
