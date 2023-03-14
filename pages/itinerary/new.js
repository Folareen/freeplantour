import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { faBrain } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { AppLayout } from '../../components/AppLayout';
import { getAppProps } from '../../utils/getAppProps';
import { useUser } from '@auth0/nextjs-auth0/client';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.config'

import { useState, useRef } from "react";

import Linkify from "react-linkify";
import Image from "next/image";
import validator from "validator";
import axios from "axios";

import { jsPDF } from "jspdf";


import Logo2 from "../../assets/logo2.png";
import Duration from '../../components/Inputs/Duration';
import Month from '../../components/Inputs/Month';
import UserInput from '../../components/Inputs/UserInput';
import { useIntl } from 'react-intl';

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];


const NewItinerary = () => {

  const intl = useIntl();
  const currentLanguage = useIntl().locale;

  const getText = (id) => intl.formatMessage({ id });

  const router = useRouter();
  const [duration, setDuration] = useState(3);
  const [userInput, setUserInput] = useState("");
  const [apiOutput, setApiOutput] = useState("");
  const [info, setInfo] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getText("month.any"));

  const {user} = useUser()

  const divRef = useRef(null);

  const callGenerateEndpoint = async (e) => {

    e.preventDefault();
    setIsGenerating(true);

    let prompt = `${getText('new.generateitineraryof')} ${duration} ${getText('new.generateitineraryto')} ${userInput} ${getText('new.generateitinerarynext')} ${selectedMonth}`;

    try {
      const response = await axios.post(`/api/generateItinerary`, { prompt }, {headers: {
          'content-type': 'application/json',
        } })
        console.log('came back')
      

       console.log(response.data, 'response: ');
  // const { output } = response;
  // console.log(output?.text, "OpenAI replied...");

  const result = await fetch(
    `https://es.wikivoyage.org/w/api.php?origin=*&format=json&formatversion=2&action=parse&page=${userInput}&prop=text`
  );
  const respon = await result.json();

  // console.log('THE RESPONSE!!!', respon)
  const content = respon?.parse?.text ?? ""

  const cleanedContent = content.replace(/Esta guía es [\s\S]*?ayuda a mejorarlo/g, "");
  const cleanedContent2 = cleanedContent.replace(/Este artículo [\s\S]*?otros artículos/g, "");
  const cleanedContent3 = cleanedContent2.replace(/Este artículo [\s\S]*?GNU Free Documentation License/g, "");

  const finalContent = cleanedContent3.replace(/\beditar\b/g, "");

    // get user data from firestore
  const docRef = doc(db, "users", `${user.sub}-${user.email}`);
  const userDocSnap = await getDoc(docRef);

  // get user data from firestore
  const userDocRef = doc(db, "users", `${user.sub}-${user.email}`);

  // deduct 1 token from user's available tokens
  await updateDoc(userDocRef, {
    availableTokens: Number(userDocSnap.data().availableTokens) - 1,
  });

  // create custom id for itinerary
  const newItineraryId = String(new Date().getTime())

  // add itinerary to firestore
  await setDoc(doc(db, "itineraries", newItineraryId), {
    apiOutput: response.data.response,
    info: finalContent,
    title: `${userInput} - ${selectedMonth}`,
    userId: `${user.sub}-${user.email}`,
    created: new Date().toISOString(),
    _id: newItineraryId
  });

      if (newItineraryId) {
        router.push(`/${currentLanguage}/itinerary/${newItineraryId}`);
      }
    } catch (e) {
      console.log(e)
      setIsGenerating(false);
    }
  };

  return (
    <div className="root">
      <div className="flex max-[600px]:flex-col w-full">

        <div className="container-left">
          <div class="row">
            <a href="https://gestat.io/" target="_blank" rel="noreferrer">
              <div class="column">
                <Image
                  src={Logo2}
                  alt="Free Plan Tour"
                  style={{ opacity: "0.8" }}
                />
              </div>
            </a>
            <div class="column">
              <h2>
                <br />
                {getText("new.title")}
              </h2>
            </div>
          </div>

          <div className="prompt-container">

            <UserInput userInput={userInput} setUserInput={setUserInput} />

            <div className="flex w-100 mt-4">

              <Duration duration={duration} setDuration={setDuration} />

              <Month months={months} setSelectedMonth={setSelectedMonth} selectedMont={selectedMonth} />
            </div>

            <div className="prompt-buttons">
              <button
                className="pushable py-2 px-4 rounded"
                onClick={callGenerateEndpoint}
                disabled={isGenerating}
              >
                <span className="shadow"></span>
                <span className="edge"></span>
                <div className="front">
                  {isGenerating ? (
                    <div>
                      <span className="loader mr-2"></span>
                      <span>
                        {getText('new.preparing')}
                        <br />
                        {getText("new.dontsee")}
                        <br />
                        {getText("new.appearnext")}
                        <br />
                      </span>
                    </div>
                  ) : (
                    <span className="font-semibold">{getText('new.generate')}</span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default NewItinerary;

NewItinerary.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx);

// if there are no tokens, redirect to the topup page
    if (!props.availableTokens) {
      return {
        redirect: {
          destination: '/token-topup',
          permanent: false,
        },
      };
    }

    return {
      props,
    };
  },
});
