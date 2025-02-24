import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { QRCodeCanvas } from "qrcode.react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase/config";
import Layout from "@/components/layout";
import Head from "next/head";
import Image from "next/image";

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export default function ScanExit() {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    uid: "",
  });
  const [exitScanData, setExitScanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(120);
  const [scanSuccess, setScanSuccess] = useState(false);
  const router = useRouter();
  const unsubscribeRef = useRef(null);

  const generateQRCodeValue = (userUid, parklogUid) => {
    return `${userUid}-${parklogUid}`;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const exitScanData = JSON.parse(localStorage.getItem("exitScanData"));
      const userData = JSON.parse(localStorage.getItem("user"));

      console.log("exitScanData:", exitScanData);
      console.log("userData:", userData);

      if (exitScanData && userData) {
        setUserData(userData);
        setExitScanData(exitScanData);
        setLoading(false);
      } else {
        router.push("/parking_space");
      }
    }
  }, [router]);

  useEffect(() => {
    if (!exitScanData || !userData.uid) return;

    const parklogDoc = doc(
      db,
      "users",
      userData.uid,
      "parking_logs",
      exitScanData.originalParklogId
    );

    // subscribe รอว่ามี exit_time + exit_scan_confirmed แล้วหรือยัง
    unsubscribeRef.current = onSnapshot(parklogDoc, async (snapshot) => {
      if (snapshot.exists()) {
        const parkingData = snapshot.data();
        // เงื่อนไขใหม่: รอ exit_time และ exit_scan_confirmed
        if (parkingData.exit_time && parkingData.exit_scan_confirmed) {
          setScanSuccess(true);
          setTimeout(() => {
            console.log("Removing exitScanData from localStorage...");
            localStorage.removeItem("exitScanData");
            router.push("/payment");
          }, 2000);
        }
      }
    });

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          router.push("/parking_space");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      clearInterval(timer);
    };
  }, [exitScanData, userData, router]);

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Exit Scan - Smart Parking</title>
      </Head>
      <div className="text-center mt-5 md:mt-10">
        <h1 className="text-xl md:text-2xl font-bold text-[#333333]">
          Please scan to confirm exiting the parking area
        </h1>
      </div>
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
            {userData.uid && exitScanData?.originalParklogId && (
              <QRCodeCanvas
                value={generateQRCodeValue(
                  userData.uid,
                  exitScanData.originalParklogId
                )}
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
        </div>

        {scanSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Scan Successful!
              </h3>
              <p className="text-gray-500">Redirecting to payment page...</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

ScanExit.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
