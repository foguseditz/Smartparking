import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/config";
import Layout from "@/components/layout";
import Head from "next/head";

export default function EditMember() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const checkAdminAndFetchData = async (user) => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists() || userDoc.data().role !== "admin") {
          router.push("/");
          return;
        }

        fetchMembers();
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkAdminAndFetchData(user);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchMembers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const memberData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMembers(memberData);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    router.push(`/admin/edit_member/${id}`);
  };

  const handleDelete = async (id) => {
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Invalid document ID:", id);
      return;
    }

    // Confirmation
    if (!confirm("Are you sure you want to delete this member?")) {
      return;
    }

    try {
      const db = getFirestore();

      // 1. Get user document first to retrieve email
      const userDoc = await getDoc(doc(db, "users", id));
      if (!userDoc.exists()) {
        throw new Error("User document not found");
      }

      const userData = userDoc.data();
      const userEmail = userData.email;

      // 2. Delete from Firestore first
      await deleteDoc(doc(db, "users", id));
      console.log("Member deleted from Firestore:", id);

      // 3. Delete related data (e.g., reservations)
      const reservationsSnapshot = await getDocs(
        query(collection(db, "reservation"), where("userId", "==", id))
      );

      const deletePromises = reservationsSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
      console.log("Related reservations deleted");

      // 4. Delete from Authentication using Cloud Function
      // Create a Cloud Function to handle Auth deletion
      const deleteAuthUser = httpsCallable(functions, "deleteAuthUser");
      await deleteAuthUser({ email: userEmail });
      console.log("User deleted from Auth");

      // 5. Show success message
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);

      // 6. Refresh member list
      await fetchMembers();
    } catch (error) {
      console.error("Error during deletion:", error);
      // Show error message to user
      alert(`Failed to delete member: ${error.message}`);
    }
  };

const handleTabChange = (event) => {
  const selectedTab = event.target.value;
  setActiveTab(selectedTab);
};

const filteredMembers = members.filter((member) => {
  if (activeTab === "all") return true;
  return member.role?.toLowerCase() === activeTab.toLowerCase();
});

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Members Management - Smart Parking</title>
      </Head>
      <div class="relative flex flex-col w-full h-full text-gray-700 bg-white shadow-md rounded-xl bg-clip-border mb-32">
        <div class="relative mx-4 mt-4 overflow-hidden text-gray-700 bg-white rounded-none bg-clip-border">
          <div class="flex items-center justify-between gap-8 mb-8">
            <div>
              <h5 class="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
                Members list
              </h5>
              <p class="block mt-1 font-sans text-base antialiased font-normal leading-relaxed text-gray-700">
                See information about all members
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="block w-full overflow-hidden md:w-1/4 lg:w-1/5">
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
                {filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {member.username || "N/A"}
                      </p>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {member.email || "N/A"}
                      </p>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          member.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : member.role === "user"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {member.role || "N/A"}
                      </span>
                    </td>

                    <td className="p-4 border-b border-blue-gray-50">
                      <button
                        className="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                        type="button"
                        onClick={handleEdit}
                      >
                        <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                            className="w-4 h-4"
                          >
                            <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                          </svg>
                        </span>
                      </button>
                      <button
                        className="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                        type="button"
                        onClick={() => handleDelete(member.id)}
                      >
                        <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                            className="w-4 h-4"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                              clipRule="evenodd"
                            />
                          </svg>
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
    </>
  );
}

EditMember.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
