import { useState, useEffect } from "react";
import Layout from "@/components/layout";
import Head from "next/head";

import { doc, getDoc, setDoc } from "firebase/firestore";
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
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.uid) {
      router.push("/auth/login");
      return;
    }

    const fetchStartTime = async () => {
      const logDoc = await getDoc(
        doc(db, "users", user.uid, "parking_logs", "current_log")
      );
      if (logDoc.exists() && logDoc.data().start_time) {
        setStartTime(logDoc.data().start_time);
        setIsTimerRunning(true);
      } else {
        setIsTimerRunning(false);
      }
      setLoading(false);
    };

    fetchStartTime();
  }, [router]);

  useEffect(() => {
    let interval;
    if (isTimerRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date().getTime(); // เวลาปัจจุบันเป็น timestamp
        const start = startTime; // startTime เป็น timestamp
        const diff = now - start;

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        setDuration({ hours, minutes, seconds });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, startTime]);

  const handleLeaveParking = async () => {
    setShowAlert(true);
  };

  const handleConfirmLeave = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const endTime = new Date().getTime(); // เวลาออกเป็น timestamp

    // ดึงข้อมูลเวลาเข้า
    const logDoc = await getDoc(
      doc(db, "users", user.uid, "parking_logs", "current_log")
    );
    if (logDoc.exists()) {
      const startTime = logDoc.data().start_time;
      const start = startTime; // startTime เป็น timestamp
      const end = endTime; // endTime เป็น timestamp

      // คำนวณค่าบริการ (ตัวอย่าง: 100 บาทต่อชั่วโมง)
      const diffInHours = (end - start) / (1000 * 60 * 60);
      const totalAmount = Math.ceil(diffInHours) * 100;

      // บันทึกเวลาออกและค่าบริการในฐานข้อมูล
      await setDoc(
        doc(db, "users", user.uid, "parking_logs", "current_log"),
        {
          exit_time: endTime, // เก็บเป็น timestamp
          total_amount: totalAmount,
        },
        { merge: true }
      );

      // หยุดจับเวลาและรีเซ็ตค่า duration เป็น 0
      setIsTimerRunning(false);
      setDuration({ hours: 0, minutes: 0, seconds: 0 });

      router.push("/payment");
    }
  };

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
            className="rounded-md bg-[#E83C3F] px-6 sm:px-20 py-2.5 text-base sm:text-lg font-semibold text-white shadow-sm hover:bg-red-300"
          >
            Leave Parking Area
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
                  className="px-4 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowAlert(false)}
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
