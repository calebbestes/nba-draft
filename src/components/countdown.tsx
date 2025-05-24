import { useEffect, useState } from "react";

interface CountdownProps {
  targetDate: string;
}
export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(targetDate);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Draft time!");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${days}d ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
          seconds
        ).padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="text-center">
      <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#00A3E0] tracking-widest font-mono drop-shadow-lg">
        {timeLeft}
      </span>
      <div className="text-sm sm:text-base text-[#B8C4CA] mt-1 uppercase tracking-wide">
        Until Draft Night
      </div>
    </div>
  );
}
