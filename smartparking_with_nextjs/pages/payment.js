import Layout from "@/components/layout";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { db, storage } from "./firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";

export default function Payment() {
  const [showAlert, setShowAlert] = useState(false);
  const [file, setFile] = useState(null);
  const [checkInTime, setCheckInTime] = useState("...");
  const [checkOutTime, setCheckOutTime] = useState("...");
  const [totalCost, setTotalCost] = useState("...");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const userData = localStorage.getItem("user");
      const parklogId = localStorage.getItem("parklog_id");
      if (!userData || !parklogId) return;

      const user = JSON.parse(userData);
      const logDoc = await getDoc(
        doc(db, "users", user.uid, "parking_logs", parklogId)
      );

      if (logDoc.exists()) {
        const logData = logDoc.data();
        setCheckInTime(
          new Date(logData.start_time.toMillis()).toLocaleString()
        );
        setCheckOutTime(
          new Date(logData.exit_time.toMillis()).toLocaleString()
        );
        setTotalCost(logData.total_amount + " THB");
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (event) => setFile(event.target.files[0]);

  const handlePaymentConfirmed = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please attach the payment slip before confirming payment.");
      return;
    }

    try {
      const userData = localStorage.getItem("user");
      const parklogId = localStorage.getItem("parklog_id");
      if (!userData || !parklogId)
        throw new Error("User or parking log ID not found");

      const user = JSON.parse(userData);
      const fileRef = ref(storage, `payment_slips/${user.uid}_${Date.now()}`);
      await uploadBytes(fileRef, file);
      const fileURL = await getDownloadURL(fileRef);

      await setDoc(
        doc(db, "users", user.uid, "parking_logs", parklogId),
        {
          payment_slip: fileURL,
          payment_confirmed: true,
        },
        { merge: true }
      );

      setShowAlert(true);
    } catch (error) {
      console.error("Error uploading payment slip:", error);
      alert("Payment confirmation failed. Please try again.");
    }
  };

  return (
    <>
      <Head>
        <title>Payment - Smart Parking</title>
      </Head>
      <div className="container mx-auto px-4 mb-10">
        <div className="mt-10 mx-auto max-w-[350px] bg-[#BAD0FD] rounded-md shadow-lg max-sm:w-56">
          <div className="w-full p-3 flex justify-center">
            <Image
              src="/qrpayment.png"
              alt="QR Payment"
              width={300}
              height={90}
              className="max-sm:w-56 object-contain"
            />
          </div>
        </div>

        <div className="mt-10 mx-auto bg-[#D9D9D9] rounded-lg shadow-lg w-full max-w-4xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <p className="text-base sm:text-xl lg:text-2xl">
              <span className="font-semibold">Check-in Date/Time:</span>{" "}
              {checkInTime}
            </p>
            <p className="text-base sm:text-xl lg:text-2xl">
              <span className="font-semibold">Check-out Date/Time:</span>{" "}
              {checkOutTime}
            </p>
          </div>
          <p className="mt-6 text-base sm:text-xl lg:text-2xl">
            <span className="font-semibold">Total Cost:</span> {totalCost}
          </p>

          <div className="mt-6">
            <label className="block mb-2 text-sm font-medium">
              Attach Payment Slip:
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm border rounded-md cursor-pointer"
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handlePaymentConfirmed}
              className="bg-[#227c2f] px-6 sm:px-12 py-2.5 text-base sm:text-lg font-semibold text-white rounded-md hover:bg-[#559744] transition-colors duration-200"
            >
              Payment Confirmed
            </button>
          </div>
        </div>

        {showAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-auto">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Payment Successful!
                </h3>
                <div className="mt-4">
                  <Link
                    href="/parking_space"
                    className="bg-[#227c2f] px-8 py-2 text-sm font-semibold text-white rounded-md hover:bg-[#559744] transition-colors duration-200"
                  >
                    Okay
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

Payment.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
