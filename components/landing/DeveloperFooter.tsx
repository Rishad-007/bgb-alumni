import Link from "next/link";

const developerLinks = [
  {
    label: "GitHub",
    href: "https://github.com/Rishad-007",
  },
  {
    label: "Facebook",
    href: "https://facebook.com/rishad.nur",
  },
];

export function DeveloperFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#020b1a]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:text-left sm:px-6 lg:px-8">
        <p className="text-sm text-slate-300">
          Developed by{" "}
          <span className="font-semibold text-white">
            Rishad Nur (ssc 2017){" "}
          </span>
        </p>

        <div className="flex items-center gap-3">
          {developerLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/20 px-4 py-1.5 text-sm font-medium text-slate-200 transition-colors duration-200 hover:border-cyan-300 hover:text-cyan-300"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
