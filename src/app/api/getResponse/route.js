import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export async function POST(request) {
  try {
    const { action, answers } = await request.json();

    if (action === 'analyze') {
      // Analyze user's answers
      let formattedQA = '';
      for (let i = 0; i < answers.length; i++) {
        formattedQA += `${i + 1}. Answer: ${answers[i]}\n\n`;
      }


      const prompt = `
      You are an advanced AI that analyzes users' answers to a personality quiz based on the Myers-Briggs Type Indicator (MBTI).
      
      Below are the user's answers to 10 questions, each question corresponding to one of the MBTI dimensions:
      Extraversion (E) vs. Introversion (I)
      Sensing (S) vs. Intuition (N)
      Thinking (T) vs. Feeling (F)
      Judging (J) vs. Perceiving (P)
      
      Answers:
      ${formattedQA}
      
      Based on the user's answers, determine their Myers-Briggs type. Start your analysis with:
      "You are a <MBTI type>."
      
      Then, offer a brief and concise analysis, summarizing the key traits of the personality type. 
      `;
      

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an advanced personality analyzer.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
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