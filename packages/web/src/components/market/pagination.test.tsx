import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./pagination";

describe("Pagination", () => {
  it("returns null when totalPages is 1", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null when totalPages is 0", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={0} onPageChange={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders all page numbers when totalPages <= 7", () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
    );
    
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders navigation arrows", () => {
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={() => {}} />
    );
    
    const buttons = screen.getAllByRole("button");
    // First button is prev, last is next
    expect(buttons[0]).toContainHTML("chevron_left");
    expect(buttons[buttons.length - 1]).toContainHTML("chevron_right");
  });

  it("disables previous button on first page", () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
    );
    
    const prevButton = screen.getAllByRole("button")[0];
    expect(prevButton).toBeDisabled();
  });

  it("disables next button on last page", () => {
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />
    );
    
    const buttons = screen.getAllByRole("button");
    const nextButton = buttons[buttons.length - 1];
    expect(nextButton).toBeDisabled();
  });

  it("calls onPageChange when clicking a page number", () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={handlePageChange} />
    );
    
    fireEvent.click(screen.getByText("3"));
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it("calls onPageChange with previous page when clicking prev button", () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={handlePageChange} />
    );
    
    const prevButton = screen.getAllByRole("button")[0];
    fireEvent.click(prevButton);
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange with next page when clicking next button", () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={handlePageChange} />
    );
    
    const buttons = screen.getAllByRole("button");
    const nextButton = buttons[buttons.length - 1];
    fireEvent.click(nextButton);
    expect(handlePageChange).toHaveBeenCalledWith(4);
  });

  it("highlights the current page", () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />
    );
    
    const currentPageButton = screen.getByText("3");
    expect(currentPageButton).toHaveClass("bg-primary");
    expect(currentPageButton).toHaveClass("text-primary-foreground");
  });

  it("renders ellipsis for many pages when current page is near start", () => {
    render(
      <Pagination currentPage={2} totalPages={10} onPageChange={() => {}} />
    );
    
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("...")).toBeInTheDocument();
  });

  it("renders ellipsis for many pages when current page is near end", () => {
    render(
      <Pagination currentPage={9} totalPages={10} onPageChange={() => {}} />
    );
    
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("...")).toBeInTheDocument();
  });

  it("renders two ellipsis when current page is in the middle", () => {
    render(
      <Pagination currentPage={5} totalPages={10} onPageChange={() => {}} />
    );
    
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    
    const ellipses = screen.getAllByText("...");
    expect(ellipses).toHaveLength(2);
  });

  it("does not render ellipsis when totalPages is 7", () => {
    render(
      <Pagination currentPage={4} totalPages={7} onPageChange={() => {}} />
    );
    
    expect(screen.queryByText("...")).not.toBeInTheDocument();
    for (let i = 1; i <= 7; i++) {
      expect(screen.getByText(String(i))).toBeInTheDocument();
    }
  });

  it("renders correctly at boundary - page 3 of 10", () => {
    render(
      <Pagination currentPage={3} totalPages={10} onPageChange={() => {}} />
    );
    
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("renders correctly at boundary - page 8 of 10", () => {
    render(
      <Pagination currentPage={8} totalPages={10} onPageChange={() => {}} />
    );
    
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });
});
