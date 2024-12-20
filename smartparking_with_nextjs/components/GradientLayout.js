import Footer from "./footer";
import Navbar from "./navbar";

export default function GradientLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#60A5FA] to-[#93C5FD] flex flex-col">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
