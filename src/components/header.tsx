import { Link } from "react-router-dom";
import MavsLogo from "../assets/dallas-mavericks-1-removebg-preview.png";
import Countdown from "./countdown";
export default function Header() {
  return (
    <header className="relative flex flex-wrap items-center justify-between px-6 py-4 bg-gradient-to-r from-[#E0E0E0] via-[#F8F8F8] to-[#D0D0D0] text-[#0C2340] shadow-md border-b border-gray-300">
      <Link
        to="/"
        className="text-center sm:text-left relative w-full sm:w-auto max-w-2xl"
      >
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
          2025 NBA Draft
          <span className="block text-[#00A3E0] bg-clip-text text-transparent bg-gradient-to-r from-[#00A3E0] to-[#A0AEC0]">
            Big Board
          </span>
        </h1>
        <span className="absolute left-0 -bottom-1 w-full h-1 bg-gradient-to-r from-[#00538C] to-[#B8C4CA] rounded-md animate-pulse"></span>
      </Link>
      <div className="mt-2">
        <Countdown targetDate="2025-06-26T19:00:00Z" />
      </div>

      <Link to="/">
        <img
          src={MavsLogo}
          alt="Dallas Mavericks Logo"
          className="h-20 sm:h-24 md:h-28 lg:h-32 object-contain"
        />
      </Link>
    </header>
  );
}
