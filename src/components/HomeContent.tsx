"use client"

import AirdropForm from "@/components/AirdropForm"
import { useAccount } from "wagmi"

export default function HomeContent() {
    const { isConnected } = useAccount()
    return(
        <div>
            {isConnected ? (
                <div>
                    <AirdropForm />
                </div>
            ):(
                <div>
                    <h2>Please connect a wallet... </h2>
                </div>
            )}
        </div>
    )
}