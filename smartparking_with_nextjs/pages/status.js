import { useState, useEffect, useRef } from "react";
import Layout from "@/components/layout";
import Head from "next/head";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
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
  const router = useRouter();
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchStartTime = async () => {
      try {
        setLoading(true);
        const userData = localStorage.getItem("user");
        const parklogId = localStorage.getItem("parklog_id");

        if (!userData || !parklogId) {
          throw new Error("Missing user or parking log ID");
        }

        const user = JSON.parse(userData);
        if (!user?.uid) {
          router.push("/auth/login");
          return;
        }

        const logDoc = await getDoc(
          doc(db, "users", user.uid, "parking_logs", parklogId)
        );

        if (logDoc.exists() && logDoc.data().start_time) {
          const timestamp = logDoc.data().start_time;
          const timeValue = timestamp?.toMillis?.() || timestamp;

          setStartTime(timeValue);
          setIsTimerRunning(true);
        } else {
          setIsTimerRunning(false);
        }
      } catch (error) {
        console.error("Error fetching parking log:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStartTime();
  }, [router]);

  useEffect(() => {
    if (!startTime || !isTimerRunning) return;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const diff = now - startTime;

      setDuration({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isTimerRunning, startTime]);

  const handleLeaveParking = () => setShowAlert(true);

  const handleConfirmLeave = async () => {
    try {
      const userData = localStorage.getItem("user");
      const parklogId = localStorage.getItem("parklog_id");

      if (!userData || !parklogId)
        throw new Error("User data or parking log ID not found");

      const user = JSON.parse(userData);
      if (!user?.uid) throw new Error("Invalid user data");

      const endTime = Date.now();

      // ดึงข้อมูล parking rate จาก collection parking โดยใช้ ID "parkingDocId"
      const parkingDoc = await getDoc(doc(db, "parking", "parkingDocId"));
      if (!parkingDoc.exists())
        throw new Error("Parking information not found");

      // คำนวณระยะเวลาจอด
      const logDoc = await getDoc(
        doc(db, "users", user.uid, "parking_logs", parklogId)
      );
      if (!logDoc.exists()) throw new Error("Parking log not found");

      const startTimeValue =
        logDoc.data().start_time?.toMillis?.() || logDoc.data().start_time;
      const diffInMinutes = Math.ceil((endTime - startTimeValue) / 60000);

      // คำนวณค่าบริการจาก parkingRate
      const totalAmount = parseFloat(
        ((diffInMinutes / 60) * parkingDoc.data().parkingRate).toFixed(2)
      );

      // อัพเดท parking log
      await setDoc(
        doc(db, "users", user.uid, "parking_logs", parklogId),
        {
          exit_time: Timestamp.fromMillis(endTime),
          total_amount: totalAmount,
        },
        { merge: true }
      );

      setIsTimerRunning(false);
      setDuration({ hours: 0, minutes: 0, seconds: 0 });
      router.push("/payment");
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
      setShowAlert(false);
    }
  };

  return (
    <>
      <Head>
        <title>Status - Smart Parking</title>
      </Head>
      <div className="relative">
        {loading ? (
          <p className="text-center py-10 text-lg">Loading...</p>
        ) : (
          <>
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
          </>
        )}
      </div>
    </>
  );
}

Status.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
