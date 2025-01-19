import { Scanner } from "@yudiel/react-qr-scanner";
import axios from "axios";
import { useRef, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import img2 from "./assets/imeage2.jpg";
import img1 from "./assets/download.jpg";
import img3 from "./assets/images.jpg";
import img4 from "./assets/images4.jpg";

const InPage = () => {
  const [success, setSuccess] = useState(false);
  const [failure, setFailure] = useState(false);
  const interval = useRef(null);

  const handleScanIn = async (result) => {
    const rawValue = result[0].rawValue;
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/qr/in",
        {
          ticket_id: rawValue,
        }
      );
      console.log(response.data);
      if (response.status === 200) {
        setSuccess(true);
        if (interval.current) {
          clearInterval(interval.current);
        }
        interval.current = setInterval(() => {
          setSuccess(false);
          clearInterval(interval.current);
          interval.current = null;
        }, 1000);
      }
    } catch (e) {
      setFailure(true);
      if (interval.current) {
        clearInterval(interval.current);
      }
      interval.current = setInterval(() => {
        setFailure(false);
        clearInterval(interval.current);
        interval.current = null;
      }, 1000);
      console.log(e);
    }
  };

  return (
    <div className="flex flex-row items-center h-screen mx-auto">
      <div className="h-[40vh]">
        <Scanner onScan={handleScanIn} allowMultiple={true} scanDelay={1000} />
      </div>
      {success && (
        <div>
          <div className="ml-10 text-5xl font-bold text-green-400">Success</div>
          <div className="ml-10 text-2xl font-bold text-green-400">
            Kec Concert Welcomes you
          </div>
        </div>
      )}
      {failure && (
        <div>
          <div className="ml-10 text-5xl font-bold text-red-800">Failure</div>
          <div className="ml-10 text-2xl font-bold text-red-800 ">
            limit reached
          </div>
        </div>
      )}
    </div>
  );
};

const OutPage = () => {
  const [success, setSuccess] = useState(false);
  const [failure, setFailure] = useState(false);
  const interval = useRef(null);

  const handleScanOut = async (result) => {
    const rawValue = result[0].rawValue;
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/qr/out",
        {
          ticket_id: rawValue,
        }
      );
      console.log(response.data);
      if (response.status === 200) {
        setSuccess(true);
        if (interval.current) {
          clearInterval(interval.current);
        }
        interval.current = setInterval(() => {
          setSuccess(false);
          clearInterval(interval.current);
          interval.current = null;
        }, 1000);
      }
    } catch (e) {
      setFailure(true);
      if (interval.current) {
        clearInterval(interval.current);
      }
      interval.current = setInterval(() => {
        setFailure(false);
        clearInterval(interval.current);
        interval.current = null;
      }, 1000);
      console.log(e);
    }
  };

  return (
    <div className="flex flex-row items-center w-auto h-screen mx-auto">
      <div className="h-[40vh]">
        <Scanner onScan={handleScanOut} allowMultiple={true} scanDelay={1000} />
      </div>
      {success && (
        <div>
          <div className="ml-10 text-5xl font-bold text-green-400 bg-black">
            Success
          </div>
          <div className="ml-10 text-2xl font-bold text-green-400 bg-black">
            Thanks for comming{" "}
          </div>
        </div>
      )}
      {failure && (
        <div>
          <div className="ml-10 text-5xl font-bold text-red-800 bg-black">
            Failure
          </div>
          <div className="ml-10 text-2xl font-bold text-red-800 bg-black ">
            limit reached
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <div
      className="bg-no-repeat bg-cover bg-cente bg-stone-500 "
      style={{
        backgroundImage: `url(${img4})`,
      }}
    >
      <Router>
        <div className="flex flex-col items-center justify-center h-screen mx-auto">
          <div className="flex flex-row m-1 space-x-20">
            <div class="w-full max-w-sm bg-stone-900 border border-white-900 rounded-lg shadow bg-opacity-60">
              {" "}
              <span class="flex flex-row justify-center text-3xl font-bold text-white mt-6">
                Check-In
              </span>
              <img class="p-8 rounded-t-lg" src={img2} alt="product image" />
              <div class="px-5 pb-5">
                <h5 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  Click here to validate your tickets for check-in
                </h5>

                <div class="flex flex-col items-center justify-between my-5">
                  <Link to="/in">
                    <button class="bg-amber-800 hover:bg-amber-950 hover:text-white text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
                      <svg
                        class="w-6 h-6 text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 18"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M10 12.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                        />
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17 3h-2l-.447-.894A2 2 0 0 0 12.764 1H7.236a2 2 0 0 0-1.789 1.106L5 3H3a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V5a2 2 0 0 0-2-2Z"
                        />
                      </svg>{" "}
                      <span className="mx-6">In </span>{" "}
                    </button>
                  </Link>{" "}
                </div>
              </div>
            </div>

            <div class="w-full max-w-sm bg-stone-900 border border-white-900 rounded-lg shadow bg-opacity-60">
              {" "}
              <span class="flex flex-row justify-center text-3xl font-bold text-white mt-6">
                Check-Out
              </span>
              <img class="p-8 rounded-t-lg" src={img2} alt="product image" />
              <div class="px-5 pb-5">
                <h5 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  Click here to validate you tickets for check-out
                </h5>

                <div class="flex flex-col items-center justify-between m-5">
                  <Link to="/out">
                    <button class="bg-amber-800 hover:bg-amber-950 hover:text-white text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
                      <svg
                        class="w-6 h-6 text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 18"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M10 12.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                        />
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17 3h-2l-.447-.894A2 2 0 0 0 12.764 1H7.236a2 2 0 0 0-1.789 1.106L5 3H3a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V5a2 2 0 0 0-2-2Z"
                        />
                      </svg>{" "}
                      <span className="mx-6">Out </span>{" "}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <Routes>
            <Route path="/in" element={<InPage />} />
            <Route path="/out" element={<OutPage />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
