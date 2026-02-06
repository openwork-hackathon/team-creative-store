import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DisconnectedState } from "./disconnected-state";

describe("DisconnectedState", () => {
  it("renders blurred wallet overview cards", () => {
    render(<DisconnectedState onConnectClick={vi.fn()} />);

    expect(screen.getByText("Base Network Address")).toBeInTheDocument();
    expect(screen.getByText("AICC Balance")).toBeInTheDocument();
    expect(screen.getByText("0x000...0000")).toBeInTheDocument();
    expect(screen.getByText("0.00 AICC")).toBeInTheDocument();
  });

  it("renders connect wallet CTA section", () => {
    render(<DisconnectedState onConnectClick={vi.fn()} />);

    expect(screen.getByText("Connect Your Wallet to View Assets")).toBeInTheDocument();
    expect(
      screen.getByText(/A connection to the Base network is required/)
    ).toBeInTheDocument();
  });

  it("calls onConnectClick when connect button is clicked", () => {
    const onConnectClick = vi.fn();
    render(<DisconnectedState onConnectClick={onConnectClick} />);

    fireEvent.click(screen.getByRole("button", { name: /Connect Wallet/i }));
    expect(onConnectClick).toHaveBeenCalled();
  });

  it("renders empty transaction history section", () => {
    render(<DisconnectedState onConnectClick={vi.fn()} />);

    expect(screen.getByText("Transaction History")).toBeInTheDocument();
    expect(
      screen.getByText(/No transaction history available/)
    ).toBeInTheDocument();
  });

  it("renders empty orders section", () => {
    render(<DisconnectedState onConnectClick={vi.fn()} />);

    expect(screen.getByText("Recent Creative Orders")).toBeInTheDocument();
    expect(
      screen.getByText(/Recent orders will appear here/)
    ).toBeInTheDocument();
  });
});
