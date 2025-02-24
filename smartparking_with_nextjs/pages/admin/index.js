import Layout from "@/components/layout";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/pages/firebase/config";
import Head from "next/head";

export default function Admin() {
  const [userData, setUserData] = useState({ username: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const userStr = window?.localStorage?.getItem("user");
        if (!userStr) {
          await router.replace("/auth/login");
          return;
        }

        const user = JSON.parse(userStr);
        if (!user?.email) {
          await router.replace("/auth/login");
          return;
        }

        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();

          // ถ้าไม่ใช่ admin ให้ redirect ไปหน้า user
          if (userData.role !== "admin") {
            await router.replace("/");
            return;
          }

          setUserData(userData);
        } else {
          console.error("No such document!");
          await router.replace("/auth/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        await router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [router]);

  const handleSignOut = async () => {
    try {
      window.localStorage.removeItem("user");
      await router.replace("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const AlertDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Confirm Sign Out
        </h3>
        <p className="text-gray-500 mb-6">Are you sure you want to sign out?</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleSignOut} // แก้จาก handleSignOutConfirm เป็น handleSignOut
            className="px-4 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
          <button
            onClick={() => setShowAlert(false)}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center mt-10">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin - Smart Parking</title>
      </Head>
      <div className="flex flex-col items-center m-auto mt-5 mb-40 relative">
        <div className="bg-[#BAD0FD] rounded-full w-32 max-md:w-28 mt-8 relative z-20">
          <Image src="/account.png" alt="account" width={128} height={60} />
        </div>
        <div className="bg-[#BAD0FD] w-[27rem] max-md:w-[24rem] max-sm:pt-16 pt-16 p-4 rounded-md shadow-xl absolute top-10 max-md:top-7 z-10 mt-[4rem]">
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
            <p className="text-gray-700 ms-14 max-md:text-sm">
              {userData.email || "Loading..."}
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center p-3 mt-24">
          <button
            onClick={() => setShowAlert(true)}
            className="bg-white border-red-500 border-2 w-[27rem] max-md:w-[24rem] text-red-500 font-semibold py-2 px-4 rounded-md hover:bg-red-500 hover:text-white shadow-xl transition text-center"
          >
            Sign out
          </button>
        </div>
      </div>
      {showAlert && <AlertDialog />}
    </>
  );
}

Admin.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
