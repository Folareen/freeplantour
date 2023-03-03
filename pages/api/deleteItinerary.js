import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { ObjectId } from 'mongodb';
import clientPromise from '../../lib/mongodb';

export default withApiAuthRequired(async function handler(req, res) {
  console.log('got to api call')
  try {
    const {
      user: { sub },
    } = await getSession(req, res);
    const client = await clientPromise;
    const db = client.db('Freeplantour');
    const userProfile = await db.collection('users').findOne({
      auth0Id: sub,
    });

    const { itineraryId } = req.body;

    await db.collection('itineraries').deleteOne({
      userId: userProfile._id,
      _id: new ObjectId(itineraryId),
    });

    res.status(200).json({ success: true });
  } catch (e) {
    console.log('ERROR TRYING TO DELETE A itinerary: ', e);
  }
  return;
});
