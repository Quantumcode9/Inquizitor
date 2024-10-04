// app/api/getZodiacQuestions/route.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
apiKey: process.env.OPENAI_API_KEY,
});

// Generate zodiac-related questions based on personality traits
async function generateZodiacQuestions() {
const prompt = `
Generate 4 personality-related questions that help determine a person's zodiac sign. Each question should have four distinct options. Return the questions like this:

- How do you react when faced with a big decision?
a) I analyze every detail before making a choice.
b) I go with my gut feeling.
c) I take quick, bold action.
d) I consult others to get feedback.

- How would you describe your social life?
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
max_tokens: 500,
});

if (!response || !response.choices || response.choices.length === 0) {
throw new Error('Failed to generate zodiac questions');
}

const questionsRaw = response.choices[0].message.content;

// parse the response into structured questions with four options
const questionsArray = questionsRaw
.split('\n- ')  // split by bullet points
.filter(Boolean) // filter out empty strings
.map((questionText) => {
    const [questionPart, ...optionsPart] = questionText.split('\n').map(line => line.trim()).filter(Boolean); // Filter out empty lines here too
    
    return {
    question: questionPart || 'Question undefined',
    options: optionsPart.map(opt => opt.replace(/^[a-d]\)\s*/, '').trim()),
    };
})
.slice(0, 4); //4 questions

return questionsArray; // 4 options
}

export async function POST(request) {
try {
const { action, answers } = await request.json();

if (action === 'generate') {
    // Generate zodiac-related questions
    const questions = await generateZodiacQuestions();
    return NextResponse.json({ questions });

} else if (action === 'analyze') {
    // Directly pass answers to GPT for zodiac analysis
    const prompt = `
    Based on the user's responses, guess their zodiac sign. Here are their answers:

    ${answers.join('\n')}
    
    Based on these responses, what is the most likely zodiac sign for this person?
    `;

    const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
        { role: 'system', content: 'You are an expert at identifying zodiac signs based on personality traits.' },
        { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 150,
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