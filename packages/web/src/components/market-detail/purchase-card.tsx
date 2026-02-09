import { useState, useEffect, useRef } from "react"
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { parseUnits, formatUnits } from "viem"
import { base } from "wagmi/chains"
import type { MarketListing } from "./types"
import { ConnectWalletModal } from "../wallet/connect-wallet-modal"
import { erc20Abi } from "../wallet/types"
import { createApiClient } from "@/lib/api"
import { aiccTokenAddress } from "@/lib/constants"

const api = createApiClient()

// Extended ERC20 ABI with transfer function
const erc20TransferAbi = [
  ...erc20Abi,
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  }
] as const

type PurchaseStep = "idle" | "confirming" | "pending" | "success" | "error"

interface PurchaseCardProps {
  listing: MarketListing
}

export function PurchaseCard({ listing }: PurchaseCardProps) {
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const orderCreatedRef = useRef(false)

  // Query client for cache invalidation
  const queryClient = useQueryClient()

  // Check if user has already purchased this listing
  const { data: purchaseStatus, refetch: refetchPurchaseStatus } = useQuery({
    queryKey: ["purchase-status", listing.id],
    queryFn: () => api.checkPurchase(listing.id),
    staleTime: 30000, // Cache for 30 seconds
  })

  const hasPurchased = purchaseStatus?.purchased ?? false

  // Wagmi hooks
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors, isPending: isConnectPending } = useConnect()

  // Creator's wallet address for C2C payment (from listing data)
  const creatorWalletAddress = listing.creator?.walletAddress as `0x${string}` | undefined

  // Get AICC token balance
  const { data: aiccBalance } = useReadContract({
    address: aiccTokenAddress,
    abi: erc20TransferAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!aiccTokenAddress && !!address
    }
  })

  const { data: aiccDecimals } = useReadContract({
    address: aiccTokenAddress,
    abi: erc20TransferAbi,
    functionName: "decimals",
    chainId: base.id,
    query: {
      enabled: !!aiccTokenAddress
    }
  })

  // Write contract hook for transfer
  const { writeContract, data: txHash, isPending: isWritePending, error: writeError } = useWriteContract()

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const priceAicc = Number(listing.priceAicc)
  const priceUsd = priceAicc * 2.756 // Example conversion rate
  const decimals = aiccDecimals ?? 18
  const balance = aiccBalance ? Number(formatUnits(aiccBalance, decimals)) : 0
  const hasEnoughBalance = balance >= priceAicc

  const handleConnect = (connector: (typeof connectors)[number]) => {
    connect(
      { connector },
      {
        onSuccess: () => {
          setShowConnectModal(false)
        },
        onError: (error) => {
          console.error("Failed to connect wallet:", error)
        }
      }
    )
  }

  const handleBuyNow = async () => {
    // Check if wallet is connected
    if (!isConnected) {
      setShowConnectModal(true)
      return
    }

    // Check if AICC token address is configured
    if (!aiccTokenAddress) {
      setErrorMessage("AICC token address not configured")
      setPurchaseStep("error")
      return
    }

    // Check if creator wallet address is available (C2C payment)
    if (!creatorWalletAddress) {
      setErrorMessage("Creator wallet address not available. The creator has not set up their wallet for receiving payments.")
      setPurchaseStep("error")
      return
    }

    // Check balance
    if (!hasEnoughBalance) {
      setErrorMessage(`Insufficient AICC balance. You need ${priceAicc.toFixed(2)} AICC but have ${balance.toFixed(2)} AICC`)
      setPurchaseStep("error")
      return
    }

    try {
      setPurchaseStep("confirming")
      setErrorMessage(null)

      // Convert price to token units
      const amountInUnits = parseUnits(priceAicc.toString(), decimals)

      // Execute transfer directly to creator's wallet (C2C payment)
      writeContract({
        address: aiccTokenAddress,
        abi: erc20TransferAbi,
        functionName: "transfer",
        args: [creatorWalletAddress, amountInUnits],
        chainId: base.id,
      })
    } catch (err) {
      console.error("Purchase error:", err)
      setErrorMessage(err instanceof Error ? err.message : "Failed to initiate purchase")
      setPurchaseStep("error")
    }
  }

  // Create order after transaction is confirmed and refresh page
  useEffect(() => {
    const createOrder = async () => {
      if (isConfirmed && txHash && !orderCreatedRef.current) {
        orderCreatedRef.current = true
        try {
          const response = await api.createOrder({
            publishRecordId: listing.id,
            txHash: txHash,
            licenseType: listing.licenseType as "standard" | "extended" | "exclusive"
          })
          setOrderId(response.order.id)
          // Update order status to confirmed
          await api.updateOrder(response.order.id, {
            status: "confirmed",
            txHash: txHash
          })
          // Invalidate queries and refetch purchase status to show Download button
          await queryClient.invalidateQueries({ queryKey: ["purchase-status", listing.id] })
          await refetchPurchaseStatus()
        } catch (err) {
          console.error("Failed to create order:", err)
          // Don't show error to user since payment was successful
        }
      }
    }
    createOrder()
  }, [isConfirmed, txHash, listing.id, listing.licenseType, queryClient, refetchPurchaseStatus])

  // Update step based on transaction state
  if (isWritePending && purchaseStep === "confirming") {
    // Still waiting for user to confirm in wallet
  } else if (txHash && isConfirming && purchaseStep !== "pending") {
    setPurchaseStep("pending")
  } else if (isConfirmed && purchaseStep !== "success") {
    setPurchaseStep("success")
  } else if (writeError && purchaseStep !== "error") {
    setErrorMessage(writeError.message)
    setPurchaseStep("error")
  }

  // Handle download action
  const handleDownload = () => {
    // For now, open the image URL in a new tab
    // In a real implementation, this would download the full asset package
    if (listing.imageUrl) {
      window.open(listing.imageUrl, "_blank")
    }
  }

  const getButtonContent = () => {
    // If already purchased, show Download button
    if (hasPurchased) {
      return (
        <>
          <span className="material-symbols-outlined text-lg">download</span>
          <span>Download</span>
        </>
      )
    }

    switch (purchaseStep) {
      case "confirming":
        return (
          <>
            <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            <span>Confirm in Wallet...</span>
          </>
        )
      case "pending":
        return (
          <>
            <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            <span>Processing...</span>
          </>
        )
      case "success":
        return (
          <>
            <span className="material-symbols-outlined text-lg">check_circle</span>
            <span>Purchase Complete!</span>
          </>
        )
      case "error":
        return "Try Again"
      default:
        return isConnected ? "Buy Now" : "Connect Wallet to Buy"
    }
  }

  const isButtonDisabled = !hasPurchased && (purchaseStep === "confirming" || purchaseStep === "pending" || purchaseStep === "success")

  return (
    <div className="p-4 border-b border-border bg-muted/30">
      {/* Connect Wallet Modal */}
      {showConnectModal && (
        <ConnectWalletModal
          connectors={connectors}
          isConnectPending={isConnectPending}
          isConnecting={isConnecting}
          onConnect={handleConnect}
          onClose={() => setShowConnectModal(false)}
        />
      )}

      <div className="bg-card/40 rounded-xl p-4 border border-border/50 space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
            {listing.isPremium ? "Premium Assets" : "Creative Asset"}
          </span>
          <h1 className="text-lg font-bold text-foreground leading-tight">{listing.title}</h1>
        </div>

        <div className="flex items-end justify-between py-2 border-y border-border/50">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Current Price</p>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-lg">database</span>
              <span className="text-2xl font-black text-foreground">
                {priceAicc.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-muted-foreground">AICC</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {/* Error Message */}
          {purchaseStep === "error" && errorMessage && (
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-500">{errorMessage}</p>
            </div>
          )}

          {/* Success Message */}
          {purchaseStep === "success" && txHash && (
            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-xs text-green-500">
                Transaction confirmed!{" "}
                <a
                  href={`https://basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  View on BaseScan
                </a>
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={hasPurchased ? handleDownload : handleBuyNow}
            disabled={isButtonDisabled}
            className={`w-full font-bold py-3 rounded-lg shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
              hasPurchased
                ? "bg-green-500 hover:bg-green-600 text-white shadow-green-500/20"
                : purchaseStep === "success"
                  ? "bg-green-500 text-white shadow-green-500/20"
                  : purchaseStep === "error"
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {getButtonContent()}
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">verified</span>
            Certified Creator
          </span>
          <span>5.0% Royalty</span>
        </div>
      </div>
    </div>
  )
}
