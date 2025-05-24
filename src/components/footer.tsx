export default function Footer() {
  return (
    <footer className="w-full mt-12 py-6 bg-[#001E3C] text-gray-300 text-sm text-center border-t border-[#002B5E]">
      <div className="max-w-7xl mx-auto px-4">
        <p>
          © {new Date().getFullYear()} Draft Hub. Built by Caleb Estes. All
          rights reserved.
        </p>
      </div>
    </footer>
  );
}
