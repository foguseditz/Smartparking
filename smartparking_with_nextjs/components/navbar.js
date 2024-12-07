import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navContainer">
        <Link href="/" className="logoLink">
          <Image
            src="/logo-smart-parking.png"
            alt="Smart Parking Logo"
            width={100}
            height={90}
          />
          <span className="logoText">Smart Parking</span>
        </Link>
        <button
          id="menu-toggle"
          type="button"
          className="menuToggle"
          aria-controls="navbar-default"
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          <svg
            className="menuIcon"
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
        <div
          className={`${menuOpen ? "" : "hidden"} w-full md:block md:w-auto`}
          id="navbar-default"
        >
          <ul className="navList max-sm:mt-4">
            <li className="navItem">
              <Link href="/" className="navLink">
                Home
              </Link>
            </li>
            <li className="navItem">
              <Link href="/parking_space" className="navLink">
                Parking space
              </Link>
            </li>
            <li className="navItem">
              <Link href="/status" className="navLink">
                Status
              </Link>
            </li>
            <li className="navItem">
              <Link href="/payment" className="navLink ma">
                Payment
              </Link>
            </li>
            <li className="navItemUserMobile">
              <Link href="/user" className="navLink">
                User
              </Link>
            </li>
            <li className="menuClosed navItemUserDesktop">
              <Link href="/user">
                <Image
                  src="/account.png"
                  alt="User Profile"
                  width={50}
                  height={50}
                  className="userAvatar"
                />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
