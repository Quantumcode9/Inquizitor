import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import { validateFeedback } from '@/utils/validation';

const uri = process.env.MONGODB_URI;
let client;

if (!uri) {
throw new Error('Please add your Mongo URI to .env.local');
}

async function connectToDatabase() {
if (!client) {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
}
return client.db('quiz');
}

export async function POST(req) {
try {
    const feedback = await req.json();
    console.log('Received feedback:', feedback); // Log the received feedback

    // Validate feedback
    const { error } = validateFeedback(feedback);
    if (error) {
    console.error('Validation error:', error.details); // Log validation errors
    return NextResponse.json({ message: 'Invalid feedback', error: error.details }, { status: 400 });
    }

    const db = await connectToDatabase();
    const feedbackCollection = db.collection('feedback');

    await feedbackCollection.insertOne(feedback);

    return NextResponse.json({ message: 'Feedback stored successfully' }, { status: 200 });
} catch (error) {
    console.error('Error storing feedback:', error);
    return NextResponse.json({ message: 'Error storing feedback', error }, { status: 500 });
}
}

export async function GET() {
return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}