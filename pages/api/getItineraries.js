import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import clientPromise from '../../lib/mongodb';

export default withApiAuthRequired(async function handler(req, res) {
  try {
    const {
      user: { sub },
    } = await getSession(req, res);
    const client = await clientPromise;
    const db = client.db('Freeplantour');
    const userProfile = await db.collection('users').findOne({
      auth0Id: sub,
    });

    const { lastItineraryDate, getNewerItineraries } = req.body;

    const itineraries = await db
      .collection('itineraries')
      .find({
        userId: userProfile._id,
        created: { [getNewerItineraries ? '$gt' : '$lt']: new Date(lastItineraryDate) },
      })
      .limit(getNewerItineraries ? 0 : 5)
      .sort({ created: -1 })
      .toArray();

    res.status(200).json({ itineraries });
    return;
  } catch (e) {}
});
