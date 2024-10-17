import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeFirstSet(answers) {
  console.log('Initial answers:', JSON.stringify(answers, null, 2));

  if (!Array.isArray(answers) || answers.length === 0) {
    throw new Error('Invalid answers format: Expected a non-empty array');
  }


  let filteredAnswers = answers.filter(answerObj => answerObj.answer >= 4);


  if (filteredAnswers.length < 3) {
    const fallbackAnswers = answers.filter(answerObj => answerObj.answer === 3);
    filteredAnswers = [...filteredAnswers, ...fallbackAnswers];
  }

  filteredAnswers.sort((a, b) => b.answer - a.answer || a.type - b.type);

  // Ensure we only send the top 3 answers
  const top3Answers = filteredAnswers.slice(0, 3);

  console.log('Top 3 answers:', JSON.stringify(top3Answers, null, 2));

  const formattedAnswers = top3Answers
    .map(answerObj => `Type ${answerObj.type}: ${answerObj.statement}`)
    .join('\n');

  console.log('Formatted answers for prompt:', formattedAnswers);

  const prompt = `
  You are an advanced AI trained in personality typing using the Enneagram model. 
  Based on the user's responses to the Enneagram statements, narrow down the possible types to the top 3 most likely Enneagram types.

  Here are the user's responses:
  ${formattedAnswers}

  For each of these 3 types, generate exactly 3 new questions. Ensure the questions are phrased in a way that does not mention any specific type, and they should be answered on a Likert scale from 1 (Strongly Disagree) to 5 (Strongly Agree).

  Return only the questions in the response, with their associated Enneagram type. Format each as: "Type X: Question".
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an advanced personality quiz generator.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });


  if (!response || !response.choices || response.choices.length === 0) {
    throw new Error('No valid response from OpenAI');
  }

  const newQuestionsRaw = response.choices[0].message.content;

    // Log the raw new questions content
    console.log('Raw new questions content:', newQuestionsRaw);
  // make sure the response isn't empty
  if (!newQuestionsRaw) {
    throw new Error('Received an invalid response content from OpenAI');
  }

  // parse new questions with valid structure
  const newQuestions = newQuestionsRaw.split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(questionLine => {
      const [type, question] = questionLine.split(': ', 2);
      if (!type || !question) {
        throw new Error('Invalid question format in OpenAI response');
      }
      return {
        type: parseInt(type.match(/\d+/)[0], 10), // extract the Enneagram type number
        statement: question.trim(),
      };
    });

  return newQuestions;
}

async function analyzeFinalSet(answers) {
  const formattedAnswers = answers
    .map((answerObj) => `Type ${answerObj.type}: ${answerObj.answer}`)
    .join('\n');

    console.log('Formatted answers for prompt 2:', formattedAnswers);
  const prompt = `
You are an advanced AI that determines a user's Enneagram personality type based on their responses to statements corresponding to specific types.

Here are the user's responses:
${formattedAnswers}

Using this data, calculate the user's most dominant Enneagram type and their wing. 

Your response should be structured as follows:

"You are a Type <number>: <Type Name>"
"You have a wing of <number>: <Type Name>"
"This makes you a <Full Type (e.g., 3w4)>"

2-3 sentence analysis:
[Provide a brief analysis here.]

Ensure that the analysis is concise and reflects the user's answers accurately.
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an advanced personality analyzer.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  console.log('OpenAI response 2:', JSON.stringify(response, null, 2));

  if (!response || !response.choices || response.choices.length === 0) {
    throw new Error('Failed to analyze final answers');
  }

  return response.choices[0].message.content;
}
// POST handler
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, answers } = body;

    // ensure that answers are properly formatted as an array
    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Invalid answers format: Expected a non-empty array' }, { status: 400 });
    }

    if (action === 'analyzeFirstSet') {
      const newQuestions = await analyzeFirstSet(answers);
      return NextResponse.json({ newQuestions });
    } else if (action === 'analyzeFinalSet') {
      const analysis = await analyzeFinalSet(answers);
      return NextResponse.json({ analysis });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}