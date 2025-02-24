import Layout from "@/components/layout";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { db } from "./firebase/config";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { useRouter } from "next/router";

import * as tf from "@tensorflow/tfjs";
import * as tmImage from "@teachablemachine/image";

export default function Payment() {
  // --- State สำหรับ Popup แจ้งเตือน 2 กรณี ---
  const [missingData, setMissingData] = useState(false);
  const [missingDataMsg, setMissingDataMsg] = useState("");

  const [missingExit, setMissingExit] = useState(false);
  const [missingExitMsg, setMissingExitMsg] = useState("");

  // --- State ปกติ ---
  const [showAlert, setShowAlert] = useState(false);
  const [file, setFile] = useState(null);
  const [checkInTime, setCheckInTime] = useState("...");
  const [checkOutTime, setCheckOutTime] = useState("...");
  const [totalCost, setTotalCost] = useState("...");
  const [prediction, setPrediction] = useState("Didn't Confirm yet");
  const [imagePreview, setImagePreview] = useState(null);
  const router = useRouter();

  const modelRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  useEffect(() => {
    // ตรวจสอบ userData, parklogId
    const userData = localStorage.getItem("user");
    const parklogId = localStorage.getItem("parklog_id");

    if (!userData || !parklogId) {
      // กรณีไม่มี userData / parklogId
      setMissingData(true);
      setMissingDataMsg(
        "Please confirm your parking entrance before making a payment."
      );
      return;
    }

    // ถ้ามี => ลองไปดึงข้อมูลใน Firestore
    loadModel();

    const fetchData = async () => {
      try {
        const user = JSON.parse(userData);
        const docRef = doc(db, "users", user.uid, "parking_logs", parklogId);
        const logDoc = await getDoc(docRef);

        if (!logDoc.exists()) {
          // ถ้าไม่มี doc => ให้แจ้งเหมือนกรณีไม่มี user/parklog
          setMissingData(true);
          setMissingDataMsg(
            "Parking log not found. Please confirm your parking usage again."
          );
          return;
        }

        // ถ้ามี doc => ตรวจสอบ exit_time
        const logData = logDoc.data();
        if (!logData.exit_time) {
          // ยังไม่มี exit_time => ต้องสแกนออกก่อน
          setMissingExit(true);
          setMissingExitMsg(
            "Please confirm your exit from the parking area first."
          );
          return;
        }

        // ถ้าทุกอย่างพร้อม => แสดงหน้า Payment ปกติ
        setCheckInTime(
          logData.start_time
            ? new Date(logData.start_time.toMillis()).toLocaleString()
            : "N/A"
        );
        setCheckOutTime(
          logData.exit_time
            ? new Date(logData.exit_time.toMillis()).toLocaleString()
            : "N/A"
        );
        setTotalCost((logData.total_amount || 0) + " THB");
      } catch (error) {
        console.error("Error fetching parking log:", error);
      }
    };

    fetchData();

    // Cleanup model on unmount
    return () => {
      if (modelRef.current) {
        if (
          modelRef.current.model &&
          typeof modelRef.current.model.dispose === "function"
        ) {
          console.log("Disposing TF model inside Teachable Machine wrapper...");
          modelRef.current.model.dispose();
        }
        tf.disposeVariables();
        modelRef.current = null;
      }
    };
  }, []);

  const loadModel = async () => {
    try {
      if (modelRef.current) {
        console.log("Model already loaded. Skipping loadModel().");
        return;
      }

      const URL = `${window.location.origin}/my_model/`;
      const modelURL = `${URL}model.json`;
      const metadataURL = `${URL}metadata.json`;

      console.log("Loading model from:", modelURL);
      modelRef.current = await tmImage.load(modelURL, metadataURL);
      setIsModelLoaded(true);
      console.log("Model loaded successfully");
    } catch (error) {
      console.error("Failed to load model:", error);
    }
  };

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.readAsDataURL(uploadedFile);
      reader.onload = () => {
        localStorage.setItem("payment_slip", reader.result);
      };
      setImagePreview(URL.createObjectURL(uploadedFile));
    }
  };

  const predictFromImage = async () => {
    if (!file) {
      alert("Please upload an image.");
      return false;
    }
    if (!modelRef.current) {
      alert("Model is not loaded yet.");
      return false;
    }

    return new Promise((resolve) => {
      const imageElement = document.createElement("img");
      imageElement.src = URL.createObjectURL(file);
      imageElement.onload = async () => {
        const predictions = await modelRef.current.predict(imageElement);
        console.log("Predictions:", predictions);

        const class1 = predictions.find((p) => p.className === "Class 1");
        if (class1 && class1.probability >= 0.7) {
          setPrediction(`Class 1 - ${class1.probability.toFixed(2)}`);
          resolve(true);
        } else {
          setPrediction("It's not look like slip");
          resolve(false);
        }
      };
    });
  };

  const handleUploadToServer = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }
    const userData = localStorage.getItem("user");
    if (!userData) {
      alert("User not found. Please log in.");
      return;
    }
    const user = JSON.parse(userData);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
        headers: {
          uid: user.uid,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("File uploaded successfully:", data.filePath);
      setImagePreview(`http://localhost:5000${data.filePath}`);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed: " + error.message);
    }
  };

  const handlePaymentConfirmed = async () => {
    if (!file) {
      alert("Please attach the payment slip before confirming payment.");
      return;
    }

    const aiPass = await predictFromImage();
    if (!aiPass) {
      alert("Payment not confirmed, try with a new slip.");
      return;
    }

    try {
      const userData = localStorage.getItem("user");
      const parklogId = localStorage.getItem("parklog_id");
      if (!userData || !parklogId) {
        throw new Error("User or parking log ID not found.");
      }
      const user = JSON.parse(userData);

      const paymentTimestamp = new Date();

      await setDoc(
        doc(db, "users", user.uid, "parking_logs", parklogId),
        {
          payment_status: true,
          payment_timestamp: paymentTimestamp,
        },
        { merge: true }
      );

      const parkingDocId =
        localStorage.getItem("parking_doc_id") || "parkingDocId";
      await updateDoc(doc(db, "parking", parkingDocId), {
        carCount: increment(-1),
      });

      localStorage.removeItem("parklog_id");
      localStorage.removeItem("payment_slip");

      setCheckInTime("N/A");
      setCheckOutTime("N/A");
      setTotalCost("0 THB");
      setShowAlert(true);

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("❌ Error confirming payment:", error);
      alert("Payment confirmation failed. Please try again.");
    }
  };

  const handlePaymentsFunctions = async (e) => {
    e.preventDefault();
    await handleUploadToServer();
    await handlePaymentConfirmed();
  };
  // ----------------------------------------------------------------------------
  // JSX: ถ้า missingData => Popup #1
  // ----------------------------------------------------------------------------
  if (missingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notice</h3>
          <p className="text-gray-500 mb-4">{missingDataMsg}</p>
          <div className="flex justify-end">
            <button
              onClick={() => router.push("/parking_space")}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ถ้า missingExit => Popup #2
  if (missingExit) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notice</h3>
          <p className="text-gray-500 mb-4">{missingExitMsg}</p>
          <div className="flex justify-end">
            <button
              onClick={() => router.push("/status")}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // JSX: ปกติถ้าผ่านเงื่อนไขทั้งหมด
  // ----------------------------------------------------------------------------
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

          {imagePreview && (
            <div className="mt-4">
              <p className="font-semibold text-sm">Preview:</p>
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-xs rounded-md shadow-md"
              />
            </div>
          )}

          <p className="mt-4 text-lg font-semibold">
            {showAlert ? "✅ Payment Confirmed" : prediction}
          </p>

          <div className="mt-8 flex justify-end">
            <button
              disabled={!isModelLoaded}
              onClick={handlePaymentsFunctions}
              className="bg-green-600 px-6 py-2 text-white rounded-md"
            >
              {isModelLoaded ? "Payment Confirmed" : "Loading Model..."}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

Payment.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
