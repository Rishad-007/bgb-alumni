import Link from "next/link";

const developerLinks = [
  {
    label: "GitHub",
    href: "https://github.com/Rishad-007",
    icon: GitHubIcon,
  },
  {
    label: "Facebook",
    href: "https://facebook.com/rishad.nur",
    icon: FacebookIcon,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/rishad.nur",
    icon: InstagramIcon,
  },
];

export function DeveloperFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-[#020b1a]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(34,211,238,0.1),transparent_35%),radial-gradient(circle_at_85%_100%,rgba(14,165,233,0.08),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center backdrop-blur-sm sm:flex-row sm:text-left">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/80">
              Crafted by
            </p>
            <p className="mt-1 text-sm text-slate-300">
              <span className="font-semibold text-white">Rishad Nur</span>
              <span className="mx-2 text-slate-500">|</span>
              <span>SSC 2017</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {developerLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.02] px-4 py-2 text-sm font-medium text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-200"
              >
                <item.icon />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="relative mt-3 text-center text-xs text-slate-500">
          A warm recall to "Rifels Public Shishu Niketon" Where it all began.
        </div>
      </div>
    </footer>
  );
}

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-slate-300 transition-colors duration-200 group-hover:text-cyan-200"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.41-4.04-1.41a3.18 3.18 0 0 0-1.34-1.76c-1.1-.75.08-.74.08-.74a2.52 2.52 0 0 1 1.84 1.24 2.56 2.56 0 0 0 3.5 1 2.58 2.58 0 0 1 .76-1.61c-2.67-.3-5.47-1.34-5.47-5.95a4.67 4.67 0 0 1 1.24-3.23 4.34 4.34 0 0 1 .12-3.18s1.01-.32 3.31 1.23a11.32 11.32 0 0 1 6.03 0c2.3-1.55 3.31-1.23 3.31-1.23.52 1.03.57 2.21.12 3.18a4.66 4.66 0 0 1 1.24 3.23c0 4.62-2.81 5.65-5.49 5.95a2.9 2.9 0 0 1 .82 2.24v3.32c0 .32.22.69.82.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-slate-300 transition-colors duration-200 group-hover:text-cyan-200"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.12 11.93V15.57H7.08v-3.5h3.04V9.41c0-3.03 1.79-4.71 4.54-4.71 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.28h3.33l-.53 3.5h-2.8V24C19.61 23.08 24 18.09 24 12.07Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-slate-300 transition-colors duration-200 group-hover:text-cyan-200"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5ZM12 7.3A4.7 4.7 0 1 1 7.3 12 4.7 4.7 0 0 1 12 7.3Zm0 1.8A2.9 2.9 0 1 0 14.9 12 2.9 2.9 0 0 0 12 9.1Zm5.02-2.4a1.08 1.08 0 1 1-1.08 1.08 1.08 1.08 0 0 1 1.08-1.08Z" />
    </svg>
  );
}
