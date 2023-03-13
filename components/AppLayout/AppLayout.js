import { useUser } from '@auth0/nextjs-auth0/client';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';
import { useContext, useEffect } from 'react';
import { useIntl } from 'react-intl';
import ItinerariesContext from '../../context/itinerariesContext';



export const AppLayout = ({
  children,
  availableTokens,
  itineraries: itinerariesFromSSR,
  itineraryId,
  itineraryCreated,
}) => {

  const currentLanguage = useIntl().locale;

  const intl = useIntl();

  const getText = (id) => intl.formatMessage({ id });

  const { user } = useUser();

  const { setItinerariesFromSSR, itineraries, getItineraries, noMoreItineraries } =
    useContext(ItinerariesContext);

  useEffect(() => {
    console.log(itineraries)
    setItinerariesFromSSR(itinerariesFromSSR);
    if (itineraryId) {
      const exists = itinerariesFromSSR?.find((itinerary) => itinerary._id === itineraryId);
      if (!exists) {
        getItineraries({ getNewerItineraries: true, lastItineraryDate: itineraryCreated});
      }
    }
  }, [itinerariesFromSSR, setItinerariesFromSSR, itineraryId, itineraryCreated, getItineraries]);


  return (
    <div>
      <div className="grid grid-cols-[300px_1fr] h-screen max-h-screen">
        <div className="flex flex-col text-white overflow-hidden">
          <div className="bg-slate-800 px-2">
            <Link href={`/${currentLanguage}/itinerary/new`} className="btn mt-3 mb-4">
              {getText( "applayout.newbtn" )}
            </Link>
            <Link href={`/${currentLanguage}/token-topup`} className="block mt-2 text-center">
              <FontAwesomeIcon icon={faCoins} className="text-yellow-500" />
              <span className="pl-1">{availableTokens? availableTokens : 0} {getText( "applayout.tokens" )}</span>
            </Link>
          </div>
          <div className="px-4 flex-1 overflow-auto bg-gradient-to-b from-slate-800 to-cyan-800">
            {itineraries.map((itinerary) => (
              <Link
                key={itinerary._id}
                href={`/${currentLanguage}/itinerary/${itinerary._id}`}
                className={`py-1 border border-white/0 block text-ellipsis overflow-hidden whitespace-nowrap my-1 px-2 bg-white/10 cursor-pointer rounded-sm ${itineraryId === itinerary._id ? 'bg-white/20 border-white' : ''
                  }`}
              >
                {itinerary.title}
              </Link>
            ))}
            {!noMoreItineraries && (
              <div
                onClick={() => {
                  getItineraries({ lastItineraryDate: itineraries[itineraries.length - 1]?.created });
                }}
                className="hover:underline text-sm text-slate-400 text-center cursor-pointer mt-4"
              >
                {getText( "applayout.morebtn" )}
              </div>
            )}
          </div>
          <div className="bg-cyan-800 flex items-center gap-2 border-t border-t-black/50 h-20 px-2">
            {!!user ? (
              <>
                <div className="min-w-[50px]">
                  <Image
                    src={user.picture}
                    alt={user.name}
                    height={50}
                    width={50}
                    className="rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-bold">{user.email}</div>
                  <Link className="text-sm" href="/api/auth/logout">
                    {getText( "applayout.logout" )}
                  </Link>
                </div>
              </>
            ) : (
              <Link href="/api/auth/login">{getText( "applayout.login" )}</Link>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};
