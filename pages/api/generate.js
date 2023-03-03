import { Configuration, OpenAIApi } from 'openai'




const generateAction = async (req, res) => {
   // Run first prompt
   console.log(`API: ${req.body.prompt}`)

   const baseCompletion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `${req.body.prompt}`,
      temperature: 0.8,
      max_tokens: 3800,	  
   })


   res.status(200).json({ output: basePromptOutput })
}

export default generateAction