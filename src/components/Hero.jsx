import React from 'react';
import Button from './Button';

const Hero = () => {
  return (
    <section id="home" className="pt-32 pb-20 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2 space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
              Build beautiful interfaces with <span className="text-primary-600 dark:text-primary-400">Tailwind CSS</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl">
              A modern React application with Tailwind CSS for rapid UI development. Create stunning user interfaces with minimal effort.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="large">Get Started</Button>
              <Button variant="outline" size="large">Learn More</Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md animate-slide-up">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl blur opacity-60 animate-pulse-slow"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="h-16 bg-gradient-to-r from-primary-500 to-accent-500 flex items-center px-6">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-full mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-5/6 mb-6"></div>
                  <div className="flex space-x-3 mb-6">
                    <div className="h-8 bg-primary-500 rounded w-24"></div>
                    <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                  </div>
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;