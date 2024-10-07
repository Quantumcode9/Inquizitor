import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// cache
let cachedStatements = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60 * 1000; 


// Generate Enneagram personality statements
async function generateEnneagramStatements() {

  if (cachedStatements && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log('Using cached statements.');
    return cachedStatements;
  }

  const prompt = `
Generate exactly 10 Enneagram personality statements that can be answered on a Likert scale from 1 to 5 (1: Strongly Disagree, 5: Strongly Agree). Each statement should reflect characteristics of one specific Enneagram type. For each statement, include the Enneagram type number at the beginning, like this:

Type 1: I strive for perfection in everything I do.
Type 2: I am driven by the need to help others.
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

  const statementsArray = statementsRaw
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const match = line.trim().match(/^Type\s*(\d+):\s*(.+)$/);
      if (match) {
        return {
          type: parseInt(match[1], 10),
          statement: match[2],
        };
      }
      console.warn(`Line did not match expected pattern: ${line}`);
      return null;
    })
    .filter(Boolean);
  
  if (statementsArray.length === 0) {
    throw new Error('Failed to generate Enneagram statements: No valid statements found');
  }
  
  cachedStatements = statementsArray;
  cacheTimestamp = Date.now();
  
  return statementsArray;
}

async function analyzeAnswers(answers) {
  // Format answers for the prompt
  const formattedAnswers = answers
    .map((answerObj, index) => `Type ${answerObj.type}: ${answerObj.answer}`)
    .join('\n');

  const prompt = `
You are an advanced AI that determines a user's Enneagram personality type based on their responses to a series of statements.

The user has responded to statements associated with each Enneagram type on a Likert scale (1: Strongly Disagree to 5: Strongly Agree). Here are the responses:

${formattedAnswers}

Based on these responses, identify the user's main Enneagram type and their wing. The main type is the one that is most dominant in their responses, and the wing is the adjacent type (numerically) with the next highest level of influence.

Your response should be structured as follows:

"You are a Type <number>: <Type Name>."
"You have a wing of <number>: <Type Name>."
"This makes you a <Full Type (e.g., 3w4)> <Type Name>."

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

  // Split the analysis into sentences
  const sentences = analysis.match(/[^.!?]+[.!?]+/g) || [];
  const formattedAnalysis = sentences.slice(0, 3).join('.\n') + (sentences.length > 3 ? '.\n' + sentences.slice(3).join(' ') : '');

  return formattedAnalysis;
}

// POST handler
export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { action, answers } = body;

    if (!action) {
      console.error('Action is undefined');
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    if (action === 'generate') {
      // Generate statements
      const statements = await generateEnneagramStatements();
      if (!statements || statements.length === 0) {
        throw new Error('Failed to generate statements');
      }
      return NextResponse.json({ statements });
    } else if (action === 'analyze') {
      if (!answers) {
        console.error('Answers are undefined');
        return NextResponse.json({ error: 'Answers are required for analysis' }, { status: 400 });
      }
      // Analyze answers
      const analysis = await analyzeAnswers(answers);
      return NextResponse.json({ analysis });
    } else {
      console.warn('Invalid action:', action);
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}