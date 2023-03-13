import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Configuration, OpenAIApi } from 'openai';
import { db } from '../../firebase.config';


export default withApiAuthRequired(async function handler(req, res) {

  const { user } = await getSession(req, res);

  // get user data from firestore
  const docRef = doc(db, "users", `${user.sub}-${user.email}`);
  const userDocSnap = await getDoc(docRef);

  // if user doen't have any tokens, return 403
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


  console.log(response, 'response: ');
  // const { output } = response;
  // console.log(output?.text, "OpenAI replied...");

  const result = await fetch(
    `https://es.wikivoyage.org/w/api.php?origin=*&format=json&formatversion=2&action=parse&page=${req.body.userInput}&prop=text`
  );
  const respon = await result.json();

  // console.log('THE RESPONSE!!!', respon)
  const content = respon?.parse?.text ?? ""

  const cleanedContent = content.replace(/Esta guía es [\s\S]*?ayuda a mejorarlo/g, "");
  const cleanedContent2 = cleanedContent.replace(/Este artículo [\s\S]*?otros artículos/g, "");
  const cleanedContent3 = cleanedContent2.replace(/Este artículo [\s\S]*?GNU Free Documentation License/g, "");

  const finalContent = cleanedContent3.replace(/\beditar\b/g, "");


  // get user data from firestore
  const userDocRef = doc(db, "users", `${user.sub}-${user.email}`);

  // deduct 1 token from user's available tokens
  await updateDoc(userDocRef, {
    availableTokens: Number(userDocSnap.data().availableTokens) - 1,
  });

  // create custom id for itinerary
  const newItineraryId = String(new Date().getTime())

  // add itinerary to firestore
  await setDoc(doc(db, "itineraries", newItineraryId), {
    apiOutput: response,
    info: finalContent,
    title: `${req.body.userInput} - ${req.body.selectedMonth}`,
    userId: `${user.sub}-${user.email}`,
    created: new Date().toISOString(),
    _id: newItineraryId
  });

  res.status(200).json({
    itineraryId: newItineraryId,
  });
});