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
    <div className="max-w-4xl mx-auto px-4 mt-20 py-12">
      <div className="p-8 bg-cardBackground rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden relative">
        {/* Header with gradient styling */}
        <div className="text-center mb-8 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
          <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            MBTI Personality Quiz
          </h2>
          <p className="text-gray-500 dark:text-gray-400 italic">Discover your personality type</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Question {currentQuestionIndex + 1}
            </span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {currentQuestionIndex + 1}/{questions.length}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
              }}
            ></div>
          </div>
        </div>

        <hr className="border-t border-gray-200 dark:border-gray-700 my-6" />

        {!analysis && (
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            {questions.length > 0 ? (
              <div key={currentQuestionIndex} className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {questions[currentQuestionIndex].question}
                </h3>
                <div className="space-y-3">
                  <label
                    htmlFor={`question-${currentQuestionIndex}-a`}
                    className={`block p-5 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                      selectedOptions[currentQuestionIndex] === questions[currentQuestionIndex].optionA
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-lg transform scale-[1.02]'
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500'
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
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full mr-3 flex-shrink-0 border-2 ${
                        selectedOptions[currentQuestionIndex] === questions[currentQuestionIndex].optionA
                        ? 'border-white bg-white'
                        : 'border-gray-400 dark:border-gray-400'
                      }`}>
                        {selectedOptions[currentQuestionIndex] === questions[currentQuestionIndex].optionA && 
                          <div className="w-full h-full rounded-full bg-blue-500 transform scale-50"></div>
                        }
                      </div>
                      <span className="text-base">{questions[currentQuestionIndex].optionA}</span>
                    </div>
                  </label>

                  <label
                    htmlFor={`question-${currentQuestionIndex}-b`}
                    className={`block p-5 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                      selectedOptions[currentQuestionIndex] === questions[currentQuestionIndex].optionB
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-lg transform scale-[1.02]'
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500'
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
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full mr-3 flex-shrink-0 border-2 ${
                        selectedOptions[currentQuestionIndex] === questions[currentQuestionIndex].optionB
                        ? 'border-white bg-white'
                        : 'border-gray-400 dark:border-gray-400'
                      }`}>
                        {selectedOptions[currentQuestionIndex] === questions[currentQuestionIndex].optionB && 
                          <div className="w-full h-full rounded-full bg-blue-500 transform scale-50"></div>
                        }
                      </div>
                      <span className="text-base">{questions[currentQuestionIndex].optionB}</span>
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-32">
                <div className="animate-pulse flex space-x-2">
                  <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                  <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                  <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              {currentQuestionIndex > 0 ? (
                <button
                  type="button"
                  onClick={handlePreviousQuestion}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Previous
                </button>
              ) : (
                <div></div> 
              )}

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={!selectedOptions[currentQuestionIndex]}
                  className={`px-6 py-2 rounded-lg flex items-center transition-colors ${
                    selectedOptions[currentQuestionIndex]
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  }`}
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H2a1 1 0 110-2h12.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!selectedOptions[currentQuestionIndex]}
                  className={`px-6 py-2 rounded-lg flex items-center transition-colors ${
                    selectedOptions[currentQuestionIndex]
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  }`}
                >
                  Get Results
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H2a1 1 0 110-2h12.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </form>
        )}

        {analysis && (
          <div className="mt-8 space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{analysis.split('\n')[0].replace(/[^A-Z]/g, '')}</span>
            </div>
            <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              {analysis.split('\n')[0]}
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full my-4"></div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="prose dark:prose-invert max-w-none">
              {analysis.split('\n').slice(1).map((paragraph, i) => (
                <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          
          {feedbackPrompt && (
            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                How accurate was this result?
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => handleFeedback('yes')}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors flex items-center justify-center sm:justify-start"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Very Accurate
                </button>
                <button
                  onClick={() => handleFeedback('no')}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-colors flex items-center justify-center sm:justify-start"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Not Accurate
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Your feedback helps us improve our personality analysis
              </p>
            </div>
          )}
          
          <div className="flex justify-center mt-6">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}