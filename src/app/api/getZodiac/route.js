import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
apiKey: process.env.OPENAI_API_KEY,
});

// generate questions 
async function generateZodiacQuestions() {
const prompt = `
Generate 7 personality-related questions that help determine a person's zodiac sign. 
Each question should have four distinct options. Return the questions like this:

1. How do you react when faced with a big decision?
a) I analyze every detail before making a choice.
b) I go with my gut feeling.
c) I take quick, bold action.
d) I consult others to get feedback.

2. How would you describe your social life?
a) I love being the center of attention at big gatherings.
b) I prefer small, intimate settings with close friends.
c) I enjoy socializing but need alone time to recharge.
d) I’m always meeting new people and exploring new ideas.
`;

const response = await openai.chat.completions.create({
model: 'gpt-4o-mini',
messages: [
    { role: 'system', content: 'You are a personality quiz generator.' },
    { role: 'user', content: prompt },
],
temperature: 0.7,
max_tokens: 700,
});

if (!response || !response.choices || response.choices.length === 0) {
throw new Error('Failed to generate zodiac questions');
}

const questionsRaw = response.choices[0].message.content;

// parse the response into questions with four options
const questionsArray = questionsRaw
.split(/\n(?=\d+\.\s)/) 
.filter(Boolean) 
.map((questionText) => {
    const [questionPart, ...optionsPart] = questionText.split('\n').map(line => line.trim()).filter(Boolean); 
    
    return {
    question: questionPart || 'Question undefined',
    options: optionsPart.map(opt => opt.replace(/^[a-d]\)\s*/, '').trim()),
    };
})
.slice(0, 7); // 7 question

return questionsArray; // 4 options
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
Based on the user's responses, analyze their personality traits and determine their most likely zodiac sign. 
Here are the questions and responses:

${responsesText}

Using all of these responses, identify the zodiac sign that best matches the traits. 
Respond with the zodiac sign in the following format:
"The most likely zodiac sign is: [zodiac sign]."

Provide a brief explanation of how the traits from the user's responses align with the characteristics of this zodiac sign.
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert at identifying zodiac signs based on personality traits.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 250,
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