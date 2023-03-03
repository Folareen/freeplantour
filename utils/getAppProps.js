import { getSession } from '@auth0/nextjs-auth0';
import clientPromise from '../lib/mongodb';

export const getAppProps = async (ctx) => {
  const userSession = await getSession(ctx.req, ctx.res);
  console.log('USER SESSION: ', userSession);
  console.log('RES: ', ctx.res);
  const client = await clientPromise;
  const db = client.db('Freeplantour');
  const user = await db.collection('users').findOne({
    auth0Id: userSession.user.sub,
  });

  if (!user) {
    return {
      availableTokens: 0,
      Itineraries: [],
    };
  }

  const Itineraries = await db
    .collection('itineraries')
    .find({
      userId: user._id,
    })
    .limit(5)
    .sort({
      created: -1,
    })
    .toArray();

  return {
    availableTokens: user.availableTokens,
    Itineraries: Itineraries.map(({ created, _id, userId, ...rest }) => ({
      _id: _id.toString(),
      created: created.toString(),
      ...rest,
    })),
    itineraryId: ctx.params?.itineraryId || null,
  };
};
