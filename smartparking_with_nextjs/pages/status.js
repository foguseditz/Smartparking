import { useState, useEffect, useRef } from "react";
import Layout from "@/components/layout";
import Head from "next/head";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { db } from "./firebase/config";

export default function Status() {
  const [showAlert, setShowAlert] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingExit, setProcessingExit] = useState(false);

  // State for missing data
  const [missingData, setMissingData] = useState(false);
  // State for the popup message
  const [missingMessage, setMissingMessage] = useState("");

  const router = useRouter();
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchStartTime = async () => {
      try {
        setLoading(true);

        const userData = localStorage.getItem("user");
        const parklogId = localStorage.getItem("parklog_id");

        // If no user or parklogId => show popup
        if (!userData || !parklogId) {
          setMissingData(true);
          setMissingMessage(
            "Please confirm your parking entrance before accessing this page."
          );
          setLoading(false);
          return;
        }

        const user = JSON.parse(userData);
        if (!user?.uid) {
          router.push("/auth/login");
          return;
        }

        // Fetch Firestore data
        const logDoc = await getDoc(
          doc(db, "users", user.uid, "parking_logs", parklogId)
        );
        if (!logDoc.exists()) {
          // If no document => show popup
          setMissingData(true);
          setMissingMessage(
            "Parking log not found. Please confirm your parking usage again."
          );
          setLoading(false);
          return;
        }

        // Otherwise, set times
        const { start_time, exit_time } = logDoc.data();

        if (start_time) {
          const timeValue = start_time?.toMillis?.() || start_time;
          setStartTime(timeValue);
          setIsTimerRunning(true);
        }

        if (exit_time) {
          // If exit_time exists => stop timer
          setIsTimerRunning(false);
          setDuration({
            hours: Math.floor(
              (exit_time.toMillis() - start_time.toMillis()) / 3600000
            ),
            minutes: Math.floor(
              ((exit_time.toMillis() - start_time.toMillis()) % 3600000) / 60000
            ),
            seconds: Math.floor(
              ((exit_time.toMillis() - start_time.toMillis()) % 60000) / 1000
            ),
          });
        }
      } catch (error) {
        console.error("Error fetching parking log:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStartTime();
    return () => clearInterval(intervalRef.current);
  }, [router]);

  useEffect(() => {
    if (!startTime || !isTimerRunning) return;

    const updateDuration = () => {
      const now = Date.now();
      const diff = now - startTime;
      setDuration({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };

    updateDuration();
    intervalRef.current = setInterval(updateDuration, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isTimerRunning, startTime]);

  const handleLeaveParking = () => {
    setShowAlert(true);
  };

  const handleConfirmLeave = async () => {
    try {
      setProcessingExit(true);

      const userData = localStorage.getItem("user");
      const parklogId = localStorage.getItem("parklog_id");
      if (!userData || !parklogId) {
        alert("User data or parking log ID not found");
        return;
      }

      localStorage.setItem(
        "exitScanData",
        JSON.stringify({
          waitingForExitScan: true,
          originalParklogId: parklogId,
        })
      );

      setShowAlert(false);
      router.push("/scan_exit");
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
      setShowAlert(false);
    } finally {
      setProcessingExit(false);
    }
  };

  if (loading) {
    return <p className="text-center py-10 text-lg">Loading...</p>;
  }

  // If missing data => show popup
  if (missingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notice</h3>
          <p className="text-gray-500 mb-4">{missingMessage}</p>
          <div className="flex justify-end">
            <button
              onClick={() => router.push("/parking_space")}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal UI if data is found
  return (
    <>
      <Head>
        <title>Status - Smart Parking</title>
      </Head>
      <div className="relative">
        <div className="mt-10 sm:mt-16 mx-4 sm:mx-auto sm:max-w-[1000px] bg-[#BAD0FD] rounded-md shadow-lg">
          <p className="text-center py-10 text-lg sm:text-2xl">
            <span className="font-bold">Duration :</span>{" "}
            {isTimerRunning ? (
              <>
                {duration.hours} hour{duration.hours !== 1 && "s"},{" "}
                {duration.minutes} minute{duration.minutes !== 1 && "s"},{" "}
                {duration.seconds} second{duration.seconds !== 1 && "s"}
              </>
            ) : (
              "0 hours, 0 minutes, 0 seconds"
            )}
          </p>
        </div>
        <div className="mt-5 flex justify-center">
          <button
            onClick={handleLeaveParking}
            disabled={processingExit}
            className={`rounded-md bg-[#E83C3F] px-6 sm:px-20 py-2.5 text-base sm:text-lg font-semibold text-white shadow-sm hover:bg-red-300 ${
              processingExit ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {processingExit ? "Processing..." : "Leave Parking Area"}
          </button>
        </div>

        {showAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirm Leave Parking
              </h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to leave the parking area?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleConfirmLeave}
                  disabled={processingExit}
                  className={`px-4 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 ${
                    processingExit ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {processingExit ? "Processing..." : "Confirm"}
                </button>
                <button
                  onClick={() => setShowAlert(false)}
                  disabled={processingExit}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

Status.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
