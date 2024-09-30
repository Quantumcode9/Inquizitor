// app/api/getResponse/route.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate random personality questions
async function generatePersonalityQuestions() {
  const prompt = `
  Generate exactly 5 personality-related questions, each with two distinct options labeled as a) and b). Return each question and its options in a clear bullet-point format, like this:

  - How do you recharge your energy after a long day?
    a) Spending time alone
    b) Socializing with friends
  - How do you prefer to spend your weekends?
    a) At home relaxing
    b) Going out with friends
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a personality quiz generator.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  if (!response || !response.choices || response.choices.length === 0) {
    throw new Error('Failed to generate personality questions');
  }

  const questionsRaw = response.choices[0].message.content;

  // Parse the response into structured questions with options
  const questionsArray = questionsRaw
    .split('\n- ')  // Split by bullet points (assuming OpenAI uses this format)
    .filter(Boolean) // Remove any empty values
    .map((questionText) => {
      const [questionPart, ...optionParts] = questionText.split('\n').map(line => line.trim());
      
      // Extract options assuming OpenAI follows the a) and b) format
      const [optionA, optionB] = optionParts.length > 1 
        ? optionParts.map(opt => opt.replace(/^([a-b])\)/, '').trim()) 
        : ['Option A undefined', 'Option B undefined'];

      return {
        question: questionPart || 'Question undefined',
        optionA,
        optionB,
      };
    });

  return questionsArray; // Return structured questions with options
}

export async function POST(request) {
  try {
    const { action, answers } = await request.json();

    if (action === 'generate') {
      // Step 1: Generate random questions
      const questions = await generatePersonalityQuestions();
      return NextResponse.json({ questions });

    } else if (action === 'analyze') {
      // Step 2: Analyze answers (stubbed, replace with your actual logic)
      let formattedQA = '';
      for (let i = 0; i < answers.length; i++) {
        formattedQA += `${i + 1}. Answer: ${answers[i]}\n\n`;
      }

      const prompt = `
      You are an advanced AI. Based on the user's answers to personality questions, give the user a personality type based on Myers & Briggs theory.
      
      Answers:
      ${formattedQA}

      Analyze the user's personality based on these answers. Provide a one sentence explanation of their traits. At the end of your analysis, ask the user if they would like a guess of their zodiac sign.
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an advanced personality analyzer.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 400,
      });

      if (!response || !response.choices || response.choices.length === 0) {
        throw new Error('Failed to analyze answers');
      }

      const analysis = response.choices[0].message.content;
      return NextResponse.json({ analysis });

    } else if (action === 'zodiac') {
      // Step 3: Provide zodiac sign based on analysis (stubbed)
      const zodiacPrompt = `
      Based on the user's personality traits, make an educated guess about their zodiac sign.
      `;

      const zodiacResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a zodiac sign guesser.' },
          { role: 'user', content: zodiacPrompt },
        ],
        temperature: 0.7,
        max_tokens: 100,
      });

      if (!zodiacResponse || !zodiacResponse.choices || zodiacResponse.choices.length === 0) {
        throw new Error('Failed to guess zodiac sign');
      }

      const zodiac = zodiacResponse.choices[0].message.content;
      return NextResponse.json({ zodiac });

    } else {
      // If the action is not recognized, return an error
      return NextResponse.json({ error: 'Invalid action provided' }, { status: 400 });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}