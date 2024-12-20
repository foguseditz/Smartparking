import GradientLayout from "@/components/GradientLayout";
import Image from "next/image";
import Link from "next/link";

export default function Login() {
  return (
    <div className="bg-gradient-to-b from-[#60A5FA] to-[#93C5FD]">
      <div className="h-screen flex items-center justify-center">
        <div className="border-2 border-white bg-[#82baff] rounded-md mx-4 sm:mx-[5rem] md:mx-[10rem] lg:mx-[15rem] w-full sm:w-[500px] p-6 flex flex-col items-center">
          <Image
            src="/logo-smart-parking.png"
            alt="Smart Parking Logo"
            width={500}
            height={50}
            className="w-2/4 mb-6"
          />

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            Smart Car Parking
          </h1>

          <div className="w-full mb-6">
            <input
              id="email"
              name="email"
              placeholder="Email"
              type="email"
              autocomplete="email"
              className="block w-full bg-transparent border-b-2 border-0 py-2 text-white shadow-sm placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-xl p-3"
            />
          </div>

          <div className="w-full mb-6">
            <input
              id="password"
              name="password"
              placeholder="Password"
              type="password"
              autocomplete="current-password"
              className="block w-full bg-transparent border-b-2 border-0 py-2 text-white shadow-sm placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-xl p-3"
            />
            <p className="text-white text-right underline">
              <Link href="">Forgot Password?</Link>
            </p>
          </div>
          <div>
            <Link
              href="/parking_space"
              className="rounded-md bg-[#1E3A8A] px-[7.5rem] py-2.5 text-lg font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Sign in
            </Link>
          </div>
          <div className="mt-8">
            <Link
              href="/register"
              className="rounded-md bg-[#0284C7] px-[5rem] py-2.5 text-lg font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

Login.getLayout = function getLayout(page) {
  return (
    <GradientLayout>
      {page}
    </GradientLayout>
  );
};
