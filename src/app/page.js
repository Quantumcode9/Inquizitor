import Link from 'next/link';

export default function HomePage() {
  return (

    
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-gray-900 dark:text-gray-100">
    <main className="p-6 text-center">
        <p className="text-2xl text-text-color mb-8 font-semibold">
          Select one of the quizzes below
        </p>
        <ul className="space-y-6">
          <li>
            <Link href="/personality" passHref>
              <p className="block p-5 text-2xl font-semibold text-gray-800 bg-cardBackground rounded-lg shadow-lg dark:text-gray-300 dark:bg-[#1E1E1E] transition duration-200 transform hover:bg-primary hover:text-white hover:shadow-xl dark:hover:bg-darkPrimary">
                Personality Quiz
              </p>
            </Link>
          </li>
          <li>
            <Link href="/zodiac" passHref>
              <p className="block p-5 text-2xl font-semibold text-gray-800 bg-cardBackground rounded-lg shadow-lg dark:text-gray-300 dark:bg-[#1E1E1E] transition duration-200 transform hover:bg-primary hover:text-white hover:shadow-xl dark:hover:bg-darkPrimary">
                Zodiac Quiz
              </p>
            </Link>
          </li>
          <li>
            <Link href="/enneagram" passHref>
              <p className="block p-5 text-2xl font-semibold text-gray-800 bg-cardBackground rounded-lg shadow-lg dark:text-gray-300 dark:bg-[#1E1E1E] transition duration-200 transform hover:bg-primary hover:text-white hover:shadow-xl dark:hover:bg-darkPrimary">
                Enneagram Quiz
              </p>
            </Link>
          </li>
        </ul>
      </main>

      {/* Footer */}
      <footer className="mt-16 p-6 w-full text-center text-gray-600 dark:text-gray-400 border-t border-gray-300 dark:border-gray-600">
        <p>© 2024 Inquizitor</p>
        <div className="text-sm mt-2">
          <Link href="/docs/privacy-policy">
            <span className="text-accent hover:underline">Privacy Policy</span>
          </Link>
          {' | '}
          <Link href="/docs/terms-of-service">
            <span className="text-accent hover:underline">Terms of Service</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}