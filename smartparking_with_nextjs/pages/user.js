import Layout from "@/components/layout";
import Image from "next/image";
import Link from "next/link";

export default function User() {
  return (
      <div className="flex flex-col items-center m-auto w-1/2 mt-5 mb-40 relative">
        <div className="bg-[#BAD0FD] rounded-full w-32 max-md:w-28 mt-8 relative z-20">
          <Image src="/account.png" alt="account" width={128} height={60} />
        </div>

        <div className="bg-[#BAD0FD] w-[25rem] max-md:w-[22rem] max-sm:pt-16 pt-16 p-4 rounded-md shadow-xl absolute top-10 max-md:top-7 z-10 mt-[4rem]">
          <div className="flex items-center">
            <p className="font-semibold text-lg max-md:text-sm">
              Username &nbsp; &nbsp; :
            </p>
            <p className="text-gray-700 ms-14 max-md:text-sm">
              exampleusername1234
            </p>
          </div>
          <div className="flex items-center mt-4">
            <p className="font-semibold text-lg max-md:text-sm">
              Email &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; :
            </p>
            <p className="text-gray-700 ms-14 max-md:text-sm">
              example1234@email.com
            </p>
          </div>
          <div className="my-9 justify-items-center">
            <img
              src="/qr-code.png"
              alt="QR Code"
              className="w-36 rounded-md shadow-xl"
            />
          </div>
        </div>
        <div className="flex justify-center items-center p-3 mt-80">
          <Link
            href="/login"
            className="bg-white border-red-500 border-2 w-[25rem] max-md:w-[22rem] text-red-500 font-semibold py-2 px-4 rounded-md hover:bg-red-500 hover:text-white shadow-xl transition text-center"
          >
            Sign out
          </Link>
        </div>
      </div>
  );
}

User.getLayout = function getLayout(page) {
  return (
    <Layout>
      {page}
    </Layout>
  );
};