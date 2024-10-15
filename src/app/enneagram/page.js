'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import questionsData from '../data/enneagramQuestions';

export default function EnneagramQuiz() {
  const [statements, setStatements] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [analysis, setAnalysis] = useState('');
  const [feedbackPrompt, setFeedbackPrompt] = useState(false);
  const [error, setError] = useState(null); 
  const [stage, setStage] = useState(1); // 1 for first set, 2 for second set
  const router = useRouter();

  //fisher-yates shuffle: a brand new dance 
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
      [array[i], array[j]] = [array[j], array[i]]; // swap elements
    }
    return array;
  }


  useEffect(() => {
    // stage 1 the first 9 questions
    if (stage === 1) {
      const shuffledQuestions = shuffleArray([...questionsData]); 
      setStatements(shuffledQuestions);
      setAnswers(
        shuffledQuestions.map((question) => ({
          type: question.type, 
          statement: question.statement,
          answer: '', 
        }))
      );
    }
  }, [stage]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    const newAnswers = [...answers];
    newAnswers[index].answer = parseInt(value, 10);
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // check if all questions are answered
    const allAnswered = answers.every((answerObj) => answerObj.answer !== '');
    if (!allAnswered) {
      alert('Please answer all statements before submitting.');
      return;
    }

    if (stage === 1) {
      // submit answers for first 9 questions
      const requestData = { action: 'analyzeFirstSet', answers };
      
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

        // store the new questions in statements and move to stage 2
        setStatements(data.newQuestions); //dynamically generated questions
        setAnswers(
          data.newQuestions.map((question) => ({
            type: question.type, // new types based on narrowed analysis
            statement: question.statement,
            answer: '', 
          }))
        );
        setStage(2); // move to the next stage

      } catch (err) {
        console.error('Error analyzing answers:', err);
        setError(err.message);
      }
    } else if (stage === 2) {
      // submit answers for final questions 
      const requestData = { action: 'analyzeFinalSet', answers };
      
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
        console.error('Error analyzing final answers:', err);
        setError(err.message);
      }
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-100 rounded-lg shadow-md max-w-[50rem] mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-4 text-red-800">An error occurred</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (statements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cardBackground mt-24 rounded-lg shadow-lg max-w-[60rem] mx-auto p-14 text-center space-y-8">
        <h2 className="text-4xl font-extrabold text-gray-800 dark:text-gray-200">Personalizing your quiz...</h2>

        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-cardBackground rounded-lg shadow-md max-w-[50rem] mx-auto mt-20">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Enneagram Quiz {stage === 1 ? '(Part 1/2)' : '(Part 2/2)'}
      </h2>
      <hr className="border-t border-gray-300 dark:border-gray-600 my-4" />

      {!feedbackPrompt ? (
    <form onSubmit={handleSubmit} className="space-y-10">
    {statements.map((statementObj, index) => (
      <div key={index} className="space-y-6">
        {/* Question Number */}
        <span className="block text-gray-400 text-sm font-medium">
          Question {index + 1}
        </span>
  
        {/* Statement */}
        <label className="block text-lg sm:text-xl font-medium text-gray-900 dark:text-gray-50 leading-tight">
          {statementObj.statement}
        </label>
  
        {/* Likert Scale Options */}
        <div className="flex justify-between items-center gap-4 my-6">
          <span className="text-gray-500 font-light text-xs sm:text-sm dark:text-gray-400">
            Strongly disagree
          </span>
          <div className="flex justify-center gap-4">
            {[1, 2, 3, 4, 5].map((value) => (
              <label
                key={value}
                className="flex flex-col items-center group cursor-pointer"
              >
                <input
                  type="radio"
                  name={`statement-${index}`}
                  value={value}
                  checked={answers[index]?.answer === value}
                  onChange={(e) => handleChange(e, index)}
                  className="sr-only peer"
                />
                <span className="block w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 text-center rounded-full leading-8 sm:leading-10 text-sm sm:text-lg font-semibold text-gray-600 transition-all duration-300 peer-checked:bg-blue-500 peer-checked:text-white peer-focus:ring-4 peer-focus:ring-blue-300 group-hover:bg-blue-100 dark:bg-gray-700 dark:peer-checked:bg-blue-500 dark:peer-focus:ring-blue-500 dark:text-gray-300">
                  {value}
                </span>
              </label>
            ))}
          </div>
          <span className="text-gray-500 font-light text-xs sm:text-sm dark:text-gray-400">
            Strongly agree
          </span>
        </div>
        <hr className="border-t border-gray-300 dark:border-gray-600 my-4" />
      </div>
    ))}
    <button
      type="submit"
      className="mt-6 px-6 py-3 bg-accent text-white text-lg rounded-md hover:bg-blue-700 dark:hover:bg-blue-900 transition-colors duration-300"
    >
      {stage === 1 ? 'Next' : 'Submit & Get Results'}
    </button>
  </form>
      ) : (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
          <h2 className="text-xl font-bold mb-2">Your Results</h2>
          <p className="whitespace-pre-line">{analysis}</p>
        </div>
      )}
    </div>
  );
}