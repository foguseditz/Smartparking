import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

async function initializeRoles() {
  const rolesRef = collection(db, "roles");
  const defaultRoles = [
    { id: "1", roleName: "admin" },
    { id: "2", roleName: "user" },
  ];

  for (const role of defaultRoles) {
    await setDoc(doc(rolesRef, role.id), {
      roleName: role.roleName,
    });
  }
}

async function initializeParkingSpaces() { 
  const parkingSpacesRef = collection(db, "parkingSpaces");
  const defaultParkingSpace = {
    id: "1",
    boardIpAddress: "192.168.1.1",
    sensorParkingCapacity: 100,
  };

  await setDoc(doc(parkingSpacesRef, defaultParkingSpace.id), {
    boardIpAddress: defaultParkingSpace.boardIpAddress,
    sensorParkingCapacity: defaultParkingSpace.sensorParkingCapacity,
  });
}

export async function initializeFirestore() {
  try {
    console.log("Starting Firestore initialization...");
    await initializeRoles();
    await initializeParkingSpaces();
    console.log("Firestore initialization completed successfully");
  } catch (error) {
    console.error("Error initializing Firestore:", error);
    throw error;
  }
}
