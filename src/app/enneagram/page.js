'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import questionsData from '../data/enneagramQuestions';
import useScrollToTop from '@/hooks/use-top-scroll';

export default function EnneagramQuiz() {
  const [statements, setStatements] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [analysis, setAnalysis] = useState('');
  const [feedbackPrompt, setFeedbackPrompt] = useState(false);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const router = useRouter();

  const totalQuestions = 18; 

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  useEffect(() => {
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
      setCurrentQuestionIndex(0); // reset index for stage 1
    } else if (stage === 2) {
      setCurrentQuestionIndex(0); // reset index for stage 2
    }
  }, [stage]);

  useScrollToTop(stage);

  const handleChange = (e, index) => {
    const value = e.target.value;
    const newAnswers = [...answers];
    newAnswers[index].answer = parseInt(value, 10);
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < statements.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    // for the current stage
    const allAnswered =
      answers.length === statements.length &&
      answers.every((answerObj) => answerObj.answer !== '');

    if (!allAnswered) {
      alert('Please answer all statements before submitting.');
      setLoading(false);
      return;
    }

    if (stage === 1) {
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

        setStatements(data.newQuestions);
        setAnswers(
          data.newQuestions.map((question) => ({
            type: question.type,
            statement: question.statement,
            answer: '',
          }))
        );
        setCurrentQuestionIndex(0); // Reset index for stage 2
        setStage(2);
        setLoading(false);
      } catch (err) {
        console.error('Error analyzing answers:', err);
        setError(err.message);
        setLoading(false);
      }
    } else if (stage === 2) {
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
        setLoading(false);
      } catch (err) {
        console.error('Error analyzing final answers:', err);
        setError(err.message);
        setLoading(false);
      }
    }
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
        <h2 className="text-4xl font-extrabold text-gray-800 dark:text-gray-200">
          Personalizing your quiz...
        </h2>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  // calculate answered questions for progress bar
  const answeredQuestions =
    stage === 1 ? currentQuestionIndex + 1 : 9 + currentQuestionIndex + 1; 

  return (
    <div className="p-6 bg-cardBackground rounded-lg shadow-md max-w-[50rem] mx-auto mt-20">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Enneagram Quiz {stage === 1 ? 'Part 1/2' : 'Part 2/2'}
      </h2>
      <hr className="border-t border-gray-300 dark:border-gray-600 my-4" />

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
        <div
          className="bg-blue-600 h-4 rounded-full transition-width duration-300"
          style={{
            width: `${(answeredQuestions / totalQuestions) * 100}%`,
          }}
        ></div>
      </div>

      {!feedbackPrompt ? (
        <div className="space-y-10">
          {statements.length > 0 && (
            <div key={currentQuestionIndex} className="space-y-6">
              <span className="block text-gray-400 text-sm font-medium">
                Question {answeredQuestions} of {totalQuestions}
              </span>
              <label className="block text-lg sm:text-xl font-medium text-gray-900 dark:text-gray-50 leading-tight">
                {statements[currentQuestionIndex].statement}
              </label>
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
                        name={`statement-${currentQuestionIndex}`}
                        value={value}
                        checked={answers[currentQuestionIndex]?.answer === value}
                        onChange={(e) => handleChange(e, currentQuestionIndex)}
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
          )}

          <div className="flex justify-between mt-4">
          {currentQuestionIndex > 0 && (
            <button
              type="button"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="mt-4 px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Previous
            </button>
          )}
            {currentQuestionIndex < statements.length - 1 ? (
              <button
                type="button"
                onClick={handleNextQuestion}
                  className="mt-4 px-6 py-2 bg-accent text-white rounded hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="mt-6 px-6 py-3 bg-accent text-white text-lg rounded-md hover:bg-blue-700 dark:hover:bg-blue-900 transition-colors duration-300"
                disabled={loading}
              >
                {loading
                  ? stage === 1
                    ? 'Personalizing statements...'
                    : 'Analyzing Results...'
                  : stage === 1
                  ? 'Submit & Continue'
                  : 'Submit & Get Results'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
          <h2 className="text-xl font-bold mb-2">Your Results</h2>
          <p className="whitespace-pre-line">{analysis}</p>
          <div className="mt-4">
            <p className="text-gray-800 dark:text-gray-300">Do you agree with the analysis?</p>
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
        </div>
      )}
    </div>
  );
}