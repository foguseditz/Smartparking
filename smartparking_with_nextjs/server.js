const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json()); // ✅ รองรับ JSON body

// 📌 ตั้งค่า Multer ให้เก็บไฟล์ตาม `uid` และเปลี่ยนชื่อไฟล์ให้สื่อถึงผู้ใช้
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uid = req.headers["uid"]; // ✅ ดึง `uid` จาก request headers
        if (!uid) {
            return cb(new Error("User ID (uid) is required"));
        }

        const userUploadDir = path.join(__dirname, "uploads", uid);
        if (!fs.existsSync(userUploadDir)) {
            fs.mkdirSync(userUploadDir, { recursive: true }); // ✅ สร้างโฟลเดอร์ถ้ายังไม่มี
        }

        cb(null, userUploadDir);
    },
    filename: (req, file, cb) => {
        const uid = req.headers["uid"]; // ✅ ใช้ `uid` ในชื่อไฟล์
        const timestamp = Date.now();
        const originalName = file.originalname.replace(/\s+/g, "_"); // ✅ ลบช่องว่างในชื่อไฟล์
        const newFileName = `${uid}_${timestamp}_${originalName}`; // ✅ ตั้งชื่อไฟล์ใหม่
        cb(null, newFileName);
    },
});

const upload = multer({ storage });

// 📌 API อัปโหลดไฟล์ พร้อมแยกโฟลเดอร์ตาม `uid` และเปลี่ยนชื่อไฟล์
app.post("/upload", upload.single("file"), (req, res) => {
    const uid = req.headers["uid"]; // ✅ ใช้ `uid` จาก headers
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const filePath = `/uploads/${uid}/${req.file.filename}`;
    res.json({ success: true, filePath });
});

// 📌 เปิดให้เข้าถึงไฟล์ที่อยู่ในโฟลเดอร์ของแต่ละ `uid`
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 📌 ตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่
app.get("/", (req, res) => {
    res.send("Server is running...");
});

// 📌 เริ่มรันเซิร์ฟเวอร์
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
