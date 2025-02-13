import React from 'react';

const HeroSection = ({ backgroundImage }) => {
  return (
    <div
      className="bg-gray-900 bg-center bg-no-repeat bg-cover bg-opacity-20"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundBlendMode: 'multiply',
      }}
    >
      <div className="max-w-screen-xl px-4 py-24 mx-auto text-center lg:py-56">
        <h1 className="mt-24 text-4xl font-extrabold leading-none tracking-tight mb-96 text-amber-500 md:text-5xl lg:text-6xl">
        From Our Farm to Your Bag – Discover Freshness Redefined!
        </h1>
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
          <a
            href="#"
            className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
          >
            Get started
            <svg
              className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white border border-white rounded-lg hover:text-gray-900 sm:ms-4 hover:bg-gray-100 focus:ring-4 focus:ring-gray-400"
          >
            Learn more
          </a>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;