import '../styles/globals.css';
import '../styles/styles.css';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { DM_Sans, DM_Serif_Display } from '@next/font/google';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import { ItinerariesProvider } from '../context/itinerariesContext';
import { IntlProvider } from "react-intl";

// import all languages
import es from "../lang/es.json";
import en from "../lang/en.json";
import de from "../lang/de.json";
import fr from "../lang/fr.json";
import pt from "../lang/pt.json";

import { useRouter } from 'next/router';
import Nav from '../components/Nav';

// configure languages
const messages = {
  es, en, de, fr, pt
};


config.autoAddCss = false;

const dmSans = DM_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-dm-sans',
});

const dmSerifDisplay = DM_Serif_Display({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-dm-serif',
});

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);
  const { locale } = useRouter();

  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      <Nav />
      <UserProvider>
        <ItinerariesProvider>
          <main
            className={`${dmSans.variable} ${dmSerifDisplay.variable} font-body`}
          >
            {getLayout(<Component {...pageProps} />, pageProps)}
          </main>
        </ItinerariesProvider>
      </UserProvider>
    </IntlProvider >
  );
}

export default MyApp;
