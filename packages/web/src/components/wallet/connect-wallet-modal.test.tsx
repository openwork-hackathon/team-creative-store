import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConnectWalletModal } from "./connect-wallet-modal";
import type { Connector } from "wagmi";

const createMockConnector = (name: string, uid: string): Connector =>
  ({
    name,
    uid,
    connect: vi.fn(),
    disconnect: vi.fn(),
    getAccounts: vi.fn(),
    getChainId: vi.fn(),
    getProvider: vi.fn(),
    isAuthorized: vi.fn(),
    onAccountsChanged: vi.fn(),
    onChainChanged: vi.fn(),
    onDisconnect: vi.fn()
  }) as unknown as Connector;

describe("ConnectWalletModal", () => {
  const mockConnectors = [
    createMockConnector("Coinbase Wallet", "coinbase-1"),
    createMockConnector("MetaMask", "metamask-1")
  ] as const;

  it("renders modal with title and description", () => {
    render(
      <ConnectWalletModal
        connectors={mockConnectors}
        isConnectPending={false}
        isConnecting={false}
        onConnect={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
    expect(
      screen.getByText(/Connect your wallet to access your AICC tokens/)
    ).toBeInTheDocument();
  });

  it("only shows Coinbase wallet connectors", () => {
    render(
      <ConnectWalletModal
        connectors={mockConnectors}
        isConnectPending={false}
        isConnecting={false}
        onConnect={vi.fn()}
        onClose={vi.fn()}
      />
    );

    // The connector name appears in the button, and "Coinbase Wallet" also appears as subtitle
    const coinbaseElements = screen.getAllByText("Coinbase Wallet");
    expect(coinbaseElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("MetaMask")).not.toBeInTheDocument();
  });

  it("calls onConnect when connector button is clicked", () => {
    const onConnect = vi.fn();
    render(
      <ConnectWalletModal
        connectors={mockConnectors}
        isConnectPending={false}
        isConnecting={false}
        onConnect={onConnect}
        onClose={vi.fn()}
      />
    );

    // Click the button containing the connector name
    const coinbaseElements = screen.getAllByText("Coinbase Wallet");
    fireEvent.click(coinbaseElements[0].closest("button")!);
    expect(onConnect).toHaveBeenCalledWith(mockConnectors[0]);
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <ConnectWalletModal
        connectors={mockConnectors}
        isConnectPending={false}
        isConnecting={false}
        onConnect={vi.fn()}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByText("close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("disables buttons when connecting", () => {
    render(
      <ConnectWalletModal
        connectors={mockConnectors}
        isConnectPending={true}
        isConnecting={false}
        onConnect={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const button = screen.getByRole("button", { name: /Coinbase Wallet/i });
    expect(button).toBeDisabled();
  });

  it("shows loading spinner when connecting", () => {
    const { container } = render(
      <ConnectWalletModal
        connectors={mockConnectors}
        isConnectPending={true}
        isConnecting={false}
        onConnect={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders terms of service notice", () => {
    render(
      <ConnectWalletModal
        connectors={mockConnectors}
        isConnectPending={false}
        isConnecting={false}
        onConnect={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(
      screen.getByText(/By connecting, you agree to our Terms of Service/)
    ).toBeInTheDocument();
  });
});
