import { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/pages/firebase/config";
import GradientLayout from "@/components/GradientLayout";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import bcrypt from "bcryptjs"; // นำเข้า bcryptjs

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      if (user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/parking_space");
      }
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSignUp = async () => {
    if (!Object.values(formData).every(Boolean)) {
      setError("All fields are required.");
      return;
    }

    // ตรวจสอบรูปแบบอีเมล
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", formData.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError("This email is already in use.");
        return;
      }

      // เข้ารหัสรหัสผ่านก่อนบันทึกลง Firestore
      const salt = await bcrypt.genSalt(10); // สร้าง salt
      const hashedPassword = await bcrypt.hash(formData.password, salt); // เข้ารหัสรหัสผ่าน

      await addDoc(usersRef, {
        username: formData.username,
        email: formData.email,
        password: hashedPassword, // ใช้รหัสผ่านที่เข้ารหัสแล้ว
        role: "user",
      });

      setSuccess("Registration successful! Redirecting to login...");

      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!authChecked) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Register - Smart Parking</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-[#60A5FA] to-[#93C5FD] px-4 py-8 md:py-12">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="w-full max-w-[90%] rounded-lg border-2 border-white bg-[#82baff] p-6 sm:max-w-[80%] md:max-w-[600px] md:p-8 lg:max-w-[650px] shadow-xl">
            <div className="mb-6 flex justify-center sm:mb-8">
              <Image
                src="/logo-smart-parking.png"
                alt="Smart Parking Logo"
                width={200}
                height={100}
                className="w-[180px] sm:w-[220px] md:w-[250px] transition-all"
              />
            </div>

            <h1 className="mb-3 text-center text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              Create Account
            </h1>

            <div className="mb-6 text-center text-slate-700 sm:text-lg">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-blue-900 underline transition-all hover:text-blue-950 hover:font-semibold"
              >
                Sign in
              </Link>
            </div>

            <form
              className="mx-auto max-w-[90%] space-y-6 sm:max-w-[80%]"
              onSubmit={(e) => e.preventDefault()}
            >
              {(error || success) && (
                <div
                  className={`mb-4 rounded-md p-3 text-center ${
                    error
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  <p className="text-sm sm:text-base">{error || success}</p>
                </div>
              )}

              <div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="block w-full bg-transparent border-b-2 border-white py-3 text-white placeholder:text-white/80 focus:border-blue-300 focus:ring-0 text-base sm:text-lg md:text-xl transition-all disabled:opacity-70"
                />
              </div>

              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="block w-full bg-transparent border-b-2 border-white py-3 text-white placeholder:text-white/80 focus:border-blue-300 focus:ring-0 text-base sm:text-lg md:text-xl transition-all disabled:opacity-70"
                />
              </div>

              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="block w-full bg-transparent border-b-2 border-white py-3 text-white placeholder:text-white/80 focus:border-blue-300 focus:ring-0 text-base sm:text-lg md:text-xl transition-all disabled:opacity-70"
                />
              </div>

              <div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="block w-full bg-transparent border-b-2 border-white py-3 text-white placeholder:text-white/80 focus:border-blue-300 focus:ring-0 text-base sm:text-lg md:text-xl transition-all disabled:opacity-70"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSignUp}
                  disabled={isLoading}
                  className={`w-full rounded-md py-3 text-white shadow-md text-base sm:text-lg md:text-xl transition-all duration-200 ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#1E3A8A] hover:bg-blue-600 active:bg-blue-700"
                  }`}
                >
                  {isLoading ? "Signing Up..." : "Sign Up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

Register.getLayout = function getLayout(page) {
  return <GradientLayout>{page}</GradientLayout>;
};
