import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DeviceSelector } from "./device-selector";
import { deviceOptions } from "./types";

describe("DeviceSelector", () => {
  it("renders section title", () => {
    render(<DeviceSelector selectedDevice="mobile" onDeviceChange={vi.fn()} />);

    expect(screen.getByText("Device Selection")).toBeInTheDocument();
  });

  it("renders section subtitle", () => {
    render(<DeviceSelector selectedDevice="mobile" onDeviceChange={vi.fn()} />);

    expect(screen.getByText("Preview layouts")).toBeInTheDocument();
  });

  it("renders all device options", () => {
    render(<DeviceSelector selectedDevice="mobile" onDeviceChange={vi.fn()} />);

    for (const device of deviceOptions) {
      expect(screen.getByText(device.label)).toBeInTheDocument();
    }
  });

  it("renders device icons", () => {
    render(<DeviceSelector selectedDevice="mobile" onDeviceChange={vi.fn()} />);

    expect(screen.getByText("smartphone")).toBeInTheDocument();
    expect(screen.getByText("desktop_windows")).toBeInTheDocument();
  });

  it("highlights selected device with primary styling", () => {
    render(<DeviceSelector selectedDevice="mobile" onDeviceChange={vi.fn()} />);

    const selectedButton = screen.getByText("Mobile Portrait").closest("button");
    expect(selectedButton).toHaveClass("bg-primary/10");
    expect(selectedButton).toHaveClass("text-primary");
    expect(selectedButton).toHaveClass("border-primary/20");
  });

  it("shows non-selected device with muted styling", () => {
    render(<DeviceSelector selectedDevice="mobile" onDeviceChange={vi.fn()} />);

    const nonSelectedButton = screen.getByText("Desktop Billboard").closest("button");
    expect(nonSelectedButton).toHaveClass("text-muted-foreground");
    expect(nonSelectedButton).not.toHaveClass("bg-primary/10");
  });

  it("calls onDeviceChange when a device is clicked", () => {
    const onDeviceChange = vi.fn();
    render(<DeviceSelector selectedDevice="mobile" onDeviceChange={onDeviceChange} />);

    fireEvent.click(screen.getByText("Desktop Billboard"));
    expect(onDeviceChange).toHaveBeenCalledWith("desktop");
  });

  it("calls onDeviceChange with mobile when mobile is clicked", () => {
    const onDeviceChange = vi.fn();
    render(<DeviceSelector selectedDevice="desktop" onDeviceChange={onDeviceChange} />);

    fireEvent.click(screen.getByText("Mobile Portrait"));
    expect(onDeviceChange).toHaveBeenCalledWith("mobile");
  });

  it("renders buttons with correct structure", () => {
    render(<DeviceSelector selectedDevice="mobile" onDeviceChange={vi.fn()} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);

    for (const button of buttons) {
      expect(button).toHaveClass("flex");
      expect(button).toHaveClass("items-center");
      expect(button).toHaveClass("gap-3");
      expect(button).toHaveClass("rounded-lg");
    }
  });
});
