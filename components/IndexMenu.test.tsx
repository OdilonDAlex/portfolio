import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { chapters } from "@/content/site";
import IndexMenu from "./IndexMenu";

function setup(props: Partial<Parameters<typeof IndexMenu>[0]> = {}) {
  const handlers = { onGo: vi.fn(), onClose: vi.fn() };
  const utils = render(<IndexMenu open chapters={chapters} current={4} {...handlers} {...props} />);
  return { ...handlers, ...utils };
}

describe("<IndexMenu />", () => {
  it("is a modal dialog listing every chapter under its group", () => {
    setup();
    const dialog = screen.getByRole("dialog", { name: "Index" });
    expect(dialog).toHaveAttribute("id", "index-menu");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getAllByRole("link")).toHaveLength(chapters.length);
    for (const g of ["Overview", "Selected work", "More", "Talk"]) expect(screen.getByText(g)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "05 Feety" })).toHaveAttribute("href", "#feety");
  });

  it("marks and focuses the current chapter", async () => {
    vi.useFakeTimers();
    setup();
    act(() => vi.runAllTimers());
    vi.useRealTimers();
    const current = screen.getByRole("link", { name: "05 Feety" });
    expect(current).toHaveAttribute("aria-current", "true");
    expect(current).toHaveFocus();
  });

  it("navigates to a chapter", async () => {
    const { onGo } = setup();
    await userEvent.click(screen.getByRole("link", { name: "14 Stack" }));
    expect(onGo).toHaveBeenCalledWith(13);
  });

  it("closes when the backdrop is clicked", async () => {
    const { onClose } = setup();
    await userEvent.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalled();
  });

  it("is inert while closed", () => {
    const { container } = setup({ open: false });
    expect(container.querySelector("#index-menu")).toHaveAttribute("inert");
  });
});
