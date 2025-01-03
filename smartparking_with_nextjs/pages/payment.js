import Layout from "@/components/layout";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Payment() {
  const [showAlert, setShowAlert] = useState(false);

  const handlePaymentConfirmed = (e) => {
    e.preventDefault();
    setShowAlert(true);
  };

  return (
    <>
      <Head>
        <title>Payment - Smart Parking</title>
      </Head>
      <div className="container mx-auto px-4 mb-10">
        {/* QR Code Section */}
        <div className="mt-10 sm:mt-16 mx-auto max-w-[350px] bg-[#BAD0FD] rounded-md shadow-lg">
          <div className="w-full p-3 flex justify-center">
            <Image
              src="/qrpayment.png"
              alt="QR Payment"
              width={300}
              height={90}
              className="w-full max-w-[300px] h-auto"
            />
          </div>
        </div>

        {/* Payment Details Section */}
        <div className="mt-10 sm:mt-16 mx-auto bg-[#D9D9D9] rounded-lg shadow-lg w-full max-w-4xl p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-base sm:text-xl lg:text-2xl">
                <span className="font-semibold">Check-in Date/Time:</span>
                <br className="sm:hidden" /> 21/11/2024 10:00 AM
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-base sm:text-xl lg:text-2xl">
                <span className="font-semibold">Check-out Date/Time:</span>
                <br className="sm:hidden" /> 21/11/2024 11:00 AM
              </p>
            </div>
          </div>

          <p className="mt-6 text-base sm:text-xl lg:text-2xl">
            <span className="font-semibold">Total Cost:</span> 20 THB
          </p>

          <div className="mt-6">
            <label
              className="block mb-2 text-sm font-medium text-gray-900"
              htmlFor="file_input"
            >
              Please attach the payment slip.
            </label>
            <input
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
              id="file_input"
              type="file"
            />
          </div>

          {/* Button Section */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handlePaymentConfirmed}
              className="rounded-md bg-[#227c2f] px-6 sm:px-12 py-2.5 text-base sm:text-lg font-semibold text-white shadow-sm hover:bg-[#559744] transition-colors duration-200"
            >
              Payment confirmed
            </button>
          </div>
        </div>

        {/* Custom Success Alert */}
        {showAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-auto transform transition-all">
              <div className="text-center">
                {/* Success Icon */}
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                {/* Alert Content */}
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Operation successful!
                </h3>

                {/* Action Button */}
                <div className="mt-4">
                  <Link
                    href="/parking_space"
                    className="inline-flex justify-center rounded-md bg-[#227c2f] px-8 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#559744] transition-colors duration-200"
                  >
                    Okay
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

Payment.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
