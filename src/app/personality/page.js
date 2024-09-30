'use client';

import { useState, useEffect } from 'react';

export default function Questionnaire() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [analysis, setAnalysis] = useState('');
  const [zodiacPrompt, setZodiacPrompt] = useState(false);

  // Fetch AI-generated questions when component loads
  useEffect(() => {
    const fetchQuestions = async () => {
      const response = await fetch('/api/getResponse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' })
      });

      const data = await response.json();
      setQuestions(data.questions); // Assuming the questions are structured properly
    };

    fetchQuestions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers({ ...answers, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/getResponse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'analyze', answers: Object.values(answers) })
    });

    const data = await response.json();
    setAnalysis(data.analysis);
    setZodiacPrompt(true); // Show zodiac option
  };

  const handleZodiac = async (choice) => {
    if (choice === 'yes') {
      const response = await fetch('//api/getResponse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'zodiac' })
      });

      const data = await response.json();
      alert('Your zodiac sign is: ' + data.zodiac);
    } else {
      alert('Thank you for completing the questionnaire!');
    }
  };

  return (
    <div>
      <h2>Personality Questionnaire</h2>

      {!analysis && (
        <form onSubmit={handleSubmit}>
          {questions.map((question, index) => (
            <div key={index}>
              <label>{question.question}</label>
              <div>
                <input
                  type="radio"
                  id={`question-${index}-a`}
                  name={`question-${index}`}
                  value={question.optionA}
                  onChange={handleChange}
                />
                <label htmlFor={`question-${index}-a`}>
                  {`Option A: ${question.optionA}`}
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id={`question-${index}-b`}
                  name={`question-${index}`}
                  value={question.optionB}
                  onChange={handleChange}
                />
                <label htmlFor={`question-${index}-b`}>
                  {`Option B: ${question.optionB}`}
                </label>
              </div>
              <br />
            </div>
          ))}
          <button type="submit">Submit</button>
        </form>
      )}

      {analysis && <div><p>{analysis}</p></div>}

      {zodiacPrompt && (
        <div>
          <p>Would you like us to guess your zodiac sign based on the analysis?</p>
          <button onClick={() => handleZodiac('yes')}>Yes please</button>
          <button onClick={() => handleZodiac('no')}>No thanks</button>
        </div>
      )}
    </div>
  );
}