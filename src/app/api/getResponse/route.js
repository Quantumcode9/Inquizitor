import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// generate random personality questions
async function generatePersonalityQuestions() {
  const prompt = `
Generate exactly 10 personality-related questions that target the four dimensions of the Myers-Briggs Type Indicator (MBTI).
Each question should focus on one of the following pairs:
- Extraversion (E) vs. Introversion (I)
- Sensing (S) vs. Intuition (N)
- Thinking (T) vs. Feeling (F)
- Judging (J) vs. Perceiving (P)

Ensure that each question focuses on only one dimension and provides two distinct options, labeled a) and b). 
Return each question and its options in a clear bullet-point format, like this:

How do you recharge your energy after a long day?
  a) Spending time alone
  b) Socializing with friends
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a personality quiz generator.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 600,
  });

  if (!response || !response.choices || response.choices.length === 0) {
    throw new Error('Failed to generate personality questions');
  }

  const questionsRaw = response.choices[0].message.content;

  // parse the response into structured questions with options
  const questionsArray = questionsRaw
    .split('\n- ') 
    .filter(Boolean) 
    .map((questionText) => {
      const [questionPart, ...optionParts] = questionText.split('\n').map(line => line.trim());
      
      // Extract options from each question
      const [optionA, optionB] = optionParts.length > 1 
        ? optionParts.map(opt => opt.replace(/^([a-b])\)/, '').trim()) 
        : ['Option A undefined', 'Option B undefined'];

      return {
        question: questionPart || 'Question undefined',
        optionA,
        optionB,
      };
    });

  return questionsArray; 
}

export async function POST(request) {
  try {
    const { action, answers } = await request.json();

    if (action === 'generate') {
      // generate random questions
      const questions = await generatePersonalityQuestions();
      return NextResponse.json({ questions });

    } else if (action === 'analyze') {
      // analyze users answers
      let formattedQA = '';
      for (let i = 0; i < answers.length; i++) {
        formattedQA += `${i + 1}. Answer: ${answers[i]}\n\n`;
      }

      const prompt = `
      You are an advanced AI that analyzes users' answers to a personality quiz based on the Myers-Briggs Type Indicator (MBTI).
      
      Below are the user's answers to 10 questions, each question corresponding to one of the MBTI dimensions:
      1. Extraversion (E) vs. Introversion (I)
      2. Sensing (S) vs. Intuition (N)
      3. Thinking (T) vs. Feeling (F)
      4. Judging (J) vs. Perceiving (P)
      
      Answers:
      ${formattedQA}
      
      Based on the user's answers, determine their Myers-Briggs type. Start your analysis with:
      "You are a <MBTI type>."
      
      Then, offer a brief and concise analysis, summarizing the key traits of the personality type in relation to the user's answers. Keep the tone conversational and insightful.
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

    } else {
      return NextResponse.error(new Error('Invalid action'));
    }
  }
  catch (error) {
    return NextResponse.error({ message: error.message });
  }
}