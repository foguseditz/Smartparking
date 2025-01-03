import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "@/pages/firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export default function withPublicRoute(Component) {
  return function WithPublicRoute(props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          // ถ้ามีการล็อกอินแล้ว redirect ไปที่หน้าหลัก
          router.replace("/");
        } else {
          setLoading(false);
        }
      });

      return () => unsubscribe();
    }, [router]);

    if (loading) {
      // คุณสามารถแสดง loading component ที่นี่
      return <div>Loading...</div>;
    }

    return <Component {...props} />;
  };
}
