import "@/styles/navbar.css";
import "@/styles/globals.css";
import "@/styles/footer.css";
import Layout from "@/components/layout";

export default function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}