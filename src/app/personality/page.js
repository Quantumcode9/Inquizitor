'use client';

import { useState, useEffect } from 'react';
import useScrollToTop from '@/hooks/use-top-scroll';
import staticQuestions from '../data/myersbriggsQuestions.json';
import { useRouter } from 'next/navigation';

export default function Questionnaire() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [analysis, setAnalysis] = useState('');
  const [feedbackPrompt, setFeedbackPrompt] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const router = useRouter();

  useScrollToTop(analysis);

  const selectRandomQuestions = (questionsArray, n) => {
    const selected = [];
    const copy = [...questionsArray];
    for (let i = 0; i < n; i++) {
      const randomIndex = Math.floor(Math.random() * copy.length);
      selected.push(copy.splice(randomIndex, 1)[0]);
    }
    return selected;
  };

  // Fisher-Yates 
  const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
      // Pick a remaining element
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // Swap it with the current element
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  };

  useEffect(() => {
    const generateRandomQuestions = () => {
      // filter questions by type
      const jvPQuestions = staticQuestions.filter(q => q.type === "J vs P");
      const ivEQuestions = staticQuestions.filter(q => q.type === "I vs E");
      const svNQuestions = staticQuestions.filter(q => q.type === "S vs N");
      const tvFQuestions = staticQuestions.filter(q => q.type === "T vs F");

      // select 4 random questions from each type
      const selectedQuestions = [
        ...selectRandomQuestions(jvPQuestions, 4),
        ...selectRandomQuestions(ivEQuestions, 4),
        ...selectRandomQuestions(svNQuestions, 4),
        ...selectRandomQuestions(tvFQuestions, 4),
      ];


      const shuffledQuestions = shuffleArray(selectedQuestions);

      
      setQuestions(shuffledQuestions);
    };

    generateRandomQuestions();
  }, []);

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

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Answers:', answers);

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

  return (
    <div className="p-6 bg-cardBackground rounded-lg mt-24 shadow-md max-w-[50rem] mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        MBTI Quiz 
      </h2>
      <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
    <div
        className="bg-blue-600 h-4 rounded-full transition-width duration-300"
        style={{
        width: `${((currentQuestionIndex + 1) / 16) * 100}%`
        }}
    ></div>
</div>
<hr className="border-t border-gray-300 mb-2 dark:border-gray-600 my-4" />

      {!analysis && (
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {questions.length > 0 && (
            <div key={currentQuestionIndex} className="space-y-4">
              <span className="block text-gray-400 text-sm mb-6 font-medium">
                Question {currentQuestionIndex+ 1 }
              </span>
              <label className="block text-xl font-semibold text-gray-900 dark:text-gray-100">
                {questions[currentQuestionIndex].question}
              </label>
              <div className="space-y-2">
                <label
                  htmlFor={`question-${currentQuestionIndex}-a`}
                  className={`flex items-center justify-center text-base text-center p-4 rounded-lg cursor-pointer transition-colors duration-200 ${
                    selectedOptions[currentQuestionIndex] === questions[currentQuestionIndex].optionA
                      ? 'bg-primary text-white dark:bg-darkPrimary dark:text-gray-100'
                      : 'bg-gray-100 border border-accent dark:bg-[#333] dark:border hover:bg-primary hover:text-white dark:hover:bg-darkPrimary dark:hover:text-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    id={`question-${currentQuestionIndex}-a`}
                    name={`question-${currentQuestionIndex}`}
                    value={questions[currentQuestionIndex].optionA}
                    onChange={() => handleChange(currentQuestionIndex, questions[currentQuestionIndex].optionA)}
                    checked={selectedOptions[currentQuestionIndex] === questions[currentQuestionIndex].optionA}
                    className="sr-only"
                  />
                  <span className="w-full text-center">{questions[currentQuestionIndex].optionA}</span>
                </label>

                <label
                  htmlFor={`question-${currentQuestionIndex}-b`}
                  className={`flex items-center justify-center text-base text-center p-4 rounded-lg cursor-pointer transition-colors duration-200 ${
                    selectedOptions[currentQuestionIndex] === questions[currentQuestionIndex].optionB
                      ? 'bg-primary text-white dark:bg-darkPrimary dark:text-gray-100'
                      :  'bg-gray-100 border border-accent dark:bg-[#333] dark:border hover:bg-primary hover:text-white dark:hover:bg-darkPrimary dark:hover:text-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    id={`question-${currentQuestionIndex}-b`}
                    name={`question-${currentQuestionIndex}`}
                    value={questions[currentQuestionIndex].optionB}
                    onChange={() => handleChange(currentQuestionIndex, questions[currentQuestionIndex].optionB)}
                    checked={selectedOptions[currentQuestionIndex] === questions[currentQuestionIndex].optionB}
                    className="sr-only"
                  />
                  <span className="w-full text-center">{questions[currentQuestionIndex].optionB}</span>
                </label>
              </div>
              <hr className="border-t border-gray-300 dark:border-gray-600 my-4" />
            </div>
          )}

<div className="flex justify-between mt-4">
            {currentQuestionIndex > 0 && (
              <button
                type="button"
                onClick={handlePreviousQuestion}
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Previous
              </button>
            )}

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-6 py-2 bg-accent text-white rounded hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Submit
              </button>
            )}
          </div>
        </form>
      )}

      {analysis && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
          <p className="whitespace-pre-line">
            <span className="font-bold text-2xl">{analysis.split('\n')[0]}</span>
            <span>{analysis.split('\n').slice(1).join('\n')}</span>
          </p>
        </div>
      )}

      {feedbackPrompt && (
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
      )}
    </div>
  );
}