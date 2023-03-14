import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Configuration, OpenAIApi } from 'openai';
import { db } from '../../firebase.config';


export default withApiAuthRequired(async function handler(req, res) {

  console.log('got heeeeeeeereeerererere')

  const { user } = await getSession(req, res);

  // get user data from firestore
  const docRef = doc(db, "users", `${user.sub}-${user.email}`);
  const userDocSnap = await getDoc(docRef);

  // if user doen't have any tokenss, return 403
  if (!userDocSnap.data()?.availableTokens) {
    res.status(403);
    return;
  }


  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
  const openai = new OpenAIApi(configuration)


  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: `${req.body.prompt}` }],
  });
  const response = completion.data.choices[0].message.content;

  console.log(response, 'in api!!')

  res.status(200).json({
    response,
  });
});