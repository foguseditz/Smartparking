import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function Layout({ children }) {
  return (
    <div className="page-container">
      <Navbar/>
      <main className="content">{children}</main>
      <Footer />
    </div>
  );
}
