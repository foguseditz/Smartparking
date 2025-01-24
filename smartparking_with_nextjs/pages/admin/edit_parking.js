import Layout from "@/components/layout";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { db } from "@/pages/firebase/config";
import {
  doc,
  onSnapshot,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function Edit_Parking() {
  const [carCount, setCarCount] = useState(0);
  const [totalSpaces, setTotalSpaces] = useState(0);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newTotalSpaces, setNewTotalSpaces] = useState(0);
  const [parkingRate, setParkingRate] = useState(0);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [newParkingRate, setNewParkingRate] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    // ค้นหา role โดยใช้ query
    const checkRole = async () => {
      try {
        const usersRef = collection(db, "users");
        // สร้าง query เพื่อหา document ที่มี role เป็น "admin"
        const q = query(usersRef, where("role", "==", "admin"));
        const querySnapshot = await getDocs(q);

        // ถ้าเจอ document ที่มี role เป็น admin
        if (!querySnapshot.empty) {
          console.log("Found admin role");
          setRole("admin");
        } else {
          console.log("No admin role found");
          setRole("user");
        }
      } catch (err) {
        console.error("Error checking role:", err);
        setRole("user"); // default to user if error
      }
    };

    // เรียกใช้ฟังก์ชัน checkRole
    checkRole();

    // ดึงข้อมูลที่จอดรถจาก Firestore
    const parkingDocRef = doc(db, "parking", "parkingDocId");
    const unsubscribeParking = onSnapshot(parkingDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setCarCount(docSnap.data().carCount || 0);
        setTotalSpaces(docSnap.data().totalSpaces || 0);
        setNewTotalSpaces(docSnap.data().totalSpaces || 0);
        setParkingRate(docSnap.data().parkingRate || 0);
        setNewParkingRate(docSnap.data().parkingRate || 0);
      } else {
        setError("Parking data not found!");
      }
      setLoading(false);
    });

    // Cleanup function
    return () => {
      unsubscribeParking();
    };
  }, []);

  const updateTotalSpaces = async () => {
    if (newTotalSpaces < 0) {
      setError("Total spaces cannot be negative.");
      return;
    }
    try {
      const docRef = doc(db, "parking", "parkingDocId");
      await updateDoc(docRef, { totalSpaces: newTotalSpaces });
      setIsEditing(false);
      setError("");
    } catch (error) {
      console.error("Error updating totalSpaces:", error);
      setError("Failed to update total spaces. Please try again.");
    }
  };

  const updateParkingRate = async () => {
    if (newParkingRate < 0) {
      setError("Parking rate cannot be negative.");
      return;
    }
    try {
      const docRef = doc(db, "parking", "parkingDocId");
      await updateDoc(docRef, { parkingRate: newParkingRate });
      setIsEditingRate(false);
      setError("");
    } catch (error) {
      console.error("Error updating parking rate:", error);
      setError("Failed to update parking rate. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    );
  }

  console.log("Role:", role); // ตรวจสอบค่า role

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

        <div className="flex flex-col items-center mt-6 md:mt-8 space-y-4">
          {/* Cars Parked Section */}
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <h2 className="text-xl md:text-2xl font-medium">
              Cars Parked: {carCount} / {totalSpaces}
            </h2>
            {role === "admin" && (
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <input
                      type="number"
                      value={newTotalSpaces}
                      onChange={(e) =>
                        setNewTotalSpaces(Number(e.target.value))
                      }
                      className="border border-gray-300 rounded-lg p-2 w-24 md:w-28"
                      min="0"
                    />
                    <button
                      onClick={updateTotalSpaces}
                      className="px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm md:text-base"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm md:text-base"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm md:text-base"
                  >
                    Edit Spaces
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Parking Rate Section */}
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <p className="text-lg md:text-2xl font-medium">
              Parking Rate: {parkingRate} Baht/Hour
            </p>
            {role === "admin" && (
              <div className="flex items-center space-x-2">
                {isEditingRate ? (
                  <>
                    <input
                      type="number"
                      value={newParkingRate}
                      onChange={(e) =>
                        setNewParkingRate(Number(e.target.value))
                      }
                      className="border border-gray-300 rounded-lg p-2 w-24 md:w-28"
                      min="0"
                    />
                    <button
                      onClick={updateParkingRate}
                      className="px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm md:text-base"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingRate(false)}
                      className="px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm md:text-base"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditingRate(true)}
                    className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm md:text-base"
                  >
                    Edit Rate
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Parking Grid */}
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
                  className={
                    index < carCount
                      ? "w-20 h-20 md:w-24 md:h-24 object-contain"
                      : "w-20 h-20 md:w-24 md:h-24 object-contain"
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
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

        {/* Access Parking Area Button - Only shown for non-admin users */}
        {role !== "admin" && (
          <div className="flex justify-center mt-5 mb-8 md:mb-32">
            <Link
              href="/user"
              className="w-64 sm:w-72 md:w-96 h-10 sm:h-12 p-2 text-center bg-[#1E3A8A] text-white font-semibold text-sm md:text-lg rounded-xl shadow-xl hover:bg-blue-500"
            >
              Access Parking Area
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

Edit_Parking.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
