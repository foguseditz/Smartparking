import GradientLayout from "@/components/GradientLayout";
import Layout from "@/components/layout";
import Image from "next/image";
import Link from "next/link";
import Home from ".";

export default function Parking_space() {
  return (
    <>
      <div className="text-center mt-10">
        <h1 className="text-3xl max-md:text-2xl font-bold text-[#333333]">
          Parking Space
        </h1>
      </div>

      <div className="flex flex-col items-center justify-center mt-8 space-y-0 max-md:5">
        <div className="grid grid-cols-4 gap-0">
          <div className="border border-t-0 border-dashed border-gray-500 sm:w-36 sm:h-36 md:w-40 md:h-40 flex items-center justify-center">
            <Image
              src="/free_space.png"
              alt="Free Space"
              width={100}
              height={100}
              className="w-2/3 h-3/4 md:w-3/5 md:h-5/6 m-auto"
            />
          </div>
          <div className="border border-t-0 border-dashed border-gray-500 sm:w-36 sm:h-36 md:w-40 md:h-40 flex items-center justify-center">
            <Image
              src="/free_space.png"
              alt="Free Space"
              width={100}
              height={100}
              className="w-2/3 h-3/4 md:w-3/5 md:h-5/6 m-auto"
            />
          </div>
          <div className="border border-t-0 border-dashed border-gray-500 sm:w-36 sm:h-36 md:w-40 md:h-40 flex items-center justify-center">
            <Image
              src="/free_space.png"
              alt="Free Space"
              width={100}
              height={100}
              className="w-2/3 h-3/4 md:w-3/5 md:h-5/6 m-auto"
            />
          </div>
          <div className="border border-t-0 border-dashed border-gray-500 sm:w-36 sm:h-36 md:w-40 md:h-40 flex items-center justify-center">
            <Image
              src="/Car.png"
              alt="Car"
              width={100}
              height={100}
              className="w-32 h-36 md:w-36 md:h-40 m-auto"
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-0">
          <div className="border border-b-0 border-dashed border-gray-500 sm:w-36 sm:h-36 md:w-40 md:h-40 flex items-center justify-center">
            <Image
              src="/free_space.png"
              alt="Free Space"
              width={100}
              height={100}
              className="w-2/3 h-3/4 md:w-3/5 md:h-5/6 m-auto"
            />
          </div>
          <div className="border border-b-0 border-dashed border-gray-500 md:w-40 md:h-40 flex items-center justify-center">
            <Image
              src="/Car.png"
              alt="Car"
              width={100}
              height={100}
              className="w-32 h-36 md:w-36 md:h-40 m-auto"
            />
          </div>
          <div className="border border-b-0 border-dashed border-gray-500 sm:w-36 sm:h-36 md:w-40 md:h-40 flex items-center justify-center">
            <Image
              src="/free_space.png"
              alt="Free Space"
              width={100}
              height={100}
              className="w-2/3 h-3/4 md:w-3/5 md:h-5/6 m-auto"
            />
          </div>
          <div className="border border-b-0 border-dashed border-gray-500 sm:w-36 sm:h-36 md:w-40 md:h-40 flex items-center justify-center">
            <Image
              src="/free_space.png"
              alt="Free Space"
              width={100}
              height={100}
              className="w-2/3 h-3/4 md:w-3/5 md:h-5/6 m-auto"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <div className="w-full md:w-[50%] flex justify-center md:justify-end text-sm md:text-lg space-x-3">
          <div className="flex items-center space-x-2">
            <Image
              src="/Car.png"
              alt="Car"
              width={40}
              height={40}
              className="w-8 h-8 md:w-10 md:h-10"
            />
            <span className="font-medium text-gray-700">: Busy</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#BAD0FD] rounded-lg border border-gray-500"></div>
            <span className="font-medium text-gray-700">: Free</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-5 mb-32">
        <Link
          href="/user"
          className="w-72 sm:w-96 h-10 sm:h-12 p-2 text-center bg-[#1E3A8A] text-white font-semibold text-base md:text-lg rounded-xl shadow-xl hover:bg-blue-500"
        >
          Access the parking area
        </Link>
      </div>
    </>
  );
}

Parking_space.getLayout = function getLayout(page) {
  return (
    <Layout>
      {page}
    </Layout>
  );
};