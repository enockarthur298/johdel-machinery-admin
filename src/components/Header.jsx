import React, { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white dark:bg-gray-900 shadow-md py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-accent-500"></div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">Tailwind React</span>
        </div>
        
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            {['Home', 'Features', 'About', 'Contact'].map((item) => (
              <li key={item}>
                <a 
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button className="md:hidden text-gray-700 dark:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;