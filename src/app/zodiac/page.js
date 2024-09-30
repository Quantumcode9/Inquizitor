'use client';

// pages/zodiac-quiz.js
import { useState, useEffect } from 'react';

export default function ZodiacQuiz() {
const [questions, setQuestions] = useState([]);
const [answers, setAnswers] = useState({});
const [guessedZodiac, setGuessedZodiac] = useState('');

// Fetch questions from backend
useEffect(() => {
const fetchQuestions = async () => {
    const response = await fetch('/api/getZodiac', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generate' })
    });

    const data = await response.json();
    setQuestions(data.questions);
};

fetchQuestions();
}, []);

const handleChange = (e) => {
const { name, value } = e.target;
setAnswers({ ...answers, [name]: value });
};

const handleSubmit = async (e) => {
e.preventDefault();

const response = await fetch('/api/getZodiac', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'analyze', answers: Object.values(answers) })
});

const data = await response.json();
setGuessedZodiac(data.guessedZodiac);
};

return (
<div>
    <h1>Zodiac Quiz</h1>
    {!guessedZodiac ? (
    <form onSubmit={handleSubmit}>
        {questions.map((question, index) => (
        <div key={index}>
            <label>{question.question}</label>
            {question.options.map((option, optIndex) => (
            <div key={optIndex}>
                <input
                type="radio"
                id={`question-${index}-${optIndex}`}
                name={`question-${index}`}
                value={option}
                onChange={handleChange}
                />
                <label htmlFor={`question-${index}-${optIndex}`}>{option}</label>
            </div>
            ))}
        </div>
        ))}
        <button type="submit">Submit</button>
    </form>
    ) : (
    <div>
        <h2>Your Zodiac Sign is: {guessedZodiac}</h2>
    </div>
    )}
</div>
);
}