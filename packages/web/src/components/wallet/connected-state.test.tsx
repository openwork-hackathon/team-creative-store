import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConnectedState } from "./connected-state";
import type { WalletTx, Order } from "./types";

describe("ConnectedState", () => {
  const mockTransactions: WalletTx[] = [
    {
      id: "tx-1",
      type: "received",
      label: "Received AICC",
      hash: "0x1234...5678",
      amount: "100 AICC",
      direction: "in",
      status: "confirmed",
      createdAt: "2026-01-15T10:00:00Z"
    },
    {
      id: "tx-2",
      type: "purchase",
      label: "Creative Purchase",
      hash: "0xabcd...efgh",
      amount: "50 AICC",
      direction: "out",
      status: "pending",
      createdAt: "2026-01-14T10:00:00Z"
    }
  ];

  const mockOrders: Order[] = [
    {
      id: "order-1",
      orderNumber: "ORD-001",
      creativeTitle: "Summer Campaign Banner",
      imageUrl: "https://example.com/image.jpg",
      licenseType: "standard",
      priceAicc: "25",
      status: "confirmed",
      createdAt: "2026-01-15T10:00:00Z"
    },
    {
      id: "order-2",
      orderNumber: "ORD-002",
      creativeTitle: "Holiday Promo Video",
      licenseType: "extended",
      priceAicc: "75",
      status: "failed",
      statusMessage: "Insufficient funds",
      createdAt: "2026-01-14T10:00:00Z"
    }
  ];

  const defaultProps = {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    formattedBalance: "1.5 ETH",
    formattedAiccBalance: "500 AICC",
    transactions: mockTransactions,
    orders: mockOrders,
    onCopyAddress: vi.fn(),
    onDisconnect: vi.fn()
  };

  it("renders wallet overview with formatted address", () => {
    render(<ConnectedState {...defaultProps} />);

    expect(screen.getByText("Base Network Address")).toBeInTheDocument();
    // The formatted address appears in the wallet overview card
    // Note: "0x1234...5678" also appears as a transaction hash, so we use getAllByText
    const addressElements = screen.getAllByText("0x1234...5678");
    expect(addressElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders balance information", () => {
    render(<ConnectedState {...defaultProps} />);

    expect(screen.getByText("AICC Balance")).toBeInTheDocument();
    expect(screen.getByText("500 AICC")).toBeInTheDocument();
    expect(screen.getByText("Balance: 1.5 ETH")).toBeInTheDocument();
  });

  it("calls onCopyAddress when copy button is clicked", () => {
    const onCopyAddress = vi.fn();
    render(<ConnectedState {...defaultProps} onCopyAddress={onCopyAddress} />);

    fireEvent.click(screen.getByTitle("Copy address"));
    expect(onCopyAddress).toHaveBeenCalled();
  });

  it("calls onDisconnect when disconnect button is clicked", () => {
    const onDisconnect = vi.fn();
    render(<ConnectedState {...defaultProps} onDisconnect={onDisconnect} />);

    fireEvent.click(screen.getByTitle("Disconnect wallet"));
    expect(onDisconnect).toHaveBeenCalled();
  });

  it("renders transaction history table", () => {
    render(<ConnectedState {...defaultProps} />);

    expect(screen.getByText("Transaction History")).toBeInTheDocument();
    expect(screen.getByText("Received AICC")).toBeInTheDocument();
    expect(screen.getByText("Creative Purchase")).toBeInTheDocument();
  });

  it("renders transaction amounts with correct styling", () => {
    render(<ConnectedState {...defaultProps} />);

    expect(screen.getByText("+ 100 AICC")).toBeInTheDocument();
    expect(screen.getByText("- 50 AICC")).toBeInTheDocument();
  });

  it("renders recent orders section", () => {
    render(<ConnectedState {...defaultProps} />);

    expect(screen.getByText("Recent Creative Orders")).toBeInTheDocument();
    expect(screen.getByText("Summer Campaign Banner")).toBeInTheDocument();
    expect(screen.getByText("Holiday Promo Video")).toBeInTheDocument();
  });

  it("shows download button for confirmed orders", () => {
    render(<ConnectedState {...defaultProps} />);

    expect(screen.getByRole("button", { name: /Download/i })).toBeInTheDocument();
  });

  it("shows retry payment button for failed orders", () => {
    render(<ConnectedState {...defaultProps} />);

    expect(screen.getByRole("button", { name: /Retry Payment/i })).toBeInTheDocument();
  });

  it("renders empty state when no transactions", () => {
    render(<ConnectedState {...defaultProps} transactions={[]} />);

    expect(screen.getByText("No transactions yet.")).toBeInTheDocument();
  });

  it("renders empty state when no orders", () => {
    render(<ConnectedState {...defaultProps} orders={[]} />);

    expect(screen.getByText("No orders yet.")).toBeInTheDocument();
  });

  it("displays order status messages", () => {
    render(<ConnectedState {...defaultProps} />);

    expect(screen.getByText("Payment Successful")).toBeInTheDocument();
    expect(screen.getByText("Insufficient funds")).toBeInTheDocument();
  });
});
