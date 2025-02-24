import Layout from "@/components/layout";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { db } from "./firebase/config";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore"; // นำเข้า updateDoc, increment เพิ่มเติม
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import "@tensorflow/tfjs"; // ✅ โหลด TensorFlow.js ก่อน
import * as tmImage from "@teachablemachine/image";

export default function Payment() {
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

  const loadModel = async () => {
    if (modelRef.current) {
      console.log("⚠️ Disposing old model...");
      modelRef.current.dispose();
      modelRef.current = null;
      tf.engine().reset(); // (ถ้าจำเป็น)
    }

    const URL = `${window.location.origin}/my_model/`;
    const modelURL = `${URL}model.json`;
    const metadataURL = `${URL}metadata.json`;

    try {
      console.log("Loading model from:", modelURL);
      modelRef.current = await tmImage.load(modelURL, metadataURL);
      setIsModelLoaded(true);
      console.log("Model loaded successfully");
    } catch (error) {
      console.error("Failed to load model:", error);
    }
  };

  useEffect(() => {
    loadModel(); // ✅ โหลดโมเดลให้ถูกต้อง

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
          logData.start_time
            ? new Date(logData.start_time.toMillis()).toLocaleString()
            : "N/A"
        );
        setCheckOutTime(
          logData.exit_time
            ? new Date(logData.exit_time.toMillis()).toLocaleString()
            : "N/A"
        );
        setTotalCost(logData.total_amount + " THB");
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);

      const reader = new FileReader();
      reader.readAsDataURL(uploadedFile); // แปลงเป็น Base64
      reader.onload = () => {
        localStorage.setItem("payment_slip", reader.result); // บันทึกใน Local Storage
      };

      setImagePreview(URL.createObjectURL(uploadedFile)); // แสดง Preview
    }
  };

  // ทำนายจากรูปภาพ
  const predictFromImage = async () => {
    if (!file || !modelRef.current) {
      alert("Please upload an image.");
      return false;
    }

    return new Promise((resolve) => {
      const imageElement = document.createElement("img");
      imageElement.src = URL.createObjectURL(file);
      imageElement.onload = async () => {
        const predictions = await modelRef.current.predict(imageElement);

        // ดึงค่าของ Class 1 และ Class 2
        const class1 = predictions.find((p) => p.className === "Class 1");
        const class2 = predictions.find((p) => p.className === "Class 2");

        if (class1 && class1.probability >= 0.7) {
          setPrediction(`Class 1 - ${class1.probability.toFixed(2)}`);
          resolve(true); // ✅ ผ่านการตรวจสอบ
        } else {
          setPrediction(`Its not look like slip `);
          resolve(false); // ❌ ไม่ผ่านการตรวจสอบ
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

    const user = JSON.parse(userData); // ✅ ดึง `uid` จาก localStorage
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
        headers: {
          uid: user.uid, // ✅ ส่ง `uid` ใน headers
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("File uploaded successfully:", data.filePath);
      setImagePreview(`http://localhost:5000${data.filePath}`); // ✅ แสดงภาพที่อัปโหลด
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed: " + error.message);
    }
  };

  const handlePaymentsFunctions = async (e) => {
    e.preventDefault(); // ป้องกัน Form Reload

    await handleUploadToServer(); // อัปโหลดไฟล์ก่อน
    await handlePaymentConfirmed(e); // ยืนยันการชำระเงิน
  };

  const handlePaymentConfirmed = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please attach the payment slip before confirming payment.");
      return;
    }

    // ตรวจสอบผล AI
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

      // บันทึกเวลาที่ชำระเงินสำเร็จ
      const paymentTimestamp = new Date();

      // อัปเดตเฉพาะฟิลด์ที่เกี่ยวข้องกับการชำระเงินใน parking_logs ของ user
      await setDoc(
        doc(db, "users", user.uid, "parking_logs", parklogId),
        {
          payment_status: true, // ยืนยันว่าชำระเงินแล้ว
          ai_prediction: prediction, // บันทึกผลการทำนาย AI ที่คำนวณได้จริง
          payment_timestamp: paymentTimestamp, // บันทึกเวลาในการชำระเงิน
        },
        { merge: true }
      );

      // ลดจำนวนรถที่จอดลง 1 ในเอกสาร /parking/parkingDocId
      const parkingDocId =
        localStorage.getItem("parking_doc_id") || "parkingDocId";
      await updateDoc(doc(db, "parking", parkingDocId), {
        carCount: increment(-1),
      });

      // ลบ key ใน localStorage ที่เกี่ยวข้องกับ parking log
      localStorage.removeItem("parklog_id");
      localStorage.removeItem("payment_slip");
      // (ถ้ามี key อื่นที่เกี่ยวข้อง สามารถลบเพิ่มได้)

      // รีเซ็ต state ใน UI (ถ้าต้องการ)
      setCheckInTime("N/A");
      setCheckOutTime("N/A");
      setTotalCost("0 THB");

      // แสดงสถานะการชำระเงินสำเร็จใน UI
      setShowAlert(true);

      // Redirect ไปหน้าหลักหลังจาก 2 วินาที
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("❌ Error confirming payment:", error);
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
            {showAlert ? "✅ Payment Confirmed" : ` ${prediction}`}
          </p>

          <div className="mt-8 flex justify-end">
            <button
              disabled={!isModelLoaded}
              onClick={(e) => handlePaymentsFunctions(e)}
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
