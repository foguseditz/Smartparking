import Layout from "@/components/layout";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { db } from "@/pages/firebase/config";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Parking_space() {
  const [carCount, setCarCount] = useState(0);
  const [totalSpaces, setTotalSpaces] = useState(0);
  const [role, setRole] = useState(null); // Track user role
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newTotalSpaces, setNewTotalSpaces] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setRole(docSnap.data().role);
          } else {
            console.error("User role not found!");
          }
        });
      } else {
        setRole(null);
      }
    });
  }, []);

  // Real-time listener for parking data
  useEffect(() => {
    const docRef = doc(db, "parking", "parkingDocId"); // Replace with actual document ID
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setCarCount(docSnap.data().carCount || 0);
        setTotalSpaces(docSnap.data().totalSpaces || 0);
        setNewTotalSpaces(docSnap.data().totalSpaces || 0); // Initialize edit value
      } else {
        console.error("Parking data not found!");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update totalSpaces in Firestore
  const updateTotalSpaces = async () => {
    try {
      const docRef = doc(db, "parking", "parkingDocId");
      await updateDoc(docRef, { totalSpaces: newTotalSpaces });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating totalSpaces:", error);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10">
        <h1 className="text-3xl font-bold">Loading..</h1>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Parking Space - Smart Parking</title>
      </Head>
      <div className="text-center mt-10">
        <h1 className="text-3xl max-md:text-2xl font-bold text-[#333333]">
          Parking Space
        </h1>
      </div>

      <div className="text-center mt-8">
        <h2 className="text-2xl font-medium">{`Cars Parked: ${carCount} / ${totalSpaces}`}</h2>
      </div>

      {/* Admin Edit Section */}
      {role === "admin" && (
        <div className="flex justify-center mt-5">
          {isEditing ? (
            <div className="flex items-center space-x-4">
              <input
                type="number"
                value={newTotalSpaces}
                onChange={(e) => setNewTotalSpaces(Number(e.target.value))}
                className="border border-gray-300 rounded-lg p-2"
              />
              <button
                onClick={updateTotalSpaces}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit Total Spaces
            </button>
          )}
        </div>
      )}

      {/* Parking Grid */}
      <div className="flex flex-col items-center justify-center mt-8 space-y-4">
        <div className={`grid grid-cols-4 gap-0`}>
          {[...Array(totalSpaces)].map((_, index) => (
            <div
              key={index}
              className="border-dashed border-gray-300 border-x-2 border-grey-800 w-36 h-36 flex items-center justify-center"
            >
              <Image
                src={index < carCount ? "/Car.png" : "/free_space.png"}
                alt={index < carCount ? "Occupied" : "Free"}
                width={80}
                height={80}
                className={
                  index < carCount
                    ? "object-contain"
                    : "w-2/3 h-3/4 md:w-3/5 md:h-5/6 m-auto object-contain"
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <div className="w-full md:w-[50%] flex justify-center md:justify-end text-sm md:text-lg space-x-3">
          <div className="flex items-center space-x-2">
            <Image
              src="/Car.png"
              alt="Car"
              width={40}
              height={40}
              className="w-8 h-8 md:w-10 md:h-10"
            />
            <span className="font-medium text-gray-700">: Busy</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#BAD0FD] rounded-lg border border-gray-500"></div>
            <span className="font-medium text-gray-700">: Free</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-5 mb-32">
        <Link
          href="/user"
          className="w-72 sm:w-96 h-10 sm:h-12 p-2 text-center bg-[#1E3A8A] text-white font-semibold text-base md:text-lg rounded-xl shadow-xl hover:bg-blue-500"
        >
          Access the parking area
        </Link>
      </div>
    </>
  );
}

Parking_space.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
}
