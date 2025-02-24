import { useEffect, useState, useRef } from "react"; // ใช้ hook สำหรับจัดการ state และ lifecycle
import { useRouter } from "next/router"; // ใช้สำหรับเปลี่ยนหน้า
import { QRCodeCanvas } from "qrcode.react"; // ใช้สำหรับสร้าง QR Code
import { doc, onSnapshot } from "firebase/firestore"; // ฟังก์ชันของ Firestore สำหรับการ subscribe ข้อมูล
import { db } from "./firebase/config"; // นำเข้าไฟล์ config ของ Firebase
import Layout from "@/components/layout"; // Layout หลักของหน้า
import Head from "next/head"; // ใช้สำหรับตั้งค่า <head> ของ HTML
import Image from "next/image"; // ใช้สำหรับการจัดการรูปภาพใน Next.js

// ฟังก์ชันสำหรับแปลงเวลาเป็นรูปแบบ mm:ss
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export default function ScanExit() {
  // กำหนด state ต่าง ๆ
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    uid: "",
  }); // เก็บข้อมูลผู้ใช้งาน
  const [exitScanData, setExitScanData] = useState(null); // เก็บข้อมูลการสแกน
  const [loading, setLoading] = useState(true); // สถานะการโหลดข้อมูล
  const [timeLeft, setTimeLeft] = useState(120); // เวลาที่เหลือในการสแกน QR Code
  const [scanSuccess, setScanSuccess] = useState(false); // สถานะการสแกนสำเร็จ
  const router = useRouter(); // ใช้สำหรับเปลี่ยนหน้า
  const unsubscribeRef = useRef(null); // ตัวอ้างอิงสำหรับ unsubscribe การเปลี่ยนแปลงข้อมูล Firestore

  // ฟังก์ชันสำหรับการสร้างค่าของ QR Code
  const generateQRCodeValue = (userUid, parklogUid) => {
    return `${userUid}-${parklogUid}`;
  };

  // useEffect สำหรับดึงข้อมูลจาก localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const exitScanData = JSON.parse(localStorage.getItem("exitScanData")); // ดึงข้อมูล exitScanData จาก localStorage
      const userData = JSON.parse(localStorage.getItem("user")); // ดึงข้อมูล userData จาก localStorage

      // ปริ้นข้อมูลที่ดึงมาใน console
      console.log("exitScanData:", exitScanData);
      console.log("userData:", userData);

      if (exitScanData && userData) {
        setUserData(userData); // ตั้งค่า state ของข้อมูลผู้ใช้
        setExitScanData(exitScanData); // ตั้งค่า state ของข้อมูลการสแกน
        setLoading(false); // เปลี่ยนสถานะ loading เมื่อข้อมูลถูกโหลด
      } else {
        router.push("/parking_space"); // ถ้าไม่มีข้อมูล ให้เปลี่ยนหน้าไปที่หน้า parking_space
      }
    }
  }, [router]);

  // useEffect สำหรับ subscribe ข้อมูลจาก Firestore
  useEffect(() => {
    if (!exitScanData || !userData.uid) return; // ถ้าไม่มีข้อมูล exitScanData หรือ userData ให้ return ออกไป

    // อ้างอิงถึงเอกสารใน Firestore
    const parklogDoc = doc(
      db,
      "users",
      userData.uid,
      "parking_logs",
      exitScanData.originalParklogId
    );

    // Subscribe การเปลี่ยนแปลงของ parking log
    unsubscribeRef.current = onSnapshot(parklogDoc, async (snapshot) => {
      if (snapshot.exists()) {
        const parkingData = snapshot.data();

        // ตรวจสอบว่า exit_time และ exit_scan_confirmed ถูกบันทึกแล้ว
        if (parkingData.exit_time && parkingData.exit_scan_confirmed) {
          setScanSuccess(true); // ตั้งค่าสถานะการสแกนสำเร็จ

          setTimeout(() => {
            console.log("Removing exitScanData from localStorage...");
            localStorage.removeItem("exitScanData"); // ลบข้อมูล exitScanData จาก localStorage
            router.push("/payment"); // เปลี่ยนหน้าไปยัง payment page
          }, 2000);
        }
      }
    });

    // ตัวจับเวลาหมดเวลา (120 วินาที) ก่อนจะเปลี่ยนหน้า
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

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current(); // ยกเลิกการ subscribe ข้อมูล
      }
      clearInterval(timer); // ยกเลิกตัวจับเวลา
    };
  }, [exitScanData, userData, router]);

  // ถ้าข้อมูลยังโหลดไม่เสร็จ ให้แสดงข้อความ Loading
  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  // UI หลักของหน้า ScanExit
  return (
    <>
      <Head>
        <title>Exit Scan - Smart Parking</title>
      </Head>
      <div className="flex flex-col items-center m-auto mt-5 mb-40 relative">
        <div className="bg-[#BAD0FD] rounded-full w-32 max-md:w-28 mt-8 relative z-20">
          <Image src="/account.png" alt="account" width={128} height={60} />{" "}
          {/* รูปภาพของผู้ใช้ */}
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
                )} // สร้าง QR Code จาก userUid และ parklogUid
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

        {/* Popup สำหรับแจ้งเตือนการสแกนสำเร็จ */}
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

// กำหนด layout ของหน้า
ScanExit.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};