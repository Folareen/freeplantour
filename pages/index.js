import Image from 'next/image';
import Link from 'next/link';
import { useIntl } from 'react-intl';
import { Logo } from '../components/Logo';
import HeroImage from '../public/hero.webp';

export default function Home() {
  const intl = useIntl();
  
    const currentLanguage = useIntl().locale;

  const title = intl.formatMessage({ id: "landing.title" });
  const btn = intl.formatMessage({ id: "landing.btn" });

  return (
    <div className="w-screen h-screen overflow-hidden flex justify-center items-center relative">
      <Image src={HeroImage} alt="Free Plan Tour" />
      <div className="relative z-10 text-white px-10 py-5 text-center max-w-screen-sm">
        <Logo />

        <p>
          {title}
        </p>
        <Link href={`/${currentLanguage}/itinerary/new`} className="btn text-center">
          {btn}
        </Link>
      </div>
    </div>
  );
}
