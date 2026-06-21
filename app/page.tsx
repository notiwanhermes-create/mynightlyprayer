import Navbar from "./components/Navbar";
import HomeClient from "./components/HomeClient";
import RevealOnScroll from "./components/RevealOnScroll";

export default function Home() {
  const smsPriceAvailable = !!process.env.STRIPE_SMS_PRICE_ID;

  return (
    <>
      <div className="stars" aria-hidden="true" />
      <Navbar dark />
      <main style={{ position: "relative" }}>
        <RevealOnScroll />
        <HomeClient smsPriceAvailable={smsPriceAvailable} />
      </main>
    </>
  );
}
