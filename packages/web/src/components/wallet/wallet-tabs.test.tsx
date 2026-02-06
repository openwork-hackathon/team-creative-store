import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WalletTabs } from "./wallet-tabs";

describe("WalletTabs", () => {
  it("renders wallet and orders tabs", () => {
    render(<WalletTabs tab="wallet" onTabChange={vi.fn()} />);

    expect(screen.getByText("Wallet")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
  });

  it("highlights wallet tab when selected", () => {
    render(<WalletTabs tab="wallet" onTabChange={vi.fn()} />);

    const walletButton = screen.getByRole("button", { name: /Wallet/i });
    expect(walletButton).toHaveClass("border-b-primary");
  });

  it("highlights orders tab when selected", () => {
    render(<WalletTabs tab="orders" onTabChange={vi.fn()} />);

    const ordersButton = screen.getByRole("button", { name: /Orders/i });
    expect(ordersButton).toHaveClass("border-b-primary");
  });

  it("calls onTabChange with wallet when wallet tab is clicked", () => {
    const onTabChange = vi.fn();
    render(<WalletTabs tab="orders" onTabChange={onTabChange} />);

    fireEvent.click(screen.getByRole("button", { name: /Wallet/i }));
    expect(onTabChange).toHaveBeenCalledWith("wallet");
  });

  it("calls onTabChange with orders when orders tab is clicked", () => {
    const onTabChange = vi.fn();
    render(<WalletTabs tab="wallet" onTabChange={onTabChange} />);

    fireEvent.click(screen.getByRole("button", { name: /Orders/i }));
    expect(onTabChange).toHaveBeenCalledWith("orders");
  });

  it("renders wallet icon", () => {
    render(<WalletTabs tab="wallet" onTabChange={vi.fn()} />);

    expect(screen.getByText("account_balance_wallet")).toBeInTheDocument();
  });

  it("renders orders icon", () => {
    render(<WalletTabs tab="wallet" onTabChange={vi.fn()} />);

    expect(screen.getByText("receipt_long")).toBeInTheDocument();
  });
});
