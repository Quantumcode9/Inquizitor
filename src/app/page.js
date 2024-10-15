import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full text-center pt-24">
        <h1 className="text-3xl font-bold mb-4">Welcome to Inquizitor</h1>
        <p className="text-lg mb-6">Discover yourself through our quizzes</p>
      </header>

      {/* Main content */}
      <main className="flex-grow p-14 text-center">
     
        {/* Buttons */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-3">
          <Link href="/personality" passHref>
            <p className="block p-5 text-2xl font-semibold text-gray-800 bg-cardBackground rounded-lg shadow-lg dark:text-gray-300 dark:bg-[#1E1E1E] transition-transform hover:translate-y-[-2px] hover:shadow-lg transform hover:bg-primary hover:text-white hover:shadow-xl dark:hover:bg-darkPrimary">
              Personality
            </p>
          </Link>
          <Link href="/zodiac" passHref>
            <p className="block p-5 text-2xl font-semibold text-gray-800 bg-cardBackground rounded-lg shadow-lg dark:text-gray-300 dark:bg-[#1E1E1E] transition-transform hover:translate-y-[-2px] hover:shadow-lg transform hover:bg-primary hover:text-white hover:shadow-xl dark:hover:bg-darkPrimary">
              Zodiac
            </p>
          </Link>
          <Link href="/enneagram" passHref>
            <p className="block p-5 text-2xl font-semibold text-gray-800 bg-cardBackground rounded-lg shadow-lg dark:text-gray-300 dark:bg-[#1E1E1E] transition-transform hover:translate-y-[-2px] hover:shadow-lg transform hover:bg-primary hover:text-white hover:shadow-xl dark:hover:bg-darkPrimary">
              Enneagram
            </p>
          </Link>
        </div>
      </main>



      {/* Footer */}
      <footer className="p-6 w-full text-center text-gray-600 dark:text-gray-400 border-t border-gray-300 dark:border-gray-600">
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