import Layout from "@/components/layout";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/pages/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import Head from "next/head";

export default function User() {
  const [userData, setUserData] = useState({ username: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      try {
        const userDoc = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignOutConfirm = () => {
    auth.signOut();
    router.push("/auth/login");
  };

  const AlertDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          ยืนยันการออกจากระบบ
        </h3>
        <p className="text-gray-500 mb-6">คุณต้องการออกจากระบบใช่หรือไม่?</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setShowAlert(false)}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium rounded-md transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSignOutConfirm}
            className="px-4 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition-colors"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );


  return (
    <>
      <Head>
        <title>User - Smart Parking</title>
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
          <div className="my-9 justify-items-center">
            <img
              src="/qr-code.png"
              alt="QR Code"
              className="w-36 rounded-md shadow-xl m-auto"
            />
          </div>
        </div>
        <div className="flex justify-center items-center p-3 mt-80">
          <button
            onClick={() => setShowAlert(true)}
            className="bg-white border-red-500 border-2 w-[25rem] max-md:w-[22rem] text-red-500 font-semibold py-2 px-4 rounded-md hover:bg-red-500 hover:text-white shadow-xl transition text-center"
          >
            Sign out
          </button>
        </div>
      </div>
      {showAlert && <AlertDialog />}
    </>
  );
}

User.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
