import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
apiKey: process.env.OPENAI_API_KEY,
});

// generate questions 
async function generateZodiacQuestions() {
  const prompt = `
  Generate 5 personality-related questions that will help determine a person's likely zodiac sign.
  Each question should have four distinct options, but do not label them with zodiac signs. Each option should describe different aspects of personality, such as how a person approaches challenges or how they prefer to socialize.
  
  Format the response like this:
  
  1. How do you react to a new challenge?
  a) I dive in headfirst, ready to take action.
  b) I plan everything carefully before taking the first step.
  c) I like to brainstorm and get input from others before deciding.
  d) I take my time weighing the pros and cons before moving forward.
  
  Avoid using specific zodiac sign labels in the options themselves. Focus on creating diverse personality traits for each option.
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a personality quiz generator.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 600,
  });

  if (!response || !response.choices || response.choices.length === 0) {
    throw new Error('Failed to generate zodiac questions');
  }

  const questionsRaw = response.choices[0].message.content;

  // parse the response into structured questions with four options
  const questionsArray = questionsRaw
    .split(/\n(?=\d+\.\s)/) 
    .filter(Boolean) 
    .map((questionText) => {
      const [questionPart, ...optionsPart] = questionText
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

      return {
        question: questionPart || 'Question undefined',
        options: optionsPart.map(opt => opt.replace(/^[a-d]\)\s*/, '').trim()),
      };
    })
    .slice(0, 5);  

  return questionsArray;
}

export async function POST(request) {
    try {
      const { action, questionAnswers } = await request.json();

if (action === 'generate') {
    // generate zodiac-related questions
    const questions = await generateZodiacQuestions();
    return NextResponse.json({ questions });

} else if (action === 'analyze') {
    const responsesText = questionAnswers
    .map(
      (qa, idx) => `Q${idx + 1}: ${qa.question}\nA${idx + 1}: ${qa.answer}`
    )
    .join('\n\n');

    const prompt = `
    You are an expert at analyzing personality traits to determine a person's zodiac sign based on their answers.
    
    Below are 5 questions related to personality traits and zodiac signs, along with the user's responses:
    
    ${responsesText}
    
    Based on these responses, identify the zodiac sign that most closely matches the traits.
    Please consider the following zodiac signs and their key characteristics when making your decision.

    
    Respond with:
    "The most likely zodiac sign is: [zodiac sign]."
    
    Then, briefly explain how the user's responses align with the traits of this zodiac sign.
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

  if (!response || !response.choices || response.choices.length === 0) {
    throw new Error('Failed to guess zodiac sign');
  }

  const guessedZodiac = response.choices[0].message.content.trim();
  return NextResponse.json({ guessedZodiac });
} else {
  return NextResponse.json({ error: 'Invalid action provided' }, { status: 400 });
}
} catch (error) {
console.error(error);
return NextResponse.json({ error: error.message }, { status: 500 });
}
}