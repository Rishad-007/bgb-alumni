"use client";

import Link from "next/link";

export function Hero() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          School Alumni Network
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 mb-12">
          Connect with your classmates, share memories, and stay in touch with
          your school community.
        </p>
        <Link
          href="/register"
          className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
