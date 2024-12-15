import Image from "next/image";
import Link from "next/link";

export default function payment() {
  return (
      <div>
        <div className="mt-10 sm:mt-16 mx-4 sm:mx-auto sm:max-w-[350px] bg-[#BAD0FD] h-[500px] rounded-md place-items-center shadow-lg">
          <div className="w-[300px] pt-3">
            <Image src="/qrpayment.png" alt="" width={300} height={90} />
          </div>
        </div>
        <div className="mt-10 sm:mt-16 mx-4 sm:mx-auto bg-[#D9D9D9] rounded-lg shadow-lg w-4/5 max-sm:w-auto justify-center pt-7">
          <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center px-10">
              <p className="text-lg sm:text-2xl font-medium">
                <span className="font-semibold"> Check-in Date/Time:</span>{" "}
                21/11/2024 10:00 AM
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center px-10">
              <p className="text-lg sm:text-2xl font-medium">
                <span className="font-semibold"> Check-out Date/Time : </span>
                21/11/2024 11:00 AM
              </p>
            </div>
          </div>

          <p className="text-left px-10 pb-6 text-lg sm:text-2xl font-medium mt-5">
            <span className="font-semibold"> Total Cost :</span> 20 THB
          </p>
          <div className="px-10 pb-6">
            <label
              className="block mb-2 text-sm font-medium text-gray-900"
              for="file_input"
            >
              Please attach the payment slip.
            </label>
            <input
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-white dark:border-gray-600 dark:placeholder-gray-400"
              id="file_input"
              type="file"
            />
          </div>
        </div>
        <div className="mt-5 mb-10 mr-[12rem] flex justify-end">
          <Link
            href="#"
            class="rounded-md bg-[#559744] px-6 sm:px-17 py-2.5 text-base sm:text-lg font-semibold text-white shadow-sm hover:bg-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Payment confirmed
          </Link>
        </div>
      </div>
  );
}
