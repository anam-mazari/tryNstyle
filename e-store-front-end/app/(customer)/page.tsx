import { HomeHero } from '@/features/home/components/HomeHero';
import { HomeValueStrip } from '@/features/home/components/HomeValueStrip';
import { HomeCollectionSection } from '@/features/home/components/HomeCollectionSection';

export default function Home() {
  return (
    <div className="bg-white">
      <HomeHero />
      <HomeValueStrip />
      <HomeCollectionSection />
    </div>
  );
}
