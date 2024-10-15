import { NextResponse } from 'next/server';
import questionsData from '@/app/data/zodiacQuestions2';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


async function generateAdditionalQuestions(element) {
  const questionsForElement = questionsData[element]; 
  if (!questionsForElement) {
    throw new Error(`No questions found for element: ${element}`);
  }

  return questionsForElement;
}

async function analyzeFinalAnswers(questionAnswers, element) {
  const zodiacSigns = {
    Water: ['Cancer', 'Scorpio', 'Pisces'],
    Fire: ['Aries', 'Leo', 'Sagittarius'],
    Earth: ['Taurus', 'Virgo', 'Capricorn'],
    Air: ['Gemini', 'Libra', 'Aquarius']
  };

  const signsForElement = zodiacSigns[element];

  if (!signsForElement) {
    throw new Error(`Invalid element: ${element}. Unable to find zodiac signs for this element.`);
  }

  const responsesText = questionAnswers
    .map((qa, idx) => `Q${idx + 1}: ${qa.question}\nA${idx + 1}: ${qa.answer}`)
    .join('\n\n');

  const prompt = `
You are an expert astrologer.

Based on the following responses, determine the most likely zodiac sign. Restrict your answer to the following zodiac signs: ${signsForElement.join(', ')}.

${responsesText}

First respond with the zodiac sign only, without any additional text.

Then, provide a brief explanation.
  `;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert at identifying zodiac signs based on personality traits.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 400,
  });

  if (!response || !response.choices || !response.choices.length) {
    throw new Error('Failed to guess zodiac sign');
  }
  
  const assistantMessage = response.choices[0].message.content.trim();

  return {
    guessedZodiac: assistantMessage
  };
}

export async function POST(request) {
  try {
    const { action, element, questionAnswers } = await request.json();

    console.log('Received request:', { action, element, questionAnswers });

    if (action === 'generateAdditionalQuestions') {
      const additionalQuestions = await generateAdditionalQuestions(element);
      console.log('Generated questions:', additionalQuestions); 
      return NextResponse.json({ additionalQuestions });
    }

    if (action === 'analyzeFinalAnswers') {
      const guessedZodiac = await analyzeFinalAnswers(questionAnswers, element);  
      console.log('Guessed Zodiac:', guessedZodiac); 
      return NextResponse.json({ guessedZodiac });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error occurred:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}