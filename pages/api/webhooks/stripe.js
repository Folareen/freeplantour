import Cors from 'micro-cors';
import stripeInit from 'stripe';
import verifyStripe from '@webdeveducation/next-verify-stripe';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase.config';

const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = stripeInit(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const handler = async (req, res) => {

  console.log('got to stripe webhook handler')

  if (req.method === 'POST') {
    let event;
    try {
      event = await verifyStripe({
        req,
        stripe,
        endpointSecret,
      });
    } catch (e) {
      console.log('ERROR: ', e);
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {

        const paymentIntent = event.data.object;
        const userId = `${paymentIntent.metadata.sub}-${paymentIntent.metadata.email}`

        // get user data from firestore
        const docRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(docRef);

        // add 10 tokens to user's available tokens
        const userDocRef = doc(db, "users", userId);
        await setDoc(userDocRef, {
          availableTokens: userDocSnap?.data()?.availableTokens ?
            Number(userDocSnap.data()?.availableTokens) + 10 : 10
        })

      }
      default:
        console.log('UNHANDLED EVENT: ', event.type);
    }
    res.status(200).json({ received: true });
  }

  console.log('done with stripe webhook handler')
};

export default cors(handler);
