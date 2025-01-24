import Layout from "@/components/layout";
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/pages/firebase/config";
import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import AddMemberPopup from "@/components/AddMemberPopup"; // นำเข้า AddMemberPopup

export default function Edit_Member() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showDeleteResultAlert, setShowDeleteResultAlert] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [showAddMemberPopup, setShowAddMemberPopup] = useState(false); // State สำหรับควบคุมการแสดงป้อปอัพเพิ่มสมาชิก
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      router.push("/auth/login");
      return;
    }

    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  const handleDeleteUser = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      await deleteDoc(userDocRef);
      setDeleteStatus("success");
      setShowDeleteResultAlert(true);
      setShowDeleteAlert(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      setDeleteStatus("error");
      setShowDeleteResultAlert(true);
      setShowDeleteAlert(false);
    }
  };

  const handleEditClick = (user) => {
    router.push(`/admin/edit_member/${user.id}`);
  };

  const handleTabChange = (event) => {
    const selectedTab = event.target.value;
    setActiveTab(selectedTab);
  };

  const handleAddMemberClick = () => {
    setShowAddMemberPopup(true); // แสดงป้อปอัพเพิ่มสมาชิก
  };

  const handleAddMemberSuccess = () => {
    router.reload(); // รีเฟรชหน้าหลังจากเพิ่มสมาชิกสำเร็จ
  };

  const filteredMembers = users.filter((user) => {
    if (activeTab === "all") return true;
    return user.role?.toLowerCase() === activeTab.toLowerCase();
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Members Management - Smart Parking</title>
      </Head>

      <div className="relative flex flex-col w-full h-full text-gray-700 bg-white shadow-md rounded-xl bg-clip-border mb-32">
        <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 bg-white rounded-none bg-clip-border">
          <div className="flex items-center justify-between gap-8 mb-8">
            <div>
              <h5 className="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
                Members list
              </h5>

              <p className="block mt-1 font-sans text-base antialiased font-normal leading-relaxed text-gray-700">
                See information about all members
              </p>
            </div>

            <div className="flex flex-col gap-2 shrink-0 sm:flex-row">
              <button
                className="flex select-none items-center gap-3 rounded-lg bg-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button"
                onClick={handleAddMemberClick} // เพิ่มการคลิกเพื่อแสดงป้อปอัพ
              >
                <Image
                  src="/add-member-icon.svg"
                  alt="Add Icon"
                  width={20}
                  height={20}
                  className="w-4 h-4"
                />
                Add member
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="block w-full overflow-hidden md:w-1/4 lg:w-1/5">
              <div className="mb-1">Filtered Members :</div>

              <nav>
                <select
                  value={activeTab}
                  onChange={handleTabChange}
                  className="w-full px-4 py-2 text-base font-medium text-gray-700 border border-gray-300 rounded-md shadow-sm transition duration-300 ease-in-out"
                >
                  {["all", "user", "admin"].map((tab) => (
                    <option key={tab} value={tab} className="text-gray-700">
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </option>
                  ))}
                </select>
              </nav>
            </div>
          </div>
        </div>

        <div className="p-6 px-0 overflow-scroll">
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <table className="w-full mt-4 text-left table-auto min-w-max">
              <thead>
                <tr>
                  <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      UserName
                    </p>
                  </th>

                  <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Email
                    </p>
                  </th>

                  <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Role
                    </p>
                  </th>

                  <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Action
                    </p>
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredMembers.map((user) => (
                  <tr key={user.id}>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {user.username || "N/A"}
                      </p>
                    </td>

                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {user.email || "N/A"}
                      </p>
                    </td>

                    <td className="p-4 border-b border-blue-gray-50">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          user.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : user.role === "user"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role || "N/A"}
                      </span>
                    </td>

                    <td className="p-4 border-b border-blue-gray-50">
                      <button
                        className="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                        type="button"
                        onClick={() => handleEditClick(user)}
                      >
                        <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                          <Image
                            src="/edit-icon.svg"
                            alt="Edit Icon"
                            width={20}
                            height={20}
                            className="w-4 h-4"
                          />
                        </span>
                      </button>

                      <button
                        className="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                        type="button"
                        onClick={() => {
                          setMemberToDelete(user.id);
                          setShowDeleteAlert(true);
                        }}
                      >
                        <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                          <Image
                            src="/delete-icon.svg"
                            alt="Delete Icon"
                            width={20}
                            height={20}
                            className="w-4 h-4"
                          />
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Custom Alert สำหรับการยืนยันการลบ */}
      {showDeleteAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Deletion
            </h3>

            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this member?
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  handleDeleteUser(memberToDelete);
                }}
                className="px-4 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition-colors"
              >
                Confirm
              </button>

              <button
                onClick={() => setShowDeleteAlert(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert สำหรับแสดงผลลัพธ์การลบ */}
      {showDeleteResultAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {deleteStatus === "success" ? "Success" : "Error"}
            </h3>

            <p className="text-gray-500 mb-6">
              {deleteStatus === "success"
                ? "User deleted successfully!"
                : "Failed to delete user. Please try again."}
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowDeleteResultAlert(false);
                  if (deleteStatus === "success") {
                    router.reload();
                  }
                }}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ป้อปอัพสำหรับเพิ่มสมาชิก */}
      {showAddMemberPopup && (
        <AddMemberPopup
          onClose={() => setShowAddMemberPopup(false)}
          onAddMemberSuccess={handleAddMemberSuccess}
        />
      )}
    </>
  );
}

Edit_Member.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
