
import { auth } from "@/pages/firebase/config";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";  

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // สถานะการล็อกอิน

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true); // ถ้ามีผู้ใช้ล็อกอิน
      } else {
        setIsLoggedIn(false); // ถ้าไม่มีผู้ใช้ล็อกอิน
      }
    });

    return () => unsubscribe(); // Clean up
  }, []);

  return (
    <nav className="bg-gradient-to-b from-blue-400 to-blue-300 sticky w-full top-0 left-0 z-50 border-b-2 border-blue-900">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Logo Section */}
        <Link href="/" aria-label="Smart Parking Home">
          <div className="flex items-center space-x-3">
            <Image
              src="/logo-smart-parking.png"
              alt="Smart Parking Logo"
              width={500}
              height={80}
              className="w-20 max-sm:w-16"
            />
            <span className="text-2xl max-sm:text-xl font-bold text-white">
              Smart Parking
            </span>
          </div>
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          id="menu-toggle"
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-blue-950 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          aria-controls="navbar-default"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>

        {/* Navigation Links */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } w-full md:block md:w-auto`}
          id="navbar-default"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-transparent">
            {isLoggedIn && (
              <>
                <li>
                  <Link
                    href="/"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-blue-200 md:hover:bg-transparent md:border-0 md:hover:text-blue-950 md:hover:underline hover:font-semibold"
                  >
                    Home
                  </Link>
                </li>
                
                <li>
                  <Link
                    href="/parking_space"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-blue-200 md:hover:bg-transparent md:border-0 md:hover:text-blue-950 md:hover:underline hover:font-semibold"
                  >
                    Parking Space
                  </Link>
                </li>
                <li>
                  <Link
                    href="/status"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-blue-200 md:hover:bg-transparent md:border-0 md:hover:text-blue-950 md:hover:underline hover:font-semibold"
                  >
                    Status
                  </Link>
                </li>
                <li>
                  <Link
                    href="/payment"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-blue-200 md:hover:bg-transparent md:border-0 md:hover:text-blue-950 md:hover:underline hover:font-semibold"
                  >
                    Payment
                  </Link>
                </li>
              </>
            )}
            {/* เมนู User */}
            <li className="md:hidden">
              <Link
                href="/user"
                className="block py-2 px-3 text-gray-900 rounded hover:bg-blue-200 md:hover:bg-transparent md:border-0 md:hover:text-blue-950 md:hover:underline hover:font-semibold"
              >
                User
              </Link>
            </li>
            <li className="hidden md:block">
              <Link href="/user" aria-label="User Profile">
                <Image
                  src="/account.png"
                  alt="User Profile"
                  width={40}
                  height={40}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full"
                />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
