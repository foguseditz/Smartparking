import GradientLayout from "@/components/GradientLayout";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <section className="py-1">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4 py-10">
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-bold text-[#131F2D] mb-4">
              Smart Parking Management System
            </h2>
            <p className="text-base md:text-lg text-[#131F2D] my-8 md:my-7 w-full md:w-3/4 mx-auto md:mx-0">
              Welcome to the Smart Parking System – Simple and efficient
              parking!
            </p>
            <Link
              href="/auth/login"
              className="px-10 py-3 md:px-11 md:py-3  bg-[#052A61] text-white font-semibold text-sm md:text-lg rounded-lg shadow-md hover:bg-blue-500"
            >
              Get Started
            </Link>
          </div>

          <div className="sm:flex justify-center hidden ">
            <Image
              src="/Parking-header.svg"
              alt="Smart Parking Features"
              className="w-3/4 md:w-full"
              width={500}
              height={500}
            />
          </div>
        </div>
      </section>

      <section className="my-10 relative px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#131F2D] text-center mb-12 relative underline sm:no-underline">
          How to Use
          <span className="hidden md:block absolute left-[6%] bottom-1/3 w-[36%] h-1 bg-[#131F2D]"></span>
          <span className="hidden md:block absolute right-[6%] bottom-1/3 w-[36%] h-1 bg-[#131F2D]"></span>
        </h1>
        <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 place-items-center gap-4">
          <div className="text-center bg-white border-slate-900 border-2 rounded-md w-96 sm:w-60 h-auto sm:h-[22rem] py-4 px-2">
            <Image
              src="/step1-login.svg"
              alt="Step 1"
              className="mx-auto w-40 sm:w-52 h-40 sm:h-60 mb-4"
              width={500} // Adjust the width and height as needed
              height={200}
            />
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Step 1
            </h3>
            <p className="text-sm sm:text-gray-600">Sign in</p>
          </div>

          <div className="text-center bg-white border-slate-900 border-2 rounded-md w-96 sm:w-60 h-auto sm:h-[22rem] py-4 px-2">
            <Image
              src="/step2-checkparking.svg"
              alt="Step 2"
              className="mx-auto w-40 sm:w-52 h-40 sm:h-60 mb-4"
              width={200} // Adjust the width and height as needed
              height={200}
            />
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Step 2
            </h3>
            <p className="text-sm sm:text-gray-600">Check parking status</p>
          </div>

          <div className="text-center bg-white border-slate-900 border-2 rounded-md w-96 sm:w-60 h-auto sm:h-[22rem] py-4 px-2">
            <Image
              src="/step3-checkin.svg"
              alt="Step 3"
              className="mx-auto w-40 sm:w-52 h-40 sm:h-60 mb-4"
              width={200} // Adjust the width and height as needed
              height={200}
            />
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Step 3
            </h3>
            <p className="text-sm sm:text-gray-600">
              Scan your account QR code to enter
            </p>
          </div>

          <div className="text-center bg-white border-slate-900 border-2 rounded-md w-96 sm:w-60 h-auto sm:h-[22rem] py-4 px-2">
            <Image
              src="/step4-checkout.svg"
              alt="Step 4"
              className="mx-auto w-40 sm:w-52 h-40 sm:h-60 mb-4"
              width={200} // Adjust the width and height as needed
              height={200}
            />
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Step 4
            </h3>
            <p className="text-sm sm:text-gray-600">
              Scan your account QR code when exiting
            </p>
          </div>

          <div className="text-center bg-white border-slate-900 border-2 rounded-md w-96 sm:w-60 h-auto sm:h-[22rem] py-4 px-2">
            <Image
              src="/step5-payment.svg"
              alt="Step 5"
              className="mx-auto w-40 sm:w-52 h-40 sm:h-60 mb-4"
              width={200} // Adjust the width and height as needed
              height={200}
            />
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Step 5
            </h3>
            <p className="text-sm sm:text-gray-600">Make payment</p>
          </div>
        </div>
      </section>
    </div>
  );
}


Home.getLayout = function getLayout(page) {
  return (
    <GradientLayout>
      {page}
    </GradientLayout>
  );
};