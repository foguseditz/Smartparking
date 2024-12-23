import Layout from "@/components/layout";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/pages/firebase/config"; // เพิ่ม Firestore และ Auth

export default function User() {
  const [userData, setUserData] = useState({ username: "", email: "" });
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser; // ดึงข้อมูลผู้ใช้ที่เข้าสู่ระบบ
      if (!user) {
        router.push("/auth/login");
        return;
      }

      try {
        // ดึงเอกสารผู้ใช้จาก Firestore
        const userDoc = doc(db, "users", user.uid); // ใช้ชื่อ Collection เป็น "users"
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
          setUserData(docSnap.data()); // ตั้งค่าข้อมูลจาก Firestore
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem("user");
    auth.signOut();
    router.push("/auth/login");
  };

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
            {userData.username || "Loading..."}
          </p>
        </div>
        <div className="flex items-center mt-4">
          <p className="font-semibold text-lg max-md:text-sm">
            Email &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; :
          </p>
          <p className="text-gray-700 ms-14 max-md:text-xl">
            {userData.email || "Loading..."}
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
        <button
          onClick={handleSignOut}
          className="bg-white border-red-500 border-2 w-[25rem] max-md:w-[22rem] text-red-500 font-semibold py-2 px-4 rounded-md hover:bg-red-500 hover:text-white shadow-xl transition text-center"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

User.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
