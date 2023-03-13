import { getSession } from '@auth0/nextjs-auth0';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase.config';

export let getAppProps = async (ctx) => {

  let userSession = await getSession(ctx.req, ctx.res);
  
  // get user data from firestore
  let docRef = doc(db, "users", `${userSession.user.sub}-${userSession.user.email}`);
  let userDocSnap = await getDoc(docRef);

  // if user doesn't exist in firestore, that means they have'nt purchased any tokens or itineraries. so give 0 and []
  if (!userDocSnap.exists()) {
    console.log("doesn't exist!")
    return {
      availableTokens: 0,
      itineraries: [],
    }
  }

  // get user's itineraries from firestore
  let rawItineraries = await getDocs(query(collection(db, "itineraries"), where("userId", "==", `${userSession.user.sub}-${userSession.user.email}`)));

  // sort itineraries by created date
  let sortedItineraries = rawItineraries.docs.sort((a, b) => {
    return b.data().created - a.data().created;
  })

  
  // return the first 5 itineraries and the user's available tokens
  return {
    availableTokens: userDocSnap.data().availableTokens,
    itineraries: sortedItineraries.slice(0, 5).map((doc) => {
      return { ...doc.data(), created: new Date(doc.data().created).toString() }
    }),
    itineraryId: ctx.params?.itineraryId || null,
  }
};
