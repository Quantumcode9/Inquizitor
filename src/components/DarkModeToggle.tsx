'use client';
import React from 'react';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { Moon, Sun } from 'lucide-react';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="flex items-center text-white hover:text-black dark:text-black dark:hover:text-white rounded-lg hover:border-button-highlight transition-all duration-300 ease-in-out focus:outline-none "
    >
      {isDarkMode ? (
        <>
          <Sun className="w-5 h-5 mr-2" />
        </>
      ) : (
        <>
          <Moon className="w-5 h-5 mr-2" />
        </>
      )}
    </button>
  );
};

export default DarkModeToggle;