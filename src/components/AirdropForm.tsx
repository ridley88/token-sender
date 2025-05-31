"use client"

import { useState, useMemo, useEffect} from 'react'
import {
    useChainId, 
    useWriteContract,
    useAccount,
    useWaitForTransactionReceipt,
    useReadContracts,
    useReadContract
} from "wagmi"
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants"
import { readContract, waitForTransactionReceipt } from "@wagmi/core"
import { useConfig } from "wagmi"
import { CgSpinner } from "react-icons/cg"
import { calculateTotal, formatTokenAmount } from "@/utils"
import { InputForm } from "./ui/InputField"
// import { Tabs, TabsList, TabsTrigger } from "./ui/Tabs"

export default function AirdropForm() {
    const [tokenAddress, setTokenAddress] = useState("")
    const [recipients, setRecipients] = useState("")
    const [amounts, setAmounts] = useState("")
    const config = useConfig()
    const account = useAccount()
    const chainId = useChainId()

    const { data: tokenData } = useReadContracts({
        contracts: [
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "decimals",
            },
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "name",
            },
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "balanceOf",
                args: [account.address],
            },
        ],
    })
    const [hasEnoughTokens, setHasEnoughTokens] = useState(true)

    const { data: hash, isPending, error: writeError, writeContractAsync } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed, isError} = useWaitForTransactionReceipt({
        confirmations: 1,
        hash,
    })
    const total: number = useMemo(() => calculateTotal(amounts), [amounts])

    async function handleSubmit() {
        
        const tSenderAddress = chainsToTSender[chainId]["tsender"]
        const result = await getApprovedAmount(tSenderAddress)

        if(result < total) {

            const approvalHash = await writeContractAsync({
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "approve",
                args: [tSenderAddress as `0x${string}`, BigInt(total)],
            })

            const approvalReceipt = await waitForTransactionReceipt(config, {
                hash: approvalHash,
            })

            console.log("Approval confirmed:", approvalReceipt)

            await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],

            })
        } else {
            await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],
            },)
        }
    }
    async function getApprovedAmount(tSenderAddress: string | null): Promise<number> {
       
        const response = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "allowance",
            args: [account.address, tSenderAddress as `0x${string}`]
        })
        return response as number
    }

    function getButtonContent() {
        if(isPending) 
            return(
                <div className="flex items-center justify-center gap-2 w-full">
                    <CgSpinner className="animate-spin" size={20} />
                    <span>Confirming in wallet...</span>
                </div>
            )
        if(isConfirming)
            return(
                <div className="flex items-center justify-center gap-2 w-full">
                    <CgSpinner className="animate-spin" size={20} />
                    <span>Waiting for transaction to be included...</span>
                </div>
            )
        if( writeError || isError ) {
            console.log(writeError)
             return(
                <div className="flex items-center justify-center gap-2 w-full">
                    <span>Error, please see the console.</span>
                </div>
            )
        }  
        if(isConfirmed) {
            return "Transaction confirmed."
        }
            return "Send Tokens"
    }

    /////////////////////
    //// Use Effects ////
    /////////////////////

    // So that useState values persist
    useEffect(() => {
        const savedTokenAddress = localStorage.getItem('tokenAddress')
        const savedRecipients = localStorage.getItem('recipients')
        const savedAmounts = localStorage.getItem('amounts')

        if(savedTokenAddress) setTokenAddress(savedTokenAddress)
        if(savedRecipients) setRecipients(savedRecipients)
        if(savedAmounts) setAmounts(savedAmounts)
    }, []) 
    useEffect(() => {
        localStorage.setItem('tokenAddress', tokenAddress)
    },[tokenAddress])
    useEffect(() => {
        localStorage.setItem('recipients', recipients)
    }, [recipients])
    useEffect(() => {
        localStorage.setItem('amounts', amounts)
    }, [amounts])

    // Checking if sending address has the tokens, 
    useEffect(() => {
        if( tokenAddress && total > 0 && tokenData?.[2]?.result as number !== undefined) {
            const userBalance = tokenData?.[2].result as number;
            setHasEnoughTokens(userBalance >= total);
        } else {
            setHasEnoughTokens(true);
        }
    }, [tokenAddress, total, tokenData])

    ///////////////////////
    //// local storage ////
    ///////////////////////

    function getAllLocalStorageEntries(): [string, string][] {
        const entries: [string, string][] = []

        for(let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if(key !== null) {
                entries.push([key, localStorage.getItem(key) as string])
            }
        }

        return entries;
    }

    function practice() {
        console.log(getAllLocalStorageEntries())
    }

    return(
    <div className={`max-w-2xl min-w-full xl:min-w-lg w-full lg:mx-auto p-6 flex flex-col gap-6 bg-white rounded-xl shadow-xl ring-[4px] border-2 mt-3`}>
        <h2 className="text-xl font-semibold text-zinc-900">Please enter the transaction details</h2>

        <div className="space-y-6">
            <InputForm
                label="Token Address"
                placeholder="0x"
                value={tokenAddress}
                onChange={e => setTokenAddress(e.target.value)}
            />
            <InputForm
                label="Recipients (comma or new line separated)"
                placeholder="0x123..., 0x456..."
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
                large={true}
            />
            <InputForm
                    label="Amounts (wei; comma or new line separated)"
                    placeholder="100, 200, 300..."
                    value={amounts}
                    onChange={e => setAmounts(e.target.value)}
                    large={true}
            />       
        </div> {/* End of Input Fields */}

        <div className="bg-white border border-zinc-300 rounded-1g text-zinc-900 shadow-xl p-4">
            <h3 className="text-sm font-medium text-zinc-900 mb-3 border-b-2">Transaction Details</h3>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span>Token Name:</span>
                    <span>{tokenData?.[1]?.result as string}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span>Amount in WEI:  </span>
                    <span>{total}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span>Amount in Tokens:</span>
                    <span>{formatTokenAmount(total, tokenData?.[0]?.result as number)}</span>
                </div>
            </div>
        </div> {/* End of Transaction details*/} 

        <button className="mt-4 ml-4 px-6 py-3 bg-purple-600
                     hover:bg-purple-900 text-white font-medium
                     rounded-lg shadow-md hover:shadow-lg transition-all
                    duration-300 transform hover:scale-105 focus:outline-none
                    focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
                     active:bg-purple-800" onClick={handleSubmit} disabled={isPending || (!hasEnoughTokens && tokenAddress !== "")}>
            
                {isPending || writeError || isConfirming
                    ? getButtonContent()
                    : !hasEnoughTokens && tokenAddress ? "Insufficient Token Balance"
                    : "Send Tokens"
                }   
        </button>
        <button className="mt-4 ml-4 px-6 py-3 bg-orange-600
                     hover:bg-orange-900 text-white font-medium
                     rounded-lg shadow-md hover:shadow-lg transition-all
                    duration-300 transform hover:scale-105 focus:outline-none
                    focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50
                     active:bg-orange-800" onClick={practice}>
            Log All Local Storage
        </button>

    </div> // End of Component
)

}



