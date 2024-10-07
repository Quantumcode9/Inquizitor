import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-gray-900 dark:text-gray-100">
  <main className="p-4">
        <p className="text-lg text-text-color mb-4">
          Select one of the quizzes below:
        </p>
        <ul className="space-y-4">
          <li>
            <Link href="/personality" className="block p-4 text-xl font-semibold text-gray-800 bg-cardBackground rounded-lg shadow-md dark:text-gray-300 dark:shadow-none hover:bg-primary hover:text-white dark:hover:bg-darkPrimary">
              Personality Quiz
            </Link>
          </li>
          <li>
            <Link href="/zodiac" className="block p-4 text-xl font-semibold text-gray-800 bg-cardBackground rounded-lg shadow-md  dark:text-gray-300 dark:shadow-none hover:bg-primary hover:text-white dark:hover:bg-darkPrimary">
              Zodiac Quiz
            </Link>
          </li>
          <li>
            <Link href="/enneagram" className="block p-4 text-xl font-semibold text-gray-800 bg-cardBackground rounded-lg shadow-md dark:bg-[#1E1E1E] dark:text-gray-300 dark:shadow-none hover:bg-primary hover:text-white dark:hover:bg-darkPrimary">
              Enneagram Quiz
            </Link>
          </li>
        </ul>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-gray-600 dark:text-gray-400">
        © 2024 Inquizitor
      </footer>
    </div>
  );
}