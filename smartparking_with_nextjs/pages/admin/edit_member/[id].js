import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/pages/firebase/config";
import Layout from "@/components/layout";
function EditMember() {
    const router = useRouter();
    const { id } = router.query; // ดึง ID จาก URL
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        role: "",
    });

    // ดึงข้อมูลสมาชิกจาก Firestore
    useEffect(() => {
        if (id) {
            const fetchUserData = async () => {
                try {
                    const docRef = doc(db, "users", id); // อ้างอิงถึงเอกสารใน Firestore
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                        setFormData(docSnap.data()); // ตั้งค่าฟอร์ม
                    } else {
                        console.error("No such document!");
                    }
                } catch (error) {
                    console.error("Error fetching document:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchUserData();
        }
    }, [id]);

    // จัดการการเปลี่ยนแปลงในฟอร์ม
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // บันทึกข้อมูลกลับไปที่ Firestore
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const docRef = doc(db, "users", id);
            await updateDoc(docRef, formData);
            alert("User updated successfully!");
            router.push("/admin"); // เปลี่ยนเส้นทางกลับไปหน้าหลัก
        } catch (error) {
            console.error("Error updating document:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg font-medium text-gray-700">Loading...</p>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg font-medium text-red-500">User not found!</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Edit Member
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required />
                    </div>

                    {/* Username */}
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required />
                    </div>

                    {/* Role */}
                    <div>
                        <label
                            htmlFor="role"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Role
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Update Member
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

EditMember.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
  };
  
export default EditMember;
