import { db } from "@/firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";

export const getUserByUsername = async (username) => {
  try {
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty
      ? null
      : {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data(),
        };
  } catch (error) {
    console.error("Error getting user by username:", error);
    throw error;
  }
};

export const getParkingLogsByUser = async (userId) => {
  try {
    const q = query(
      collection(db, "parkingLogs"),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting parking logs:", error);
    throw error;
  }
};
