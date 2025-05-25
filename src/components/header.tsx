import { Link } from "react-router-dom";
// import MavsLogo from "../assets/dallas-mavericks-1-removebg-preview.png";
import Countdown from "./countdown";

export default function Header() {
  return (
    <header className="relative bg-gradient-to-r from-[#0C2340] to-[#1A365D] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="relative flex-shrink-0">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              2025 NBA Draft
              <span className="block text-[#00A3E0] bg-clip-text text-transparent bg-gradient-to-r from-[#00A3E0] to-[#A0AEC0]">
                Big Board
              </span>
            </h1>
            <span className="absolute left-0 -bottom-1 w-full h-1 bg-gradient-to-r from-[#00538C] to-[#B8C4CA] rounded-md animate-pulse"></span>
          </Link>

          <div className="flex items-center gap-8">
            <Countdown targetDate="2025-06-26T19:00:00Z" />
            <Link to="/">
              <img
                src="https://i.imgur.com/5Y4rVgD.png"
                alt="Dallas Mavericks Logo"
                className="h-20 sm:h-24 md:h-28 lg:h-32 object-contain"
              />
            </Link>
          </div>
        </div>
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-[#00A3E0] via-[#00D9FF] to-[#A0AEC0]"></div>
    </header>
  );
}
