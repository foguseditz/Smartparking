import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/navbar.module.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logoLink}>
          <Image
            src="/logo-smart-parking.png"
            alt="Smart Parking Logo"
            width={90}
            height={90}
            className="max-sm:w-20"
          />
          <span className={styles.logoText}>Smart Parking</span>
        </Link>
        <button
          id="menu-toggle"
          type="button"
          className={styles.menuToggle}
          aria-controls="navbar-default"
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          <svg
            className={styles.menuIcon}
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
          className={`${
            menuOpen ? styles.menuOpen : styles.menuClosed
          } w-full md:block md:w-auto`}
          id="navbar-default"
        >
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link href="/" className={styles.navLink}>
                Home
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/parking_space" className={styles.navLink}>
                Parking space
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/status" className={styles.navLink}>
                Status
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/payment" className={styles.navLink}>
                Payment
              </Link>
            </li>
            <li className={styles.navItemUserMobile}>
              <Link href="/user" className={styles.navLink}>
                User
              </Link>
            </li>
            <li className={`${styles.menuClosed} ${styles.navItemUserMobile}`}>
              <Link href="/user">
                <Image
                  src="/account.png"
                  alt="User Profile"
                  width={45}
                  height={45}
                />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}