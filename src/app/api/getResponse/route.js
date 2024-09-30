// app/api/getPersonalityType/route.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Static list of questions to be matched with answers (same as your questions.json)
const questions = [
  "How do you recharge your energy after a long day?",
  "Do you prefer to stick to plans or adapt as you go?",
  "Do you focus more on details or the big picture when approaching a problem?",
  "Do you find it easy to strike up conversations with strangers?",
  "When resolving disputes, do you prioritize logic or people's feelings?",
  "Do you tend to complete tasks well ahead of deadlines or wait until the last minute?",
  "How do you typically spend your weekends?",
  "When faced with a tough decision, do you rely more on logic or your gut feelings?",
  "Do you prefer structured activities or spontaneous plans for your weekend?",
  "Do you focus on concrete facts or abstract ideas?",
  "Do you find it easier to make decisions based on fairness or empathy?",
  "Do you tend to think more about the present or the future?",
];

export async function POST(request) {
  try {
    const { answers } = await request.json();

    // Ensure answers are received and the length matches the questions
    if (!answers || answers.length !== questions.length) {
      return NextResponse.json({ error: 'Answers do not match the number of questions' }, { status: 400 });
    }

     // Construct the prompt by pairing static questions with received answers
     let formattedQA = '';
     for (let i = 0; i < questions.length; i++) {
       formattedQA += `${i + 1}. ${questions[i]}\n Answer: ${answers[i]}\n\n`;
     }
 
     const prompt = `
     You are a highly advanced personality analysis AI. Based on the user's answers, analyze their personality type.
 
     Answers:
     ${formattedQA}
 
     Based on these answers, give the personality type of the user. Provide an brief explanation and reasoning behind the placement.
 
     At the end of the response, ask the user if they'd like a guess of their zodiac sign based on this analysis.
     `;
 
     // Send the request to OpenAI
     const response = await openai.chat.completions.create({
       model: 'gpt-4o-mini',
       messages: [
         {
           role: 'system',
           content: 'You are an advanced personality analysis AI.',
         },
         {
           role: 'user',
           content: prompt,
         },
       ],
       temperature: 0.7,
       max_tokens: 500,
     });
 
     const choices = response.choices;
     if (!choices || choices.length === 0) {
       throw new Error('No choices returned from OpenAI API');
     }
 
     // Respond with the analysis returned from OpenAI
     return NextResponse.json({ personalityAnalysis: choices[0].message.content });
     
   } catch (error) {
     console.error(error);
     return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
   }
 }