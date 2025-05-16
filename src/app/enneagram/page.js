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
          Personalizing your quiz... The questions will get harder!
        </h2>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  // calculate answered questions for progress bar
  const answeredQuestions =
    stage === 1 ? currentQuestionIndex + 1 : 9 + currentQuestionIndex + 1; 

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="p-8 bg-cardBackground rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 mt-20 overflow-hidden relative">
        {/* Header with gradient styling */}
        <div className="text-center mb-8 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
          <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Enneagram Quiz {stage === 1 ? 'Part 1/2' : 'Part 2/2'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 italic">Discover your core motivations</p>
        </div>
        
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Question {answeredQuestions} of {totalQuestions}
            </span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {Math.round((answeredQuestions / totalQuestions) * 100)}% Complete
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full "
              style={{
                width: `${(answeredQuestions / totalQuestions) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <hr className="border-t border-gray-200 dark:border-gray-700 my-6" />

        {!feedbackPrompt ? (
          <div className="space-y-8">
            {statements.length > 0 && (
              <div key={currentQuestionIndex} className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {statements[currentQuestionIndex].statement}
                </h3>
                
                <div className="bg-gray-50 dark:bg-gray-900/30 p-6 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Strongly disagree</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Strongly agree</span>
                  </div>
                  
                  <div className="flex justify-between items-center my-4">
                    <div className="w-full flex justify-between">
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
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            answers[currentQuestionIndex]?.answer === value
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white transform scale-110 shadow-md'
                              : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                            }`}>
                            <span className="text-lg font-medium">{value}</span>
                          </div>
                          
                          {/* Line connecting circles */}
                          {value < 5 && (
                            <div className="absolute h-0.5 bg-gray-200 dark:bg-gray-700 w-full transform translate-x-1/2 top-6"></div>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
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

              {currentQuestionIndex < statements.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={!answers[currentQuestionIndex]?.answer}
                  className={`px-6 py-2 rounded-lg flex items-center transition-colors ${
                    answers[currentQuestionIndex]?.answer
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
                  disabled={loading || !answers[currentQuestionIndex]?.answer}
                  className={`px-6 py-2 rounded-lg flex items-center transition-colors ${
                    (!loading && answers[currentQuestionIndex]?.answer)
                      ? stage === 1 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {stage === 1 ? 'Personalizing...' : 'Analyzing...'}
                    </>
                  ) : (
                    <>
                      {stage === 1 ? 'Continue to Part 2' : 'Get Results'}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H2a1 1 0 110-2h12.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{analysis.charAt(0)}</span>
            </div>
            <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-600">
              {analysis.split('\n')[0]}
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mx-auto rounded-full my-4"></div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="prose dark:prose-invert max-w-none">
              {analysis.split('\n').slice(1).map((paragraph, i) => (
                paragraph.trim() ? (
                  <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ) : null
              ))}
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Does this describe you accurately?
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => handleFeedback('yes')}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors duration-300" 
              >
                Yes
              </button>
              <button
                onClick={() => handleFeedback('no')}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-colors duration-300" 
              >
                No
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}