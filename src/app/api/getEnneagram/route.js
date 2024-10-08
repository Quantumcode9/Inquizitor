import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateEnneagramStatements() {
  const prompt = `
Generate exactly 10 Enneagram personality statements that can be answered on a Likert scale from 1 to 5 (1: Strongly Disagree, 5: Strongly Agree). Just provide 10 clear statements. Here are some examples:

1. I strive for perfection in everything I do.
2. I am driven by the need to help others.
`;

  let response;
  try {
    response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a personality quiz generator.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
  } catch (apiError) {
    console.error('Error during OpenAI API call:', apiError);
    throw new Error('Failed to generate Enneagram statements');
  }

  const statementsRaw = response.choices[0].message.content;
  console.log('OpenAI response:', statementsRaw); // For debugging

  // Split the response into individual statements
  const statementsArray = statementsRaw
    .split('\n')
    .map((line) => line.trim()) // Remove extra whitespace
    .filter(Boolean); // Filter out any empty lines

  // Check to ensure 10 statements were generated
  if (statementsArray.length < 10) {
    console.error('Parsing failed. Not enough statements generated.');
    throw new Error('Not enough statements generated');
  }

  return statementsArray.slice(0, 10); // Return the first 10 statements
}

async function analyzeAnswers(answers) {
  // format answers for the prompt
  const formattedAnswers = answers
    .map((answerObj, index) => `Type ${answerObj.type}: ${answerObj.answer}`)
    .join('\n');

  const prompt = `
You are an advanced AI that determines a user's Enneagram personality type based on their responses to a series of statements.

The user has responded to statements associated with each Enneagram type on a Likert scale (1: Strongly Disagree to 5: Strongly Agree). Here are the responses:

${formattedAnswers}

Based on these responses, identify the user's main Enneagram type and their wing. The main type is the one that is most dominant in their responses, and the wing is the adjacent type (numerically) with the next highest level of influence.

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

  if (!response || !response.choices || response.choices.length === 0) {
    throw new Error('Failed to analyze answers');
  }

  const analysis = response.choices[0].message.content;

  // split the analysis into sentences
  const sentences = analysis.match(/[^.!?]+[.!?]+/g) || [];
  const formattedAnalysis = sentences.slice(0, 3).join('.\n') + (sentences.length > 3 ? '.\n' + sentences.slice(3).join(' ') : '');

  return formattedAnalysis;
}

// POST handler
export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Request body:', body); // log the request body

    const { action, answers } = body;

    if (action === 'generate') {
      const statements = await generateEnneagramStatements();
      return NextResponse.json({ statements });
    } else if (action === 'analyze') {
      const analysis = await analyzeAnswers(answers);
      return NextResponse.json({ analysis });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}