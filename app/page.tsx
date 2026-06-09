import Navbar from "./components/Navbar";
import HomeClient from "./components/HomeClient";
import RevealOnScroll from "./components/RevealOnScroll";

export default function Home() {
  return (
    <>
      <div className="stars" aria-hidden="true" />
      <Navbar />
      <main style={{ position: "relative" }}>
        <RevealOnScroll />
        <HomeClient />
      </main>
    </>
  );
}
