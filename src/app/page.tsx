"use client"

import dynamic from "next/dynamic"

const HomeContent = dynamic(() => import("@/components/HomeContent"), {
  ssr: false,
})

import { useAccount } from "wagmi"

export default function Home() {

  return (
    <HomeContent />
  );
}
