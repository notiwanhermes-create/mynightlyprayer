import CheckoutForm from "./CheckoutForm";
import Navbar from "../components/Navbar";

export default function CheckoutPage() {
  return (
    <>
      <div className="stars" aria-hidden="true" />
      <Navbar />
      <main style={{ position: "relative", zIndex: 1, minHeight: "100vh", paddingTop: 90, paddingBottom: 80 }}>
        <CheckoutForm />
      </main>
    </>
  );
}
