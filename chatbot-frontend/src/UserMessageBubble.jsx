import React from 'react';

const UserMessageBubble = ({ message }) => {
  return (
    <div className="max-w-[70%] ml-auto">
      <div className="m-2 font-medium text-white">User</div>
      <p className="bg-[#6b7280] text-white m-2 rounded-t-2xl rounded-bl-2xl p-3 shadow-lg bubble">
        {message}
      </p>
    </div>
  );
};

export default UserMessageBubble;