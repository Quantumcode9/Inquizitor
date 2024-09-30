'use client';

import { useState } from 'react';
import mbQuestions from './questions.json';

export default function Questionnaire() {
  const initialAnswers = mbQuestions.reduce((acc, question) => {
    acc[question.id] = ''; // Initialize each answer to an empty string
    return acc;
  }, {});

  const [answers, setAnswers] = useState(initialAnswers);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers({ ...answers, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Send only the answers (not the questions)
    const payload = {
      answers: Object.values(answers) // Send the answers in an array
    };

    try {
      const response = await fetch('/api/getResponse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.error) {
        alert('Error: ' + result.error);
      } else {
        alert('Your personality type analysis: ' + result.personalityAnalysis);
      }
    } catch (error) {
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div>
      <h2>Personality Questionnaire</h2>
      <form onSubmit={handleSubmit}>
        {mbQuestions.map((question) => (
          <div key={question.id}>
            <label>{question.question}</label>
            {question.options.map((option) => (
              <div key={option.id}>
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={answers[question.id] === option.id}
                  onChange={handleChange}
                />
                <label>{option.text}</label>
              </div>
            ))}
            <br />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}