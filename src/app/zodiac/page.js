    'use client';

    import { useState, useEffect } from 'react';
    import { useRouter } from 'next/navigation'; 

    export default function ZodiacQuiz() {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [guessedZodiac, setGuessedZodiac] = useState('');
    const [feedbackPrompt, setFeedbackPrompt] = useState(false);
    const router = useRouter();


    useEffect(() => {
        const fetchQuestions = async () => {
        const response = await fetch('/api/getZodiac', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'generate' })
        });

        const data = await response.json();
        setQuestions(data.questions);
        };

        fetchQuestions();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAnswers({ ...answers, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch('/api/getZodiac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', answers: Object.values(answers) })
        });

        const data = await response.json();
        setGuessedZodiac(data.guessedZodiac);
        setFeedbackPrompt(true); 
    };

    const handleFeedback = async (choice) => {
        const feedback = {
        analysis: guessedZodiac, // Change guessedZodiac to analysis here
        correct: choice === 'yes',
        timestamp: new Date().toISOString()
        };
    
        const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
        });
    
        if (response.ok) {
        alert('Thank you for your feedback!');
        router.push('/'); 
        } else {
        alert('There was an error submitting your feedback.');
        }
    };

    return (
        <div className="p-6 bg-cardBackground rounded-lg shadow-md max-w-[50rem] mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Zodiac Quiz</h2>

        {!guessedZodiac ? (
            <form onSubmit={handleSubmit} className="space-y-8">
            {questions.map((question, index) => (
                <div key={index} className="space-y-4">
                {/* Question */}
                <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {question.question}
                </label>

                {/* Options */}
                <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                    <label
                        key={optIndex}
                        htmlFor={`question-${index}-${optIndex}`}
                        className="flex items-center text-center p-4 bg-gray-100 dark:bg-[#333] rounded-lg cursor-pointer hover:bg-primary hover:text-white dark:hover:bg-darkPrimary dark:hover:text-gray-100 transition-colors duration-200"
                    >
                        <input
                        type="radio"
                        id={`question-${index}-${optIndex}`}
                        name={`question-${index}`}
                        value={option}
                        onChange={handleChange}
                        className="mr-3"
                        />
                        <span>{option}</span>
                    </label>
                    ))}
                </div>

                {/* Divider between questions */}
                <hr className="border-t border-gray-300 dark:border-gray-600 my-4" />
                </div>
            ))}

            <button type="submit" className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200">
                Submit
            </button>
            </form>
        ) : (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
            <h2 className="text-xl font-bold mb-2 whitespace-pre-line">{guessedZodiac}</h2>
            {feedbackPrompt && (
                <div className="mt-4">
                <p className="text-gray-800 dark:text-gray-300">Was the analysis correct?</p>
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