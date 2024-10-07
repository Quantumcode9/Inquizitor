'use client';

import { useEffect, useState } from 'react';

export function useDarkMode() {
const [isDarkMode, setIsDarkMode] = useState(false);

useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        setIsDarkMode(true);
    } else {
        document.documentElement.classList.remove('dark');
    }
    } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
        document.documentElement.classList.add('dark');
        setIsDarkMode(true);
    } else {
        document.documentElement.classList.remove('dark');
    }
    }
}, []);

const toggleDarkMode = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);
};

return { isDarkMode, toggleDarkMode };
}