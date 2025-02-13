import React from 'react';

const LoadingBubble = () => {
  return (
    <div>
      <div className="ml-3 font-medium text-white">Assistant</div>
      <pre className="bg-[#334155] text-white m-3 font-sans rounded-t-3xl rounded-br-3xl p-3 text-wrap shadow-lg max-w-[70%] bubble">
        <p className="loading-bubble bubble">Loading</p>
      </pre>
    </div>
  );
};

export default LoadingBubble;