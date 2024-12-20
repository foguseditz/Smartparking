import GradientLayout from "@/components/GradientLayout";
import Image from "next/image";
import Link from "next/link";

export default function Register() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="border-2 border-white bg-[#82baff] rounded-md mx-4 sm:mx-[5rem] md:mx-[10rem] lg:mx-[15rem] w-full sm:w-[500px] p-6 flex flex-col items-center">
        {/* Logo */}
        <Image
          src="/logo-smart-parking.png"
          alt="Smart Parking Logo"
          width={200} // Adjust the width as needed
          height={100} // Adjust the height as needed
          className="w-2/4 mb-6"
        />

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Create Account
        </h1>
        <div className="text-slate-600 mb-5">
          Already have an account?
          <Link href="/login" className="underline hover:font-semibold">
            Sign in
          </Link>
        </div>

        {/* Email Input */}
        <div className="w-full mb-6">
          <input
            id="username"
            name="username"
            placeholder="Username"
            type="email"
            autoComplete="email"
            className="block w-full bg-transparent border-b-2 border-0 py-1 text-white shadow-sm placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-xl p-3"
          />
        </div>

        <div className="w-full mb-6">
          <input
            id="email"
            name="email"
            placeholder="Email"
            type="email"
            autoComplete="email"
            className="block w-full bg-transparent border-b-2 border-0 py-1 text-white shadow-sm placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-xl p-3"
          />
        </div>

        {/* Password Input */}
        <div className="w-full mb-6">
          <input
            id="password"
            name="password"
            placeholder="Password"
            type="password"
            autoComplete="current-password"
            className="block w-full bg-transparent border-b-2 border-0 py-1 text-white shadow-sm placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-xl p-3"
          />
        </div>

        <div className="w-full mb-6">
          <input
            id="confirm-password"
            name="confirm-password"
            placeholder="Confirm Password"
            type="password"
            autoComplete="current-password"
            className="block w-full bg-transparent border-b-2 border-0 py-1 text-white shadow-sm placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-xl p-3"
          />
        </div>

        <div className="mt-5">
          <Link
            href="/login"
            className="rounded-md bg-[#1E3A8A] px-[7.5rem] py-2.5 text-lg font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

Register.getLayout = function getLayout(page) {
  return (
    <GradientLayout>
      {page}
    </GradientLayout>
  );
};
