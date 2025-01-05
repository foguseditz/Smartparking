import Layout from "@/components/layout";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function EditParking() {
  const [parkingRate, setParkingRate] = useState(20);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [newRate, setNewRate] = useState(parkingRate);
  const [parkingSlot, setParkingSlot] = useState(8);
  const [isEditingSlot, setIsEditingSlot] = useState(false);
  const [newSlot, setNewSlot] = useState(parkingSlot);

  const handleRateChange = () => {
    setParkingRate(Number(newRate));
    setIsEditingRate(false);
  };

  const handleSlotChange = () => {
    setParkingSlot(Number(newSlot));
    setIsEditingSlot(false);
  };
  // แยก array ตามแถว
  const topRowOccupied = [2, 4]; // รถในแถวบน
  const bottomRowOccupied = [6, 5]; // รถในแถวล่าง

  return (
    <>
      <Head>
        <title>Edit Parking - Smart Parking</title>
      </Head>
      
      <div className="container mx-auto px-4">
        <div className="text-center my-10">
          <h1 className="text-3xl max-md:text-2xl font-bold text-[#333333]">
            Parking Space
          </h1>
        </div>

        {/* Parking Grid */}
        {/* First Row */}
        <div className="flex flex-col items-center justify-center mt-8 space-y-0 max-md:5">
          <div className="grid grid-cols-4 gap-0">
            {[1, 2, 3, 4].map((space) => (
              <div
                key={`top-${space}`}
                className="border border-t-0 border-dashed border-gray-500 sm:w-36 sm:h-36 md:w-40 md:h-40 flex items-center justify-center"
              >
                <img
                  src={
                    topRowOccupied.includes(space)
                      ? "/Car.png"
                      : "/free_space.png"
                  }
                  alt={topRowOccupied.includes(space) ? "Car" : "Free Space"}
                  className={
                    topRowOccupied.includes(space)
                      ? "w-32 h-36 md:w-36 md:h-40 m-auto"
                      : "w-2/3 h-3/4 md:w-3/5 md:h-5/6 m-auto"
                  }
                />
              </div>
            ))}
          </div>
          {/* Second Row */}
          <div className="grid grid-cols-4 gap-0">
            {[5, 6, 7, 8].map((space) => (
              <div
                key={`bottom-${space}`}
                className="border border-b-0 border-dashed border-gray-500 sm:w-36 sm:h-36 md:w-40 md:h-40 flex items-center justify-center"
              >
                <img
                  src={
                    bottomRowOccupied.includes(space)
                      ? "/Car.png"
                      : "/free_space.png"
                  }
                  alt={bottomRowOccupied.includes(space) ? "Car" : "Free Space"}
                  className={
                    bottomRowOccupied.includes(space)
                      ? "w-32 h-36 md:w-36 md:h-40 m-auto"
                      : "w-2/3 h-3/4 md:w-3/5 md:h-5/6 m-auto"
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Parking Management */}
        <div className="flex flex-col items-center mt-8 mb-4 px-4 sm:px-8 lg:px-16">
          {/* Parking Rate Management */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-md w-full max-w-md sm:max-w-lg lg:max-w-xl mb-6">
            <h2 className="text-xl font-semibold mb-4 text-center sm:text-left">
              Parking Rate Management
            </h2>
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
              <span className="text-gray-700">Parking Rate:</span>
              {isEditingRate ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="w-full sm:w-20 px-2 py-1 border rounded"
                    min="0"
                  />
                  <button
                    onClick={handleRateChange}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingRate(false)}
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="bg-gray-200 px-3 py-1 rounded">
                    {parkingRate}
                  </span>
                  <span>Baht/Hour</span>
                  <button
                    onClick={() => setIsEditingRate(true)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Parking Slot Management */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-md w-full max-w-md sm:max-w-lg lg:max-w-xl">
            <h2 className="text-xl font-semibold mb-4 text-center sm:text-left">
              Parking Slot Management
            </h2>
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
              <span className="text-gray-700">Number of Slots:</span>
              {isEditingSlot ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={newSlot}
                    onChange={(e) => {
                      const value = Math.min(
                        Math.max(Number(e.target.value), 1),
                        8
                      );
                      setNewSlot(value);
                    }}
                    className="w-full sm:w-20 px-2 py-1 border rounded"
                    min="1"
                    max="8"
                  />
                  <button
                    onClick={handleSlotChange}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingSlot(false)}
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="bg-gray-200 px-3 py-1 rounded">
                    {parkingSlot}
                  </span>
                  <span>Slots</span>
                  <button
                    onClick={() => setIsEditingSlot(true)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

EditParking.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
