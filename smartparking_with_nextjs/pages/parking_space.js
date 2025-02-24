import Layout from "@/components/layout";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import { db } from "@/pages/firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/router"; // เพิ่ม import useRouter

export default function Parking_space() {
  const router = useRouter(); // เพิ่ม useRouter
  const [carCount, setCarCount] = useState(0);
  const [totalSpaces, setTotalSpaces] = useState(0);
  const [loading, setLoading] = useState(true);
  const [parkingRate, setParkingRate] = useState(0);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false); // เพิ่ม state สำหรับปิด/เปิดป๊อปอัพ

  useEffect(() => {
    const parkingDocRef = doc(db, "parking", "parkingDocId");

    const unsubscribe = onSnapshot(parkingDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // เพิ่มการ clamp (Math.max(0, value))
        const currentCarCount = Math.max(0, data.carCount || 0);
        const currentTotalSpaces = Math.max(0, data.totalSpaces || 0);

        setCarCount(currentCarCount);
        setTotalSpaces(currentTotalSpaces);
        setParkingRate(data.parkingRate || 0);
      } else {
        setError("Parking data not found!");
        setCarCount(0);
        setTotalSpaces(0);
        setParkingRate(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-10">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    );
  }

  const handleAccessParking = () => {
    if (carCount === totalSpaces) {
      setShowModal(true); // ถ้าจำนวนรถเต็ม จะเปิดป๊อปอัพ
    } else {
      router.push("/scan_entry");
    }
  };

  const closeModal = () => {
    setShowModal(false); // ปิดป๊อปอัพ
  };

  return (
    <>
      <div className="mb-20">
        <Head>
          <title>Parking Space - Smart Parking</title>
        </Head>
        <div className="text-center mt-6 md:mt-10">
          <h1 className="text-2xl md:text-3xl font-bold text-[#333333]">
            Parking Space
          </h1>
        </div>

        {error && (
          <div className="text-center text-red-600 mt-4">
            <p>{error}</p>
          </div>
        )}

        {/* ข้อมูลที่จอดรถ */}
        <div className="flex flex-col items-center mt-6 md:mt-8 space-y-4">
          <h2 className="text-xl md:text-2xl font-medium">
            Cars Parked: {carCount} / {totalSpaces}
          </h2>
          <p className="text-lg md:text-2xl font-medium">
            Parking Rate: {parkingRate} Baht/Minute
          </p>
        </div>

        {/* แสดงที่จอดรถแบบ Grid */}
        <div className="flex flex-col items-center justify-center mt-6 md:mt-8 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-0">
            {[...Array(totalSpaces)].map((_, index) => (
              <div
                key={index}
                className="border-dashed border-gray-300 border-2 border-y-0 md:border-x-2 w-32 h-32 md:w-36 md:h-36 flex items-center justify-center"
              >
                <Image
                  src={index < carCount ? "/Car.png" : "/free_space.png"}
                  alt={index < carCount ? "Parked" : "Free"}
                  width={80}
                  height={80}
                  className="w-20 h-20 md:w-24 md:h-24 object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* คำอธิบายสัญลักษณ์ */}
        <div className="flex justify-center mt-6 md:mt-10">
          <div className="w-full md:w-[50%] flex justify-center md:justify-end text-sm md:text-lg space-x-3">
            <div className="flex items-center space-x-2">
              <Image
                src="/Car.png"
                alt="Car"
                width={40}
                height={40}
                className="w-10 h-10 md:w-12 md:h-12"
              />
              <span className="font-medium text-gray-700">: Parked</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 md:w-10 md:h-10 bg-[#BAD0FD] rounded-lg border border-gray-500"></div>
              <span className="font-medium text-gray-700">: Free</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-5 mb-8 md:mb-32">
          <button
            onClick={handleAccessParking}
            className="w-64 sm:w-72 md:w-96 h-10 sm:h-12 p-2 text-center bg-[#1E3A8A] text-white font-semibold text-sm md:text-lg rounded-xl shadow-xl hover:bg-blue-500"
          >
            Access Parking Area
          </button>
        </div>
      </div>

      {/* ป๊อปอัพแจ้งเตือน */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4 text-center">
              No Parking Spaces Available
            </h2>
            <p className="text-center mb-4">
              Currently, all parking spaces are full. Please try again later.
            </p>
            <div className="flex justify-center">
              <button
                onClick={closeModal}
                className="w-32 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

Parking_space.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
