import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  getDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/config";
import Layout from "@/components/layout";
import Head from "next/head";
import Image from "next/image";
import { getApp } from "firebase/app";

const app = getApp();  // Use the default Firebase app
const functions = getFunctions(app);  // Initialize the functions instance

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
    if (!id || typeof id !== "string") {
      console.error("Invalid document ID:", id);
      return;
    }
  
    if (!confirm("Are you sure you want to delete this member?")) {
      return;
    }
  
    try {
      const userDoc = await getDoc(doc(db, "users", id));
      if (!userDoc.exists()) {
        throw new Error("User document not found");
      }
  
      const userData = userDoc.data();
      const userEmail = userData.email;
  
      // Delete the user from Firestore
      await deleteDoc(doc(db, "users", id));
      console.log("Member deleted from Firestore:", id);
  
      // Call the Firebase function to delete the user from Authentication
      const deleteAuthUser = httpsCallable(functions, "deleteAuthUser");
      const result = await deleteAuthUser({ email: userEmail });
      console.log("User deleted from Auth:", result.data.message);  // Log result from function
  
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
  
      await fetchMembers();
    } catch (error) {
      console.error("Error during deletion:", error);
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
                        onClick={() => handleEdit(member.id)}
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
                        onClick={() => handleDelete(member.id)}
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
    </>
  );
}

EditMember.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
