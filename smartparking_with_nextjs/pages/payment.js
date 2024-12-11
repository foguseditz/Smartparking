import Image from "next/image";

export default function payment() {
  return (
    <div>
      <div>
        <div class="mt-10 sm:mt-16 mx-4 sm:mx-auto sm:max-w-[350px] bg-[#BAD0FD] h-[500px] rounded-md place-items-center shadow-lg">
          <div class="w-[300px] pt-3">
            <Image src="/qrpayment.png" alt="" width={300} height={90} />
          </div>
        </div>
        <div class="mt-10 sm:mt-16 mx-4 sm:mx-auto bg-[#D9D9D9] rounded-lg shadow-lg w-4/5 max-sm:w-auto justify-center pt-7">
          <div class="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
            <div class="flex flex-col sm:flex-row items-start sm:items-center px-10">
              <p class="text-lg sm:text-2xl font-medium">
                <span class="font-semibold"> Check-in Date/Time:</span>{" "}
                21/11/2024 10:00 AM
              </p>
            </div>
            <div class="flex flex-col sm:flex-row items-start sm:items-center px-10">
              <p class="text-lg sm:text-2xl font-medium">
                <span class="font-semibold"> Check-out Date/Time : </span>
                21/11/2024 11:00 AM
              </p>
            </div>
          </div>

          <p class="text-left px-10 pb-6 text-lg sm:text-2xl font-medium mt-5">
            <span class="font-semibold"> Total Cost :</span> 20 THB
          </p>
          <div class="px-10 pb-6">
            <label
              class="block mb-2 text-sm font-medium text-gray-900"
              for="file_input"
            >
              Please attach the payment slip.
            </label>
            <input
              class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-white dark:border-gray-600 dark:placeholder-gray-400"
              id="file_input"
              type="file"
            />
          </div>
        </div>
        <div class="mt-5 mb-10 mr-[12rem] flex justify-end">
          <a
            href="#"
            class="rounded-md bg-[#559744] px-6 sm:px-17 py-2.5 text-base sm:text-lg font-semibold text-white shadow-sm hover:bg-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Payment confirmed
          </a>
        </div>
      </div>
    </div>
  );
}
