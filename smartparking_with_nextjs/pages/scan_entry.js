// นำเข้า components และ dependencies ที่ใช้ในโปรเจกต์
import Layout from "@/components/layout";
import Image from "next/image"; // ใช้สำหรับจัดการรูปภาพใน Next.js
import { useEffect, useState, useRef } from "react"; // Hook สำหรับจัดการ state และ lifecycle
import { useRouter } from "next/router"; // ใช้สำหรับการเปลี่ยนหน้า
import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  doc,
} from "firebase/firestore"; // นำเข้าฟังก์ชันสำหรับจัดการ Firestore
import { db } from "@/pages/firebase/config"; // ไฟล์ config ของ Firebase
import Head from "next/head"; // ใช้สำหรับตั้งค่า <head> ใน HTML
import { QRCodeCanvas } from "qrcode.react"; // ใช้สำหรับสร้าง QR Code

// ฟังก์ชันหลักของ component
export default function ScanEntry() {
  // กำหนด state ต่าง ๆ สำหรับการจัดการข้อมูล
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    uid: "",
  }); // เก็บข้อมูลของผู้ใช้งาน
  const [loading, setLoading] = useState(true); // สถานะการโหลดข้อมูล
  const [timeLeft, setTimeLeft] = useState(120); // เวลาที่เหลือในการสแกน QR Code
  const [error, setError] = useState(""); // เก็บข้อความ error
  const [scanSuccess, setScanSuccess] = useState(false); // เก็บสถานะการสแกนสำเร็จ
  const [countdown, setCountdown] = useState(1); // เวลานับถอยหลังก่อน redirect
  const scanTimerRef = useRef(null); // ตัวแปรอ้างอิงสำหรับตัวจับเวลา
  const unsubscribeRef = useRef(null); // ตัวแปรอ้างอิงสำหรับ unsubscribe การเปลี่ยนแปลงข้อมูล Firestore
  const hasRedirectedRef = useRef(false); // ตรวจสอบว่าได้เปลี่ยนหน้าแล้วหรือยัง
  const router = useRouter(); // ใช้สำหรับการเปลี่ยนหน้าใน Next.js

  // useEffect สำหรับการตรวจสอบข้อมูลผู้ใช้งานและ subscribe การเปลี่ยนแปลงข้อมูลใน Firestore
  useEffect(() => {
    const checkAndFetchUserData = async () => {
      try {
        // ดึงข้อมูลผู้ใช้งานจาก localStorage
        const userDataStr = localStorage.getItem("user");
        if (!userDataStr) {
          console.log("No user data in localStorage");
          return;
        }

        // แปลงข้อมูลจาก JSON และตั้งค่า state ของข้อมูลผู้ใช้
        const user = JSON.parse(userDataStr);
        setUserData({
          username: user.username || "",
          email: user.email || "",
          uid: user.uid || "",
        });

        // ตรวจสอบว่าผู้ใช้งานมี session การจอดรถที่ยังไม่ปิดอยู่หรือไม่
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

          // ถ้ามี session ที่ยังไม่ปิด ให้เปลี่ยนหน้าไปยัง status page
          if (!activeSession.empty) {
            const activeParkingLog = activeSession.docs[0];
            localStorage.setItem("parklog_id", activeParkingLog.id);
            router.push("/status");
            return;
          }

          // Subscribe การเปลี่ยนแปลงใน Firestore ถ้าไม่มี session ที่เปิดอยู่
          unsubscribeRef.current = onSnapshot(
            activeSessionQuery,
            (snapshot) => {
              if (!hasRedirectedRef.current) {
                snapshot.docChanges().forEach((change) => {
                  if (change.type === "added") {
                    hasRedirectedRef.current = true; // ตั้งค่าว่าได้ redirect แล้ว
                    const parklogId = change.doc.id;
                    localStorage.setItem("parklog_id", parklogId);
                    setScanSuccess(true); // ตั้งค่าสถานะการสแกนสำเร็จ

                    // นับถอยหลังก่อน redirect ไปยัง status page
                    const countdownInterval = setInterval(() => {
                      setCountdown((prevCountdown) => {
                        if (prevCountdown <= 0) {
                          clearInterval(countdownInterval);
                          router.push("/status");
                        }
                        return prevCountdown - 0.5;
                      });
                    }, 500); // อัปเดตทุก 500ms
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
        setLoading(false); // ตั้งค่าสถานะว่าโหลดเสร็จแล้ว
      }
    };

    checkAndFetchUserData();

    // ตั้ง timer สำหรับ redirect ไปยังหน้าที่จอดรถถ้าเวลาหมด
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

    // Cleanup function เพื่อ clear timer และ unsubscribe Firestore เมื่อ component ถูกทำลาย
    return () => {
      if (scanTimerRef.current) {
        clearInterval(scanTimerRef.current);
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [router]);

  // ฟังก์ชันสำหรับแปลงเวลาเป็นรูปแบบ mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // แสดงข้อความ Loading ถ้าข้อมูลยังไม่โหลดเสร็จ
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // แสดงข้อความ error ถ้ามีข้อผิดพลาด
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // แสดงข้อมูลผู้ใช้งานและ QR Code
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

        {/* Popup สำหรับแจ้งเตือนการสแกนสำเร็จ */}
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

// กำหนด layout สำหรับ component
ScanEntry.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
