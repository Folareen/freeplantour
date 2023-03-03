import { getSession, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { faHashtag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ObjectId } from 'mongodb';
import { useRouter } from 'next/router';
import { useContext, useRef, useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import ItinerariesContext from '../../context/ItinerariesContext';
import clientPromise from '../../lib/mongodb';
import { getAppProps } from '../../utils/getAppProps';
import Linkify from "react-linkify";
import jsPDF from 'jspdf';
import validator from 'validator'

const componentDecorator = (href, text, key) => (
  <a className="linkify__text" href={href} key={key} target="_blank">
    {text}
  </a>
);

const subject = "Tu itinerario ya esta generado";

export default function Itinerary(props) {
  console.log('PROPS: ', props.apiOutput);
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { deleteItinerary } = useContext(ItinerariesContext);

  const handleDeleteConfirm = async () => {
    console.log('DELETE ITINERARY: ', props.id)
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
      setEmailError("Email Correcto!:)");
      setEmailOk(e.target.value);
    } else {
      setEmailError("Email no válido!");
    }
  };

  const scrollToDiv = () => {
    window.scrollTo({
      top: divRef.current.offsetTop,
      behavior: "smooth",
    });
  };

  const emailContent = props.title + props.itineraryContent;

  const pdfDownload = (e) => {
    e.preventDefault()
    let doc = new jsPDF("landscape", 'pt', 'A4');
    const content = document.getElementById("pdf-view");

    // Ajustar el tamaño de fuente del contenido HTML para que quepa en una sola página
    content.style.fontSize = "12px";

    // Opcional: ajustar la escala de la página si el contenido no cabe en una sola página
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
                Te mandamos tu itinierario por correo:
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
                    Enviar Plan
                  </a>
                </span>
              </div>
              <div class="front">
                <button onClick={pdfDownload}>&nbsp;&nbsp;&nbsp;&nbsp;Generar PDF</button>
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
            Delete itinerary
          </button>
        )}
        {!!showDeleteConfirm && (
          <div>
            <p className="p-2 bg-red-300 text-center">
              Are you sure you want to delete this itinerary? This action is
              irreversible
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn bg-stone-600 hover:bg-stone-700"
              >
                cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn bg-red-600 hover:bg-red-700"
              >
                confirm delete
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
    const client = await clientPromise;
    const db = client.db('Freeplantour');
    const user = await db.collection('users').findOne({
      auth0Id: userSession.user.sub,
    });
    const itinerary = await db.collection('itineraries').findOne({
      _id: new ObjectId(ctx.params.itineraryId),
      userId: user._id,
    });

    if (!itinerary) {
      return {
        redirect: {
          destination: '/itinerary/new',
          permanent: false,
        },
      };
    }

    return {
      props: {
        id: ctx.params.itineraryId,
        apiOutput: itinerary.apiOutput,
        info: itinerary.info,
        title: itinerary.title,
        itineraryCreated: itinerary.created.toString(),
        ...props,
      },
    };
  },
});
