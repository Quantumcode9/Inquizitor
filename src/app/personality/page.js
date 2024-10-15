'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useScrollToTop from '@/hooks/use-top-scroll';


export default function Questionnaire() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]); 
  const [analysis, setAnalysis] = useState('');
  const [feedbackPrompt, setFeedbackPrompt] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const router = useRouter();


  useEffect(() => {
    const fetchQuestions = async () => {
      const response = await fetch('/api/getResponse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' }),
      });

      const data = await response.json();
      setQuestions(data.questions);
    };

    fetchQuestions();
  }, []);

  // Updated handleChange function
  const handleChange = (questionIndex, option) => {
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[questionIndex] = option;
      return newAnswers;
    });
    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [questionIndex]: option,
    }));
  };

  useScrollToTop(analysis);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/getResponse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'analyze', answers }),
    });

    const data = await response.json();
    setAnalysis(data.analysis);
    setFeedbackPrompt(true);
  };

  const handleFeedback = async (choice) => {
    const feedback = {
      analysis,
      correct: choice === 'yes',
      timestamp: new Date().toISOString(),
    };

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
      router.push('/');
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cardBackground mt-24 rounded-lg shadow-lg max-w-[60rem] mx-auto p-14 text-center space-y-8">
        <h2 className="text-4xl font-extrabold text-gray-800 dark:text-gray-200">Generating quiz...</h2>
        
        {/* Spinner animation */}
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-cardBackground rounded-lg mt-24 shadow-md max-w-[50rem] mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Personality Questionnaire
      </h2>

      {!analysis && (
        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((question, index) => (
            <div key={index} className="space-y-4">
              {/* Question */}
              <label className="block text-base font-semibold text-gray-900 dark:text-gray-100">
                {question.question}
              </label>

              {/* Options */}
              <div className="space-y-2">
                {/* Option A */}
                <label
  htmlFor={`question-${index}-a`}
  className={`flex items-center justify-center text-base text-center p-4 rounded-lg cursor-pointer transition-colors duration-200 ${
    selectedOptions[index] === question.optionA
      ? 'bg-primary text-white dark:bg-darkPrimary dark:text-gray-100'
      : 'bg-gray-100 dark:bg-[#333] hover:bg-primary hover:text-white dark:hover:bg-darkPrimary dark:hover:text-gray-100'
  }`}
>
  <input
    type="radio"
    id={`question-${index}-a`}
    name={`question-${index}`}
    value={question.optionA}
    onChange={() => handleChange(index, question.optionA)}
    checked={selectedOptions[index] === question.optionA}
    className="sr-only"
  />
  <span className="w-full text-center">{question.optionA}</span>
</label>

{/* Option B */}
<label
  htmlFor={`question-${index}-b`}
  className={`flex items-center justify-center text-base text-center p-4 rounded-lg cursor-pointer transition-colors duration-200 ${
    selectedOptions[index] === question.optionB
      ? 'bg-primary text-white dark:bg-darkPrimary dark:text-gray-100'
      : 'bg-gray-100 dark:bg-[#333] hover:bg-primary hover:text-white dark:hover:bg-darkPrimary dark:hover:text-gray-100'
  }`}
>
  <input
    type="radio"
    id={`question-${index}-b`}
    name={`question-${index}`}
    value={question.optionB}
    onChange={() => handleChange(index, question.optionB)}
    checked={selectedOptions[index] === question.optionB}
    className="sr-only"
  />
  <span className="w-full text-center">{question.optionB}</span>
</label>
              </div>

              {/* Divider */}
              <hr className="border-t border-gray-300 dark:border-gray-600 my-4" />
            </div>
          ))}

          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-accent text-white rounded hover:bg-blue-600 dark:hover:bg-blue-800 transition-colors duration-200"
          >
            Submit
          </button>
        </form>
      )}

{analysis && (
  <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
    <p className="whitespace-pre-line ">
      <span className="font-bold text-2xl">
        {analysis.split('\n')[0]}
      </span>
      <span>
        {analysis.split('\n').slice(1).join('\n')}
      </span>
    </p>
  </div>
)}

      {feedbackPrompt && (
        <div className="mt-4">
          <p className="text-gray-800 dark:text-gray-300">
            Do you agree with the analysis?
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
  );
}