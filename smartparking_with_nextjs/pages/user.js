import Image from "next/image";

export default function user() {
  return (
    <div class="h-[600px]">
      <div class="flex flex-col items-center m-auto w-1/2 mt-5 mb-40 relative">
        <div class="bg-[#BAD0FD] rounded-full w-32 max-md:w-28 mt-8 relative z-20">
          <Image src="/account.png" alt="account" width={128} height={60} />
        </div>

        <div class="bg-[#BAD0FD] w-[25rem] max-md:w-[22rem] max-sm:pt-16 pt-16 p-4 rounded-md shadow-xl absolute top-10 max-md:top-7 z-10 mt-[4rem]">
          <div class="flex items-center">
            <p class="font-semibold text-lg max-md:text-sm">
              Username &nbsp; &nbsp; :
            </p>
            <p class="text-gray-700 ms-14 max-md:text-sm">
              exampleusername1234
            </p>
          </div>
          <div class="flex items-center mt-4">
            <p class="font-semibold text-lg max-md:text-sm">
              Email &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; :
            </p>
            <p class="text-gray-700 ms-14 max-md:text-sm">
              example1234@email.com
            </p>
          </div>
          <div class="my-9 justify-items-center">
            <img
              src="/qr-code.png"
              alt="QR Code"
              class="w-36 rounded-md shadow-xl"
            />
          </div>
        </div>
        <div class="flex justify-center items-center p-3 mt-80">
        <a
          href="login.html"
          class="bg-white border-red-500 border-2 w-[25rem] max-md:w-[22rem] text-red-500 font-semibold py-2 px-4 rounded-md hover:bg-red-500 hover:text-white shadow-xl transition text-center"
        >
          Sign out
        </a>
      </div>
    </div>
      </div>

  );
}
