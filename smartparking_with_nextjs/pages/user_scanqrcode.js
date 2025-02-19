import Layout from "@/components/layout";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  doc,
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
  const [timeLeft, setTimeLeft] = useState(120);
  const [error, setError] = useState("");
  const [scanSuccess, setScanSuccess] = useState(false); // State สำหรับสถานะการสแกน
  const [countdown, setCountdown] = useState(1); // เวลาในหน่วยวินาที
  const scanTimerRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const hasRedirectedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
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

        // Check for existing active parking session
        if (user.uid) {
          const parkingLogsRef = collection(
            db,
            "users",
            user.uid,
            "parking_logs"
          );
          const activeSessionQuery = query(
            parkingLogsRef,
            where("exit_time", "==", null)
          );
          const activeSession = await getDocs(activeSessionQuery);

          if (!activeSession.empty) {
            // If there's an active session, get its ID and redirect
            const activeParkingLog = activeSession.docs[0];
            localStorage.setItem("parklog_id", activeParkingLog.id);
            router.push("/status");
            return;
          }

          // Subscribe to new parking logs only if no active session
          unsubscribeRef.current = onSnapshot(
            activeSessionQuery,
            (snapshot) => {
              if (!hasRedirectedRef.current) {
                // Check if we haven't redirected yet
                snapshot.docChanges().forEach((change) => {
                  if (change.type === "added") {
                    hasRedirectedRef.current = true; // Mark that we're redirecting
                    const parklogId = change.doc.id;
                    localStorage.setItem("parklog_id", parklogId);
                    setScanSuccess(true); // Set scan success to true when new log is added
                    // Start countdown for 2.5 seconds
                    const countdownInterval = setInterval(() => {
                      setCountdown((prevCountdown) => {
                        if (prevCountdown <= 0) {
                          clearInterval(countdownInterval);
                          router.push("/status");
                        }
                        return prevCountdown - 0.5;
                      });
                    }, 500); // Update every 500ms for smooth countdown
                  }
                });
              }
            },
            (error) => {
              console.error("Error listening to parking logs:", error);
            }
          );
        }
      } catch (error) {
        console.log("Error processing user data:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAndFetchUserData();

    // Timer for page redirect
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

    // Cleanup
    return () => {
      if (scanTimerRef.current) {
        clearInterval(scanTimerRef.current);
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [router]);

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
        </div>

        {/* Popup for scan success */}
        {scanSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Scan Successful!
              </h3>
              <p className="text-gray-500">
                Redirecting to the parking status page
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

UserScan.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
