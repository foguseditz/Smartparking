import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col ">
      <Navbar />
      <div className="flex-grow">
        {children}
      </div>
      <Footer /> {/* ให้ footer อยู่ในตำแหน่งท้ายสุด */}
    </div>
  );
}
