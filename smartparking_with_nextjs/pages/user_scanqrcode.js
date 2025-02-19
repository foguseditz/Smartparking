import Layout from "@/components/layout";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import {
  collection,
  getDocs,
  query,
  where,
  setDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import { db } from "@/pages/firebase/config";
import Head from "next/head";
import { QRCodeCanvas } from "qrcode.react";

export default function UserScan() {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    uid: "",
  });
  const [loading, setLoading] = useState(true);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const scanTimerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    console.log("User data in localStorage:", localStorage.getItem("user"));
    const checkAndFetchUserData = async () => {
      try {
        const userDataStr = localStorage.getItem("user");
        if (!userDataStr) {
          console.log("No user data in localStorage");
          return;
        }

        const user = JSON.parse(userDataStr);
        setUserData({
          username: user.username || "",
          email: user.email || "",
          uid: user.uid || "",
        });

        try {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("uid", "==", user.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const firestoreData = querySnapshot.docs[0].data();
            setUserData((prevData) => ({
              ...prevData,
              ...firestoreData,
            }));
          }
        } catch (firestoreError) {
          console.log("Firestore fetch error:", firestoreError);
        }
      } catch (error) {
        console.log("Error processing user data:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAndFetchUserData();

    scanTimerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(scanTimerRef.current);
          router.push("/parking_space");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (scanTimerRef.current) {
        clearInterval(scanTimerRef.current);
      }
    };
  }, [router]);

  const handleScanSuccess = async () => {
    try {
      setIsScanning(true);

      const userDataStr = localStorage.getItem("user");
      if (!userDataStr) {
        console.error("No user data found in localStorage");
        setError("User data not found");
        return;
      }

      let user;
      try {
        user = JSON.parse(userDataStr);
        console.log("Parsed user data:", user);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setError("Error reading user data");
        return;
      }

      if (!user || !user.uid) {
        console.error("Invalid user data:", user);
        setError("Invalid user data");
        return;
      }

      const startTime = new Date();
      const parkingLogRef = collection(db, "users", user.uid, "parking_logs");

      const newLog = await addDoc(parkingLogRef, {
        start_time: startTime,
        exit_time: null,
        payment_status: false,
        total_amount: 0,
      });

      console.log("Successfully saved parking log with parklog_id:", newLog.id);
      localStorage.setItem("parklog_id", newLog.id);

      await setDoc(
        doc(db, "users", user.uid, "parking_logs", newLog.id),
        {
          parklog_id: newLog.id,
        },
        { merge: true }
      );

      setScanSuccess(true);

      setTimeout(() => {
        router.push("/status");
      }, 2000);
    } catch (error) {
      console.error("Error in handleScanSuccess:", error);
      setError(error.message || "Failed to process scan");
    } finally {
      setIsScanning(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

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
              {userData.username}
            </p>
          </div>
          <div className="flex items-center mt-4">
            <p className="font-semibold text-lg max-md:text-sm">
              Email &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; :
            </p>
            <p className="text-gray-700 ms-14 max-md:text-sm">
              {userData.email}
            </p>
          </div>
          <div className="my-9 justify-items-center">
            {userData.uid && (
              <QRCodeCanvas
                value={userData.uid}
                size={156}
                level={"H"}
                className="rounded-md shadow-xl m-auto"
              />
            )}
          </div>
          <div className="text-center mb-4">
            <p className="text-lg font-semibold text-gray-700">
              Time left to scan: {formatTime(timeLeft)}
            </p>
          </div>
          <button
            onClick={handleScanSuccess}
            className={`w-full py-2 rounded-md transition duration-300 ${
              isScanning
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            disabled={isScanning}
          >
            {isScanning ? "Processing..." : "Simulate QR Scan"}
          </button>
        </div>
        {scanSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Scan Successful!
              </h3>
              <p className="text-gray-500">
                You can now access the parking area.
              </p>
            </div>
          </div>
        )}
        {error && (
          <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </>
  );
}

UserScan.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
