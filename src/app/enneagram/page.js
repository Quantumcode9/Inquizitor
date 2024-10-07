'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EnneagramQuiz() {
  const [statements, setStatements] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [analysis, setAnalysis] = useState('');
  const [feedbackPrompt, setFeedbackPrompt] = useState(false);
  const [error, setError] = useState(null); 
  const router = useRouter();

  useEffect(() => {
    const fetchStatements = async () => {
      try {
        const response = await fetch('/api/getEnneagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'generate' }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch statements');
        }

        console.log('Fetched statements:', data.statements);

        setStatements(data.statements);
        // Initialize answers array
        setAnswers(
          data.statements.map((item) => ({
            statement: item.statement,
            type: item.type,
            answer: '',
          }))
        );
      } catch (err) {
        console.error('Error fetching statements:', err);
        setError(err.message);
      }
    };

    fetchStatements();
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    const newAnswers = [...answers];
    newAnswers[index].answer = parseInt(value, 10);
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all statements are answered
    const allAnswered = answers.every((answerObj) => answerObj.answer !== '');
    if (!allAnswered) {
      alert('Please answer all statements before submitting.');
      return;
    }

    const requestData = { action: 'analyze', answers };

    try {
      const response = await fetch('/api/getEnneagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze answers');
      }

      setAnalysis(data.analysis);
      setFeedbackPrompt(true);
    } catch (err) {
      console.error('Error analyzing answers:', err);
      setError(err.message);
    }
  };

  const handleFeedback = async (choice) => {
    const feedback = {
      analysis,
      correct: choice === 'yes',
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });

      if (response.ok) {
        alert('Thank you for your feedback!');
        router.push('/');
      } else {
        alert('There was an error submitting your feedback.');
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('There was an error submitting your feedback.');
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-100 rounded-lg shadow-md max-w-[50rem] mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-4 text-red-800">
          An error occurred
        </h2>
        <p>{error}</p>
      </div>
    );
  }

  if (statements.length === 0) {
    return (
      <div className="p-6 bg-cardBackground rounded-lg shadow-md max-w-[50rem] mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          Loading...
        </h2>
      </div>
    );
  }

  return (
    <div className="p-6 bg-cardBackground rounded-lg shadow-md max-w-[50rem] mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Enneagram Quiz
      </h2>

      {!feedbackPrompt ? (
        <form onSubmit={handleSubmit} className="space-y-8">
          {statements.map((item, index) => (
            <div key={index} className="space-y-4">
              
              {/* Statement */}
              <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
                {item.statement}
              </label>

              {/* Likert Scale Options */}
              <div className="flex justify-center gap-6 my-6">
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value} className="flex flex-col items-center group cursor-pointer">
                    <input
                      type="radio"
                      name={`statement-${index}`}
                      value={value}
                      checked={answers[index]?.answer === value}
                      onChange={(e) => handleChange(e, index)}
                      className="sr-only peer"
                    />
                    <span className="block w-10 h-10 bg-gray-200 text-center rounded-full leading-10 text-lg font-semibold text-gray-600 transition-all duration-300 peer-checked:bg-blue-500 peer-checked:text-white peer-focus:ring-4 peer-focus:ring-blue-300 group-hover:bg-blue-100">
                      {value}
                    </span>
                  </label>
                ))}
              </div>

              {/* Divider */}
              <hr className="border-t border-gray-300 dark:border-gray-600 my-4" />
            </div>
          ))}

          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
          >
            Submit
          </button>
        </form>
      ) : (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
          <h2 className="text-xl font-bold mb-2">Your Results:</h2>
          <p className="whitespace-pre-line">{analysis}</p>
          {feedbackPrompt && (
            <div className="mt-4">
              <p className="text-gray-800 dark:text-gray-300">
                Was the analysis correct?
              </p>
              <div className="space-x-2 mt-2">
                <button
                  onClick={() => handleFeedback('yes')}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800"
                >
                  Yes
                </button>
                <button
                  onClick={() => handleFeedback('no')}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800"
                >
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}