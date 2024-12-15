import Navbar from "@/components/navbar";
import Link from "next/link";

export default function Status() {
  return (
    <div >
        <div className="mt-10 sm:mt-16 mx-4 sm:mx-auto sm:max-w-[1000px] bg-[#BAD0FD] rounded-md shadow-lg">
          <p className="text-center py-10 text-lg sm:text-2xl">
            <span className="font-bold">Duration :</span> 00 hours 00 minutes 00
            seconds
          </p>
        </div>

        <div className="mt-5 flex justify-center">
          <Link
            href="payment.html"
            className="rounded-md bg-[#E83C3F] px-6 sm:px-20 py-2.5 text-base sm:text-lg font-semibold text-white shadow-sm hover:bg-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Leave Parking Area
          </Link>
        </div>
      </div>
  );
}
