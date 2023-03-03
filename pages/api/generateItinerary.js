import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { Configuration, OpenAIApi } from 'openai';
import clientPromise from '../../lib/mongodb';



export default withApiAuthRequired(async function handler(req, res) {


  const { user } = await getSession(req, res);
  const client = await clientPromise;
  const db = client.db('Freeplantour');
  const userProfile = await db.collection('users').findOne({
    auth0Id: user.sub,
  });

  if (!userProfile?.availableTokens) {
    res.status(403);
    return;
  }

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
  const openai = new OpenAIApi(configuration)

  const baseCompletion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `${req.body.prompt}`,
    temperature: 0.8,
    max_tokens: 3800,
  });

  const response = baseCompletion.data.choices.pop()

  console.log('response: ', response);
  const { output } = response;
  console.log("OpenAI replied...", output?.text);

  const result = await fetch(
    `https://es.wikivoyage.org/w/api.php?origin=*&format=json&formatversion=2&action=parse&page=${req.body.userInput}&prop=text`
  );
  const respon = await result.json();

  console.log('THE RESPONSE!!!', respon)
  const content = respon?.parse?.text ?? ""

  // Eliminar el texto largo con caracteres HTML
  const cleanedContent = content.replace(/Esta guía es [\s\S]*?ayuda a mejorarlo/g, "");
  const cleanedContent2 = cleanedContent.replace(/Este artículo [\s\S]*?otros artículos/g, "");
  const cleanedContent3 = cleanedContent2.replace(/Este artículo [\s\S]*?GNU Free Documentation License/g, "");

  // Eliminar también la palabra "editar" que puede quedar suelta después de la eliminación anterior
  const finalContent = cleanedContent3.replace(/\beditar\b/g, "");

  console.log('final contenttttt', finalContent)

  await db.collection('users').updateOne(
    {
      auth0Id: user.sub,
    },
    {
      $inc: {
        availableTokens: -1,
      },
    }
  );

  const itinerary = await db.collection('itineraries').insertOne({
    apiOutput: response.text,
    info: finalContent,
    title: req.body.userInput,
    userId: userProfile._id,
    created: new Date(),
  });

  console.log('itinerary: ', itinerary);

  res.status(200).json({
    itineraryId: itinerary.insertedId,
  });
});