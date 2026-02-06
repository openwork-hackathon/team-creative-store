import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OrdersTabContent } from "./orders-tab-content";
import type { Order } from "./types";

describe("OrdersTabContent", () => {
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
      status: "pending",
      createdAt: "2026-01-14T10:00:00Z"
    },
    {
      id: "order-3",
      orderNumber: "ORD-003",
      creativeTitle: "Brand Logo Design",
      licenseType: "standard",
      priceAicc: "30",
      status: "failed",
      statusMessage: "Transaction reverted",
      createdAt: "2026-01-13T10:00:00Z"
    }
  ];

  describe("when not connected", () => {
    it("renders connect wallet prompt", () => {
      render(
        <OrdersTabContent
          isConnected={false}
          orders={[]}
          onConnectClick={vi.fn()}
        />
      );

      expect(screen.getByText("Connect Your Wallet to View Orders")).toBeInTheDocument();
      expect(
        screen.getByText(/A connection to the Base network is required/)
      ).toBeInTheDocument();
    });

    it("calls onConnectClick when connect button is clicked", () => {
      const onConnectClick = vi.fn();
      render(
        <OrdersTabContent
          isConnected={false}
          orders={[]}
          onConnectClick={onConnectClick}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /Connect Wallet/i }));
      expect(onConnectClick).toHaveBeenCalled();
    });
  });

  describe("when connected", () => {
    it("renders orders list header", () => {
      render(
        <OrdersTabContent
          isConnected={true}
          orders={mockOrders}
          onConnectClick={vi.fn()}
        />
      );

      expect(screen.getByText("Recent Creative Orders")).toBeInTheDocument();
    });

    it("renders all orders", () => {
      render(
        <OrdersTabContent
          isConnected={true}
          orders={mockOrders}
          onConnectClick={vi.fn()}
        />
      );

      expect(screen.getByText("Summer Campaign Banner")).toBeInTheDocument();
      expect(screen.getByText("Holiday Promo Video")).toBeInTheDocument();
      expect(screen.getByText("Brand Logo Design")).toBeInTheDocument();
    });

    it("renders order numbers", () => {
      render(
        <OrdersTabContent
          isConnected={true}
          orders={mockOrders}
          onConnectClick={vi.fn()}
        />
      );

      expect(screen.getByText(/Order #ORD-001/)).toBeInTheDocument();
      expect(screen.getByText(/Order #ORD-002/)).toBeInTheDocument();
      expect(screen.getByText(/Order #ORD-003/)).toBeInTheDocument();
    });

    it("shows download button for confirmed orders", () => {
      render(
        <OrdersTabContent
          isConnected={true}
          orders={mockOrders}
          onConnectClick={vi.fn()}
        />
      );

      expect(screen.getByRole("button", { name: /Download/i })).toBeInTheDocument();
    });

    it("shows retry payment button for non-confirmed orders", () => {
      render(
        <OrdersTabContent
          isConnected={true}
          orders={mockOrders}
          onConnectClick={vi.fn()}
        />
      );

      const retryButtons = screen.getAllByRole("button", { name: /Retry Payment/i });
      expect(retryButtons).toHaveLength(2);
    });

    it("displays custom status message when provided", () => {
      render(
        <OrdersTabContent
          isConnected={true}
          orders={mockOrders}
          onConnectClick={vi.fn()}
        />
      );

      expect(screen.getByText("Transaction reverted")).toBeInTheDocument();
    });

    it("displays default status messages", () => {
      render(
        <OrdersTabContent
          isConnected={true}
          orders={mockOrders}
          onConnectClick={vi.fn()}
        />
      );

      expect(screen.getByText("Payment Successful")).toBeInTheDocument();
      expect(screen.getByText("Pending")).toBeInTheDocument();
    });

    it("renders empty state when no orders", () => {
      render(
        <OrdersTabContent
          isConnected={true}
          orders={[]}
          onConnectClick={vi.fn()}
        />
      );

      expect(screen.getByText("No orders yet.")).toBeInTheDocument();
    });

    it("renders placeholder for orders without image", () => {
      const ordersWithoutImage: Order[] = [
        {
          id: "order-no-img",
          orderNumber: "ORD-999",
          creativeTitle: "No Image Order",
          licenseType: "standard",
          priceAicc: "10",
          status: "confirmed",
          createdAt: "2026-01-15T10:00:00Z"
        }
      ];

      render(
        <OrdersTabContent
          isConnected={true}
          orders={ordersWithoutImage}
          onConnectClick={vi.fn()}
        />
      );

      expect(screen.getByText("image_not_supported")).toBeInTheDocument();
    });
  });
});
