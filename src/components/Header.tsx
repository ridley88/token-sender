"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaGithub } from "react-icons/fa";
import Image from "next/image";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 shadow-md bg-red-500 border-2">
      <div className="flex items-center space-x-4">
        <Image src="/globe.svg" alt="Logo" width={32} height={32} />
        <h1 className="text-xl font-semibold">Token Sender App</h1>
      </div>
      <div className="flex items-center space-x-4">
        <a
          href="https://github.com/nmurry/TSender"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-black transition"
        >
          <FaGithub size={24} />
        </a>
        <ConnectButton />
      </div>
    </header>
  );
}
