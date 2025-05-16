import Link from 'next/link';
import { FaUser, FaStar, FaLayerGroup } from 'react-icons/fa'; // Import icons

export default function HomePage() {
 return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Header with subtle pattern */}
      <header className="w-full text-center pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-repeat z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <div className="relative z-10">
          <h1 className="text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">Welcome to Inquizitor</h1>
          <p className="text-2xl mb-6 text-gray-700 dark:text-gray-300">Discover yourself through our quizzes</p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-500 mx-auto rounded-full"></div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow px-6 py-12 text-center flex flex-col items-center">
        {/* Description Section */}
        <div className="mb-16 max-w-2xl">
          <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300">
            Embark on a journey of self-discovery through our carefully crafted quizzes.
            <span className="block mt-2">Inquizitor helps you uncover who you truly are and understand your place in the world.</span>
          </p>
        </div>

        {/* Quiz Buttons */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 w-full max-w-5xl">
          <Link href="/personality" passHref>
            <div className="group p-8 rounded-xl shadow-lg hover:shadow-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:translate-y-[-8px]">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <FaUser size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">MBTI</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Discover your personality type and understand your core traits and preferences</p>
              <span className="inline-block text-blue-500 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300">Take the quiz →</span>
            </div>
          </Link>
          <Link href="/zodiac" passHref>
            <div className="group p-8 rounded-xl shadow-lg hover:shadow-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:translate-y-[-8px]">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <FaStar size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">Zodiac</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Learn how celestial forces shape your character and if your sign matches your personality</p>
              <span className="inline-block text-purple-500 font-medium group-hover:text-purple-700 dark:group-hover:text-purple-300">Take the quiz →</span>
            </div>
          </Link>
          <Link href="/enneagram" passHref>
            <div className="group p-8 rounded-xl shadow-lg hover:shadow-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:translate-y-[-8px]">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <FaLayerGroup size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">Enneagram</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Explore your Enneagram type to gain insights into your core motivations and fears</p>
              <span className="inline-block text-green-500 font-medium group-hover:text-green-700 dark:group-hover:text-green-300">Take the quiz →</span>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 w-full text-center text-gray-600 bg-white dark:bg-gray-900 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
        <p>© 2024 Inquizitor</p>
        <div className="text-sm mt-3">
          <Link href="/docs/privacy-policy">
            <span className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">Privacy Policy</span>
          </Link>
          {' | '}
          <Link href="/docs/terms-of-service">
            <span className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">Terms of Service</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}