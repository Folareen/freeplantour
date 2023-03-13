import { getSession, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { faHashtag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useContext, useRef, useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import ItinerariesContext from '../../context/itinerariesContext';
import { getAppProps } from '../../utils/getAppProps';
import Linkify from "react-linkify";
import jsPDF from 'jspdf';
import validator from 'validator'
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { useIntl } from 'react-intl';

const componentDecorator = (href, text, key) => (
  <a className="linkify__text" href={href} key={key} target="_blank" rel='noreferrer'>
    {text}
  </a>
);


export default function Itinerary(props) {

  const intl = useIntl();

  const getText = (id) => intl.formatMessage({ id });

  const subject = getText("itineraryid.title");

  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { deleteItinerary } = useContext(ItinerariesContext);

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/deleteItinerary`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ itineraryId: props.id }),
      });
      const json = await response.json();
      if (json.success) {
        deleteItinerary(props.id);
        router.replace(`/itinerary/new`);
      }
    } catch (e) { }
  };

  const divRef = useRef(null);

  const [emailError, setEmailError] = useState("");
  const [emailOk, setEmailOk] = useState("");
  const validateEmail = (e) => {
    var email = e.target.value;

    if (validator.isEmail(email)) {
      setEmailError(getText('itineraryid.emailok'));
      setEmailOk(e.target.value);
    } else {
      setEmailError("itineraryid.emailerror");
    }
  };

  const emailContent = props.title + props.itineraryContent;

  const pdfDownload = (e) => {
    e.preventDefault()
    let doc = new jsPDF("landscape", 'pt', 'A4');
    const content = document.getElementById("pdf-view");

    content.style.fontSize = "12px";

    const options = {
      callback: () => {
        doc.save("freeplantour.pdf");
      },
      x: 5,
      y: 5,
      html2canvas: { scale: 0.8 }
    };

    // Generar el PDF
    doc.html(content, options);
    console.log(content)
  };

  return (
    <div className="container-right" ref={divRef}>
      <div id="pdf-view">
        {props.apiOutput && (
          <div className="output">
            <div className="output-content">
              <p>
                <Linkify componentDecorator={componentDecorator}>
                  {props.apiOutput}
                </Linkify>
              </p>
              {props.info && (
                <div style={{ fontWeight: "bold", color: "black" }}>
                  <div dangerouslySetInnerHTML={{ __html: props.info }}></div>
                </div>
              )}
              <span style={{ fontWeight: "bold", color: "black" }}>
                {getText('itineraryid.sendemail')}
              </span>
              <input
                type="text"
                style={{ fontWeight: "bold", color: "black", borderColor: 'lightblue', borderStyle: 'solid', borderWidth: '2px' }}
                id="userEmail"
                onChange={(e2) => validateEmail(e2)}
              ></input>
              <br />
              <span style={{ fontWeight: "bold", color: "red" }}>
                {emailError}
              </span>

              <br />

              <div class="front mb-2">
                <span>
                  <a
                    href={`mailto:${emailOk || "edu@edu.com"
                      }?subject=${encodeURIComponent(
                        subject
                      )}&body=${encodeURIComponent(props.apiOutput)}`}
                  >
                    {getText('itineraryid.sendplan')}
                  </a>
                </span>
              </div>
              <div class="front">
                <button onClick={pdfDownload}>&nbsp;&nbsp;&nbsp;&nbsp;{getText('itineraryid.genpdf')}</button>
              </div>


            </div>
          </div>
        )}
      </div>

      <div className="my-4">
        {!showDeleteConfirm && (
          <button
            className="btn bg-red-600 hover:bg-red-700"
            onClick={() => setShowDeleteConfirm(true)}
          >
            {getText('itinerayid.delete')}
          </button>
        )}
        {!!showDeleteConfirm && (
          <div>
            <p className="p-2 bg-red-300 text-center">
              {getText('itineraryid.deleteconfirm')}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn bg-stone-600 hover:bg-stone-700"
              >
                {getText('itineraryid.canceldel')}
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn bg-red-600 hover:bg-red-700"
              >
                {getText('itineraryid.confirmdel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Itinerary.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx);
    const userSession = await getSession(ctx.req, ctx.res);

    // get user data from firestore
    const docRef = doc(db, "users", `${userSession.user.sub}-${userSession.user.email}`);
    const userDocSnap = await getDoc(docRef);

    // get itinerary data from firestore
    const itinerariesDocRef = doc(db, "itineraries", ctx.params.itineraryId);
    const itineraryDocSnap = await getDoc(itinerariesDocRef);

// if itinerary doesn't exist, redirect to new itinerary page
    if (!itineraryDocSnap.exists()) {
      return {
        redirect: {
          destination: '/itinerary/new',
          permanent: false,
        },
      };
    }

    // return itinerary data to page
    return {
      props: {
        id: ctx.params.itineraryId,
        apiOutput: itineraryDocSnap.data().apiOutput,
        info: itineraryDocSnap.data().info,
        title: itineraryDocSnap.data().title,
        itineraryCreated: itineraryDocSnap.data().created.toString(),
        ...props,
      },
    };
  },
});
