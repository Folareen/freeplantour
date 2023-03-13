import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';

export default withApiAuthRequired(async function handler(req, res) {
  console.log('got to api call')
  try {
    const {
      user: { sub },
    } = await getSession(req, res);

    // delete itinerary from firestore
    await deleteDoc(doc(db, "itineraries", req.body.itineraryId));


    res.status(200).json({ success: true });
  } catch (e) {
    console.log('ERROR TRYING TO DELETE A itinerary: ', e);
  }
  return;
});
