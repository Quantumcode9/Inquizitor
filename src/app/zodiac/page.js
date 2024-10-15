'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import questionsData from '../data/zodiacQuestions';
import useScrollToTop from '@/hooks/use-top-scroll';

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
    <div
    ref={containerRef} 
    className="p-6 bg-cardBackground rounded-lg shadow-md max-w-[50rem] mx-auto mt-20"
    >   
    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Zodiac Quiz <small>{stage === 1 ? '(Part 1/2)' : '(Part 2/2)'}</small>
    </h2>
    <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
    <div
        className="bg-blue-600 h-4 rounded-full transition-width duration-300"
        style={{
        width: `${stage === 1
            ? ((currentQuestionIndex + 1) / 24) * 100
            : ((currentAdditionalQuestionIndex + 1 + 14) / 24) * 100}%`
        }}
    ></div>
</div>
    <hr className="border-t border-gray-300 dark:border-gray-600 my-4" />
    {stage === 1 && (
<form onSubmit={handleSubmit}>
    {questions.length > 0 && questions[currentQuestionIndex] ? (
    <div className="mb-6">
        <span className="block text-gray-400 text-sm font-medium">
        Question {currentQuestionIndex + 1}
        </span>
        <h3 className="text-lg font-semibold mb-4">
        {questions[currentQuestionIndex].question_text}
        </h3>
        {questions[currentQuestionIndex].options.map((option, optIndex) => (
        <label
            key={optIndex}
            htmlFor={`question-${currentQuestionIndex}-${optIndex}`}
            className={`block p-4 mb-2 rounded-lg cursor-pointer transition-colors duration-200 ${
            answers[`question-${currentQuestionIndex}`] === option.option_text
                ? 'bg-primary text-white dark:bg-darkPrimary dark:text-gray-100'
                : 'bg-gray-100 dark:bg-[#333] hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-gray-100'
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
            <span className="w-full text-base text-center">{option.option_text}</span>
        </label>
        ))}
    </div>
    ) : (
    <p>Loading questions...</p> 
    )}

    {/* Navigation Buttons */}
    <div className="flex justify-between">
    {currentQuestionIndex > 0 && (
        <button
        type="button"
        onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
        className="mt-4 px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
        Previous
        </button>
    )}

    {currentQuestionIndex < questions.length - 1 ? (
        <button
        type="button"
        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
        className="mt-4 px-6 py-2 bg-accent text-white rounded hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
        >
        Next
        </button>
    ) : (
        <button
        type="submit"
        className="mt-4 px-6 py-2 bg-accent text-white rounded hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
        >
        Submit
        </button>
    )}
    </div>
</form>
)}
{stage === 2 && (
<form onSubmit={handleFinalSubmit}>
    {additionalQuestions.length > 0 && additionalQuestions[currentAdditionalQuestionIndex] ? (
    <div key={currentAdditionalQuestionIndex} className="space-y-4">
        <span className="block text-gray-400 text-sm font-medium">
        Question {currentAdditionalQuestionIndex + 15}
        </span>
        <label className="block text-lg font-semibold">
        {additionalQuestions[currentAdditionalQuestionIndex].question}
        </label>
        <div className="space-y-2">
        {additionalQuestions[currentAdditionalQuestionIndex].responses.map((response, optIndex) => (
            <label
            key={optIndex}
            htmlFor={`additional-question-${currentAdditionalQuestionIndex}-${optIndex}`}
            className={`flex items-center justify-center p-4 rounded-lg cursor-pointer ${
                answers[`additional-question-${currentAdditionalQuestionIndex}`] === response.option_text
                ? 'bg-primary text-white dark:bg-darkPrimary dark:text-gray-100'
                : 'bg-gray-100 dark:bg-[#333] hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-gray-100'
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
            <span className="w-full text-base text-center">{response.option_text}</span>
            </label>
        ))}
        </div>
    </div>
    ) : (
    <p>Loading additional questions...</p> 
    )}

    {/* Navigation Buttons */}
    <div className="flex justify-between mt-4">
      {currentAdditionalQuestionIndex > 0 && (
        <button
          type="button"
          onClick={() => setCurrentAdditionalQuestionIndex(currentAdditionalQuestionIndex - 1)}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Previous
        </button>
      )}

      {currentAdditionalQuestionIndex < additionalQuestions.length - 1 ? (
        <button
          type="button"
          onClick={() => setCurrentAdditionalQuestionIndex(currentAdditionalQuestionIndex + 1)}
          className="px-6 py-2 bg-accent text-white rounded hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
        >
          Next
        </button>
      ) : (
        <button
          type="submit"
          className="px-6 py-2 bg-accent text-white rounded hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
        >
          Submit
        </button>
      )}
    </div>
  </form>
)}

{stage === 3 && guessedZodiac && (
<div>
    <h2 className="text-xl font-light">Your sign is most likely:</h2>
    <p className="text-2xl font-bold">{guessedZodiac.guessedZodiac.split('\n')[0]}</p> 
    <h3 className="text-xl font-semibold mt-4">Explanation:</h3>
    <p>{guessedZodiac.guessedZodiac.split('\n').slice(2).join(' ')}</p> 

    {feedbackPrompt && (
            <div className="mt-4">
            <p className="text-gray-800 dark:text-gray-300">
                Were these results accurate?
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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}