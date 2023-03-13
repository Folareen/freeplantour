import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase.config';

export default withApiAuthRequired(async function handler(req, res) {
  console.log('got heree')
  try {
    const {
      user: { sub, email },
    } = await getSession(req, res);

    // get user data from firestore
    const docRef = doc(db, "users", `${user.sub}-${user.email}`);
    const userDocSnap = await getDoc(docRef);

    
    const { lastItineraryDate, getNewerItineraries } = req.body;

    // get all users itineraries from firestore
    const allRawItineraries = await getDocs(query(collection(db, "itineraries"), where("userId", "==", `${sub}-${email}`)));

    let rawItineraries;

    // if getNewerItineraries is true, then we want to get all itineraries that are newer than the lastItineraryDate
    if (getNewerItineraries) {
      rawItineraries = allRawItineraries.docs.filter((doc) => {
        return doc.data().created < new Date(lastItineraryDate).toISOString()
      })
    } else {
      rawItineraries = allRawItineraries.docs.filter((doc) => {
        return doc.data().created > new Date(lastItineraryDate).toISOString()
      })
    }

    // sort itineraries by created date in descending order
    const sortedItineraries = rawItineraries.sort((a, b) => {
      return b.data().created - a.data().created;
    })


    res.status(200).json({
      itineraries: sortedItineraries.slice
        (0, 5).map((doc) => {
          return { ...doc.data(), created: new Date(doc.data().created).toString() }
        })
    });
    return;
  } catch (e) { console.log('get itineraries error', e) }
});
