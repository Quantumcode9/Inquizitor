'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import questionsData from '../data/zodiacQuestions';
import useScrollToTop from '@/hooks/use-top-scroll';
import { motion } from 'framer-motion'; // You'll need to: yarn add framer-motion

export default function ZodiacQuiz() {
const [questions, setQuestions] = useState([]);
const [answers, setAnswers] = useState({});
const [elementGroup, setElementGroup] = useState('');
const [additionalQuestions, setAdditionalQuestions] = useState([]);
const [guessedZodiac, setGuessedZodiac] = useState('');
const [stage, setStage] = useState(1);
const [feedbackPrompt, setFeedbackPrompt] = useState(false);
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [currentAdditionalQuestionIndex, setCurrentAdditionalQuestionIndex] = useState(0); 
const router = useRouter();
const containerRef = useRef(null);

useEffect(() => {
    // shuffle questions and their options
    const shuffledQuestions = shuffleArray([...questionsData]).map((question) => ({
        ...question,
        options: shuffleArray([...question.options]),
    }));
    setQuestions(shuffledQuestions);
}, []);


useScrollToTop(stage);

const handleChange = (questionIndex, option) => {
    const name = `question-${questionIndex}`;
    setAnswers((prevAnswers) => ({ ...prevAnswers, [name]: option }));
};



const calculateElementGroup = () => {
    const elementCount = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    questions.forEach((question, index) => {
    const selectedOption = answers[`question-${index}`];
    const selectedOptionData = question.options.find(
        (opt) => opt.option_text === selectedOption
    );
    if (selectedOptionData) {
        const selectedElement = selectedOptionData.element;
        elementCount[selectedElement] += 1;
    }
    });

    const dominantElement = Object.keys(elementCount).reduce((a, b) =>
    elementCount[a] > elementCount[b] ? a : b
    );
    return dominantElement;
};

const handleSubmit = async (e) => {
    e.preventDefault();

    const dominantElement = calculateElementGroup();
    setElementGroup(dominantElement);

    const response = await fetch('/api/getZodiac', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generateAdditionalQuestions', element: dominantElement }),
    });

    const data = await response.json();


console.log("Received data from API:", data);

    if (data.additionalQuestions) {
    setAdditionalQuestions(data.additionalQuestions);
    setStage(2);
    } else {
    alert('Failed to load additional questions.');
    }
};

const handleFinalSubmit = async (e) => {
    e.preventDefault();

    const questionAnswers = additionalQuestions.map((question, index) => ({
    question: question.question,
    answer: answers[`additional-question-${index}`],
    }));

    const response = await fetch('/api/getZodiac', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'analyzeFinalAnswers', questionAnswers, element: elementGroup }),
    });


    const data = await response.json();

    if (data.guessedZodiac) {
    setGuessedZodiac(data.guessedZodiac);
    setStage(3);
    setFeedbackPrompt(true);
    } else {
    alert('Failed to determine your zodiac sign.');
    }
};

const handleFeedback = async (choice) => {
    const feedback = {
    
    analysis: guessedZodiac.guessedZodiac.split('\n')[0],
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
  <div className="max-w-4xl mt-20 mx-auto px-4 py-12">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      ref={containerRef}
      className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden relative"
    >
      {/* Header with cosmic theme */}
      <div className="text-center mb-8 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500"></div>
        <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-400">
          Zodiac Discovery
        </h2>
        <p className="text-gray-500 dark:text-gray-400 italic">Uncover your celestial connection</p>
      </div>
      
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Question {stage === 1 ? currentQuestionIndex + 1 : currentAdditionalQuestionIndex + 15}
          </span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {stage === 1 ? `${currentQuestionIndex + 1}/14` : `${currentAdditionalQuestionIndex + 15}/24`}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ 
              width: `${stage === 1
                ? ((currentQuestionIndex + 1) / 14) * 100
                : ((currentAdditionalQuestionIndex + 15) / 24) * 100}%` 
            }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
          ></motion.div>
        </div>
      </div>

      <hr className="border-t border-gray-200 dark:border-gray-700 my-6" />

      {/* Stage 1: Initial questions */}
      {stage === 1 && (
        <motion.div
          key={`stage1-${currentQuestionIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {questions.length > 0 && questions[currentQuestionIndex] ? (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
                {questions[currentQuestionIndex].question_text}
              </h3>
              <div className="space-y-3">
                {questions[currentQuestionIndex].options.map((option, optIndex) => (
                  <label
                    key={optIndex}
                    htmlFor={`question-${currentQuestionIndex}-${optIndex}`}
                    className={`block p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                      answers[`question-${currentQuestionIndex}`] === option.option_text
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-transparent shadow-lg transform scale-[1.02]'
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500'
                    }`}
                  >
                    <input
                      type="radio"
                      id={`question-${currentQuestionIndex}-${optIndex}`}
                      name={`question-${currentQuestionIndex}`}
                      value={option.option_text}
                      onChange={() => handleChange(currentQuestionIndex, option.option_text)}
                      checked={answers[`question-${currentQuestionIndex}`] === option.option_text}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full mr-3 flex-shrink-0 border-2 ${
                        answers[`question-${currentQuestionIndex}`] === option.option_text
                        ? 'border-white bg-white'
                        : 'border-gray-400 dark:border-gray-400'
                      }`}>
                        {answers[`question-${currentQuestionIndex}`] === option.option_text && 
                          <div className="w-full h-full rounded-full bg-purple-500 transform scale-50"></div>
                        }
                      </div>
                      <span className="text-base">{option.option_text}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-32">
              <div className="animate-pulse flex space-x-2">
                <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentQuestionIndex > 0 && (
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Previous
              </button>
            )}

            <div className="flex-grow"></div>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                disabled={!answers[`question-${currentQuestionIndex}`]}
                className={`px-6 py-2 rounded-lg flex items-center transition-colors ${
                  answers[`question-${currentQuestionIndex}`]
                    ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600'
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
                disabled={!answers[`question-${currentQuestionIndex}`]}
                className={`px-6 py-2 rounded-lg flex items-center transition-colors ${
                  answers[`question-${currentQuestionIndex}`]
                    ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                }`}
              >
                Continue
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H2a1 1 0 110-2h12.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Stage 2: Additional questions */}
      {stage === 2 && (
        <motion.div
          key={`stage2-${currentAdditionalQuestionIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {additionalQuestions.length > 0 && additionalQuestions[currentAdditionalQuestionIndex] ? (
            <div key={currentAdditionalQuestionIndex} className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {additionalQuestions[currentAdditionalQuestionIndex].question}
              </h3>
              <div className="space-y-3">
                {additionalQuestions[currentAdditionalQuestionIndex].responses.map((response, optIndex) => (
                  <label
                    key={optIndex}
                    htmlFor={`additional-question-${currentAdditionalQuestionIndex}-${optIndex}`}
                    className={`block p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                      answers[`additional-question-${currentAdditionalQuestionIndex}`] === response.option_text
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-transparent shadow-lg transform scale-[1.02]'
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500'
                    }`}
                  >
                    <input
                      type="radio"
                      id={`additional-question-${currentAdditionalQuestionIndex}-${optIndex}`}
                      name={`additional-question-${currentAdditionalQuestionIndex}`}
                      value={response.option_text}
                      onChange={() =>
                        setAnswers((prevAnswers) => ({
                          ...prevAnswers,
                          [`additional-question-${currentAdditionalQuestionIndex}`]: response.option_text,
                        }))
                      }
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full mr-3 flex-shrink-0 border-2 ${
                        answers[`additional-question-${currentAdditionalQuestionIndex}`] === response.option_text
                        ? 'border-white bg-white'
                        : 'border-gray-400 dark:border-gray-400'
                      }`}>
                        {answers[`additional-question-${currentAdditionalQuestionIndex}`] === response.option_text && 
                          <div className="w-full h-full rounded-full bg-purple-500 transform scale-50"></div>
                        }
                      </div>
                      <span className="text-base">{response.option_text}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-32">
              <div className="animate-pulse flex space-x-2">
                <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentAdditionalQuestionIndex > 0 && (
              <button
                type="button"
                onClick={() => setCurrentAdditionalQuestionIndex(currentAdditionalQuestionIndex - 1)}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Previous
              </button>
            )}

            <div className="flex-grow"></div>

            {currentAdditionalQuestionIndex < additionalQuestions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentAdditionalQuestionIndex(currentAdditionalQuestionIndex + 1)}
                disabled={!answers[`additional-question-${currentAdditionalQuestionIndex}`]}
                className={`px-6 py-2 rounded-lg flex items-center transition-colors ${
                  answers[`additional-question-${currentAdditionalQuestionIndex}`]
                    ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600'
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
                onClick={handleFinalSubmit}
                disabled={!answers[`additional-question-${currentAdditionalQuestionIndex}`]}
                className={`px-6 py-2 rounded-lg flex items-center transition-colors ${
                  answers[`additional-question-${currentAdditionalQuestionIndex}`]
                    ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600'
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
        </motion.div>
      )}

      {/* Stage 3: Results */}
      {stage === 3 && guessedZodiac && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-8">
            <div className="w-28 h-28 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-5xl text-white">♈</span>
            </div>
            <h2 className="text-gray-600 dark:text-gray-400 text-lg mb-2">Your zodiac sign is most likely</h2>
            <h3 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-400">
              {guessedZodiac.guessedZodiac.split('\n')[0]}
            </h3>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl mb-8 text-left">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Analysis:</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {guessedZodiac.guessedZodiac.split('\n').slice(2).join(' ')}
            </p>
          </div>

          {feedbackPrompt && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-6 border border-gray-200 dark:border-gray-700 rounded-xl"
            >
              <p className="text-gray-800 dark:text-gray-200 text-lg mb-4">
                Did this result accurately reflect your zodiac sign?
              </p>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => handleFeedback('yes')}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Yes, it's accurate!
                </button>
                <button
                  onClick={() => handleFeedback('no')}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 5.293a1 1 0 011.414 0L10 9.586l4.293-4.293a1 1 0 111.414 1.414l-4.293 4.293L16.707 12a1 1 0 01-1.414 1.414L10 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l4.293-4.293L4.293 6.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  No, it's not accurate.
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  </div>
);

}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}