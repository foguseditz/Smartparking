import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/pages/firebase/config";
import GradientLayout from "@/components/GradientLayout";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import bcrypt from "bcryptjs"; // นำเข้า bcryptjs

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      if (user.role === "admin") {
        router.replace("/admin"); // Redirect ไปหน้า Admin
      } else {
        router.replace("/parking_space"); // Redirect ไปหน้า User
      }
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const usersRef = collection(db, "users");

      // ค้นหาผู้ใช้ด้วย email หรือ username
      const emailQuery = query(usersRef, where("email", "==", formData.email));
      const usernameQuery = query(
        usersRef,
        where("username", "==", formData.email)
      );

      const [emailSnapshot, usernameSnapshot] = await Promise.all([
        getDocs(emailQuery),
        getDocs(usernameQuery),
      ]);

      // รวมผลลัพธ์จากทั้งสอง query
      const userDoc = emailSnapshot.docs[0] || usernameSnapshot.docs[0];

      if (!userDoc) {
        setError("User not found.");
        return;
      }

      const userData = userDoc.data();

      // ตรวจสอบรหัสผ่านที่ถูกเข้ารหัส
      const isPasswordValid = await bcrypt.compare(
        formData.password,
        userData.password
      );
      if (!isPasswordValid) {
        setError("Incorrect password.");
        return;
      }

      // บันทึกข้อมูลผู้ใช้ใน Local Storage
      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: userDoc.id, // ใช้ `userDoc.id` เป็น `uid`
          role: userData.role,
          username: userData.username,
          email: userData.email,
        })
      );

      // Redirect ตาม role
      if (userData.role === "admin") {
        router.replace("/admin"); // Redirect ไปหน้า Admin
      } else {
        router.replace("/parking_space"); // Redirect ไปหน้า User
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Login - Smart Parking</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-[#60A5FA] to-[#93C5FD] px-4 py-6 sm:py-8 md:py-12">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="w-full max-w-[95%] rounded-xl border-2 border-white bg-[#82baff]/90 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 sm:max-w-[85%] sm:p-6 md:max-w-[600px] md:p-8 lg:max-w-[650px] hover:shadow-xl">
            <div className="mb-6 flex justify-center transition-transform duration-300 hover:scale-105 sm:mb-8 md:mb-10">
              <Image
                src="/logo-smart-parking.png"
                alt="Smart Parking Logo"
                width={500}
                height={50}
                className="w-[180px] sm:w-[220px] md:w-[260px] lg:w-[300px]"
                priority
              />
            </div>

            <h1 className="mb-8 text-center font-bold text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl">
              Welcome! Sign in to your account
            </h1>

            <form
              onSubmit={handleLogin}
              className="mx-auto space-y-6 w-[90%] sm:w-[85%] md:w-[80%]"
            >
              <input
                id="email"
                name="email"
                type="text"
                placeholder="Email or Username"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
                className="w-full bg-transparent border-b-2 border-white py-3 px-2 text-white placeholder:text-white/70 text-lg sm:text-xl md:text-2xl focus:border-blue-300 focus:ring-0 disabled:opacity-70 transition-all"
              />

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
                className="w-full bg-transparent border-b-2 border-white py-3 px-2 text-white placeholder:text-white/70 text-lg sm:text-xl md:text-2xl focus:border-blue-300 focus:ring-0 disabled:opacity-70 transition-all"
              />

              {error && (
                <div className="animate-fadeIn rounded-lg bg-red-100 p-3 text-center">
                  <p className="text-red-600 text-sm sm:text-base">{error}</p>
                </div>
              )}

              <div className="space-y-4 pt-6 sm:pt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full rounded-lg py-3 px-4 text-white shadow-md text-lg sm:text-xl transform transition-all duration-300 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#1E3A8A] hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>

                <Link
                  href="/auth/register"
                  className="block w-full rounded-lg bg-[#0284C7] py-3 px-4 text-center text-lg text-white shadow-md sm:text-xl transform transition-all duration-300 hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Create account
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

Login.getLayout = function getLayout(page) {
  return <GradientLayout>{page}</GradientLayout>;
};
