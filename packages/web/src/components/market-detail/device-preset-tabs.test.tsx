import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DevicePresetTabs } from "./device-preset-tabs";
import { devicePresets } from "./types";

describe("DevicePresetTabs", () => {
  it("renders all device preset options", () => {
    render(<DevicePresetTabs selectedPreset="iphone14" onPresetChange={vi.fn()} />);

    for (const preset of devicePresets) {
      expect(screen.getByText(preset.label)).toBeInTheDocument();
    }
  });

  it("highlights the selected preset with primary border", () => {
    render(<DevicePresetTabs selectedPreset="iphone14" onPresetChange={vi.fn()} />);

    const selectedButton = screen.getByText("iPhone 14 Pro Max").closest("button");
    expect(selectedButton).toHaveClass("border-primary");
    expect(selectedButton).toHaveClass("text-foreground");
  });

  it("shows non-selected presets with transparent border", () => {
    render(<DevicePresetTabs selectedPreset="iphone14" onPresetChange={vi.fn()} />);

    const nonSelectedButton = screen.getByText("Galaxy Ultra S23").closest("button");
    expect(nonSelectedButton).toHaveClass("border-transparent");
    expect(nonSelectedButton).toHaveClass("text-muted-foreground");
  });

  it("calls onPresetChange when a preset is clicked", () => {
    const onPresetChange = vi.fn();
    render(<DevicePresetTabs selectedPreset="iphone14" onPresetChange={onPresetChange} />);

    fireEvent.click(screen.getByText("Galaxy Ultra S23"));
    expect(onPresetChange).toHaveBeenCalledWith("galaxy");
  });

  it("calls onPresetChange with ipad when iPad preset is clicked", () => {
    const onPresetChange = vi.fn();
    render(<DevicePresetTabs selectedPreset="iphone14" onPresetChange={onPresetChange} />);

    fireEvent.click(screen.getByText('iPad Pro (12.9")'));
    expect(onPresetChange).toHaveBeenCalledWith("ipad");
  });

  it("applies bold font to selected preset label", () => {
    render(<DevicePresetTabs selectedPreset="galaxy" onPresetChange={vi.fn()} />);

    const selectedLabel = screen.getByText("Galaxy Ultra S23");
    expect(selectedLabel).toHaveClass("font-bold");
  });

  it("applies medium font to non-selected preset labels", () => {
    render(<DevicePresetTabs selectedPreset="galaxy" onPresetChange={vi.fn()} />);

    const nonSelectedLabel = screen.getByText("iPhone 14 Pro Max");
    expect(nonSelectedLabel).toHaveClass("font-medium");
  });

  it("renders with correct container styling", () => {
    const { container } = render(
      <DevicePresetTabs selectedPreset="iphone14" onPresetChange={vi.fn()} />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("bg-card/30");
    expect(wrapper).toHaveClass("border-b");
    expect(wrapper).toHaveClass("border-border");
  });
});
