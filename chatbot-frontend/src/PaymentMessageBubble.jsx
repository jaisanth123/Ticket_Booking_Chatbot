import React from 'react';
import axios from 'axios';
import razor from './assets/razor.jpeg'

const PaymentMessageBubble = ({ order_id, setMessages }) => {
  const handlePayment = () => {
    var options = {
      key: import.meta.env.VITE_RAZORPAY,
      amount: '50000',
      name: 'Concert',
      description: 'Test Transaction',
      order_id: order_id,
      handler: async function (response) {
        try {
          const res = await axios.post(import.meta.env.VITE_BACKEND_URL + '/validate', {
            payment_id: response.razorpay_payment_id,
            order_id: response.razorpay_order_id,
            razor_signature: response.razorpay_signature,
          });
          if (res.status === 200) {
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                user: 'bot',
                type: 'content',
                pdf: res.data.pdf,
                message: res.data.message,
              },
            ]);
          } else {
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                user: 'bot',
                type: 'message',
                message: 'Validation failed',
              },
            ]);
          }
        } catch (e) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              user: 'bot',
              type: 'message',
              message: 'Some error has occurred',
            },
          ]);
        }
      },
      prefill: {
        name: 'Gaurav Kumar',
        email: 'gaurav.kumar@example.com',
        contact: '9000090000',
      },
      notes: {
        address: 'Razorpay Corporate Office',
      },
      theme: {
        color: '#3399cc',
      },
    };
    var rzp1 = new Razorpay(options);
    rzp1.on('payment.failed', function (response) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          user: 'bot',
          type: 'message',
          message: 'Some error has occurred',
        },
      ]);
    });
    rzp1.open();
  };

  return (
    <button onClick={handlePayment}>
      <img
        src={razor}
        className="sm:h-[5vh] rounded-md ml-2 border-2 hover:shadow-lg border-black sm:w-[8vw] h-[8vh]"
      />
    </button>
  );
};

export default PaymentMessageBubble;