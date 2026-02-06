import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FilterDropdown } from "./filter-dropdown";

const mockOptions = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" }
];

describe("FilterDropdown", () => {
  it("renders the label and placeholder when no value selected", () => {
    render(
      <FilterDropdown
        label="Type"
        options={mockOptions}
        value=""
        onChange={() => {}}
      />
    );
    expect(screen.getByText("Type: All")).toBeInTheDocument();
  });

  it("renders custom placeholder when provided", () => {
    render(
      <FilterDropdown
        label="Category"
        options={mockOptions}
        value=""
        onChange={() => {}}
        placeholder="Select..."
      />
    );
    expect(screen.getByText("Category: Select...")).toBeInTheDocument();
  });

  it("displays selected option label", () => {
    render(
      <FilterDropdown
        label="Type"
        options={mockOptions}
        value="video"
        onChange={() => {}}
      />
    );
    expect(screen.getByText("Type: Video")).toBeInTheDocument();
  });

  it("opens dropdown when button is clicked", () => {
    render(
      <FilterDropdown
        label="Type"
        options={mockOptions}
        value=""
        onChange={() => {}}
      />
    );
    
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    expect(screen.getByText("Image")).toBeInTheDocument();
    expect(screen.getByText("Video")).toBeInTheDocument();
    expect(screen.getByText("Audio")).toBeInTheDocument();
  });

  it("calls onChange with selected option value", () => {
    const handleChange = vi.fn();
    render(
      <FilterDropdown
        label="Type"
        options={mockOptions}
        value=""
        onChange={handleChange}
      />
    );
    
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Video"));
    
    expect(handleChange).toHaveBeenCalledWith("video");
  });

  it("calls onChange with empty string when placeholder option is selected", () => {
    const handleChange = vi.fn();
    render(
      <FilterDropdown
        label="Type"
        options={mockOptions}
        value="video"
        onChange={handleChange}
      />
    );
    
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("All"));
    
    expect(handleChange).toHaveBeenCalledWith("");
  });

  it("closes dropdown after selecting an option", () => {
    render(
      <FilterDropdown
        label="Type"
        options={mockOptions}
        value=""
        onChange={() => {}}
      />
    );
    
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Image")).toBeInTheDocument();
    
    fireEvent.click(screen.getByText("Image"));
    expect(screen.queryByText("Video")).not.toBeInTheDocument();
  });

  it("closes dropdown when clicking outside", () => {
    render(
      <FilterDropdown
        label="Type"
        options={mockOptions}
        value=""
        onChange={() => {}}
      />
    );
    
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Image")).toBeInTheDocument();
    
    // Click on the overlay
    const overlay = document.querySelector(".fixed.inset-0");
    if (overlay) {
      fireEvent.click(overlay);
    }
    
    expect(screen.queryByText("Image")).not.toBeInTheDocument();
  });

  it("highlights the selected option in the dropdown", () => {
    render(
      <FilterDropdown
        label="Type"
        options={mockOptions}
        value="video"
        onChange={() => {}}
      />
    );
    
    fireEvent.click(screen.getByRole("button"));
    
    const videoOption = screen.getByText("Video");
    expect(videoOption).toHaveClass("text-primary");
    expect(videoOption).toHaveClass("font-semibold");
  });

  it("toggles dropdown open/closed on button clicks", () => {
    render(
      <FilterDropdown
        label="Type"
        options={mockOptions}
        value=""
        onChange={() => {}}
      />
    );
    
    const button = screen.getByRole("button");
    
    // First click opens
    fireEvent.click(button);
    expect(screen.getByText("Image")).toBeInTheDocument();
    
    // Second click closes
    fireEvent.click(button);
    expect(screen.queryByText("Image")).not.toBeInTheDocument();
  });
});
