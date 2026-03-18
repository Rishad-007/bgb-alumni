import Link from "next/link";

const footerLinks = [
  { href: "#stats", label: "Stats" },
  { href: "#alumni", label: "Alumni" },
  { href: "#community", label: "Community" },
];

export function LandingFooter() {
  return (
    <footer id="contact" className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="text-base font-semibold text-slate-900">
            Border Guard Public School and College Alumni
          </p>
          <p className="mt-2 text-sm text-slate-600">Dhaka, Bangladesh</p>
          <p className="text-sm text-slate-600">Email: alumni@bgpsc.edu</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          {footerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors duration-200 hover:text-blue-700"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/register"
            className="rounded-full border border-slate-300 px-4 py-1.5 font-medium text-slate-700 transition-colors duration-200 hover:border-blue-600 hover:text-blue-700"
          >
            Register
          </Link>
        </div>
      </div>
    </footer>
  );
}
