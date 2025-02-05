import Layout from "@/components/layout";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  collection,
  getDocs,
  query,
  where,
  setDoc,
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
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanTimer, setScanTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120); // เวลาเริ่มต้น 2 นาที (120 วินาที)
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.uid) {
      router.push("/auth/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          setUserData(userDoc.data());
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // จำกัดเวลาในการสแกน QR Code เป็น 2 นาที
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          alert("Scan time expired. Please try again.");
          router.push("/parking_space");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000); // อัพเดททุก 1 วินาที

    setScanTimer(timer);

    // Cleanup timer เมื่อ component unmount
    return () => clearInterval(timer);
  }, [router]);

  const handleScanSuccess = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const startTime = new Date().getTime(); // เก็บเวลาเป็น timestamp

    // สร้าง ID สำหรับการจอดรถ (ตัวอย่าง: ใช้ timestamp)
    const parklogId = new Date().getTime().toString();

    // บันทึกเวลาเข้าในฐานข้อมูล
    await setDoc(doc(db, "users", user.uid, "parking_logs", parklogId), {
      start_time: startTime, // เก็บเป็น timestamp
      payment_status: false,
      total_amount: 0,
      parklog_id: parklogId,
    });

    setScanSuccess(true);
    setTimeout(() => {
      router.push("/status");
    }, 2000); // แสดงป้อปอัพ 2 วินาทีแล้วไปหน้า status
  };

  // แปลงเวลาเป็นรูปแบบ นาที:วินาที
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

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
            {userData.email ? (
              <QRCodeCanvas
                value={userData.email}
                size={156}
                level={"H"}
                className="rounded-md shadow-xl m-auto"
              />
            ) : (
              <p>Loading QR Code...</p>
            )}
          </div>
          <div className="text-center mb-4">
            <p className="text-lg font-semibold text-gray-700">
              Time left to scan: {formatTime(timeLeft)}
            </p>
          </div>
          <button
            onClick={handleScanSuccess}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Simulate QR Scan
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
      </div>
    </>
  );
}

UserScan.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
