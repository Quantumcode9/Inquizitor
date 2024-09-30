// pages/index.js
import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <h1>Welcome to the Quiz Hub</h1>
      <p>Select one of the quizzes below:</p>
      <ul>
        <li>
          <Link href="/personality">Personality Quiz</Link>
        </li>
        <li>
          <Link href="/zodiac">Zodiac Quiz</Link>
        </li>
      </ul>
    </div>
  );
}