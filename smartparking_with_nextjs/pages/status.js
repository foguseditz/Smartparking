import React, { useState } from "react";
import Layout from "@/components/layout";
import Head from "next/head";
import Link from "next/link";

export default function Status() {
  const [showAlert, setShowAlert] = useState(false);

  const handleLeaveParking = (e) => {
    e.preventDefault();
    setShowAlert(true);
  };

  return (
    <>
      <Head>
        <title>Status - Smart Parking</title>
      </Head>
      <div className="relative">
        <div className="mt-10 sm:mt-16 mx-4 sm:mx-auto sm:max-w-[1000px] bg-[#BAD0FD] rounded-md shadow-lg">
          <p className="text-center py-10 text-lg sm:text-2xl">
            <span className="font-bold">Duration :</span> 00 hours 00 minutes 00
            seconds
          </p>
        </div>
        <div className="mt-5 flex justify-center">
          <button
            onClick={handleLeaveParking}
            className="rounded-md bg-[#E83C3F] px-6 sm:px-20 py-2.5 text-base sm:text-lg font-semibold text-white shadow-sm hover:bg-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Leave Parking Area
          </button>
        </div>

        {/* Enhanced Responsive Custom Alert */}
        {showAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 w-full max-w-[90%] sm:max-w-[400px] md:max-w-[450px] mx-auto">
              <div className="text-center">
                {/* Warning Icon - Responsive size */}
                <div className="mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full bg-red-100 mb-3 sm:mb-4">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                
                {/* Alert Title - Responsive text */}
                <h3 className="text-base sm:text-lg md:text-xl font-medium text-gray-900 mb-3 sm:mb-4">
                  Please pay for the service
                </h3>
                
                {/* Buttons Container - Responsive spacing and layout */}
                <div className="mt-4 flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                  <Link
                    href="/payment"
                    className="w-full sm:w-auto inline-flex justify-center rounded-md bg-[#E83C3F] px-4 sm:px-6 md:px-8 py-2 text-sm sm:text-base font-semibold text-white shadow-sm hover:bg-red-300 transition-colors duration-200"
                  >
                    Pay for service
                  </Link>
                  <button
                    onClick={() => setShowAlert(false)}
                    className="w-full sm:w-auto inline-flex justify-center rounded-md bg-gray-200 px-4 sm:px-6 md:px-8 py-2 text-sm sm:text-base font-semibold text-gray-900 shadow-sm hover:bg-gray-300 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

Status.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
