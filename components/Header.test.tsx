import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Header from "./Header";

function setup(props: Partial<Parameters<typeof Header>[0]> = {}) {
  const handlers = { onToggleMenu: vi.fn(), onToggleTheme: vi.fn(), onHome: vi.fn() };
  render(<Header menuOpen={false} dark={false} count={16} {...handlers} {...props} />);
  return handlers;
}

describe("<Header />", () => {
  it("links the name back to the top", async () => {
    const { onHome } = setup();
    const home = screen.getByRole("link", { name: /Odilon D’Alex NOMENJANAHARY/ });
    expect(home).toHaveAttribute("href", "#top");
    await userEvent.click(home);
    expect(onHome).toHaveBeenCalled();
  });

  it("toggles the index menu", async () => {
    const { onToggleMenu } = setup();
    const btn = screen.getByRole("button", { name: /Index/ });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    expect(btn).toHaveAttribute("aria-controls", "index-menu");
    expect(btn).toHaveTextContent("16");
    await userEvent.click(btn);
    expect(onToggleMenu).toHaveBeenCalled();
  });

  it("labels the menu button Close while open", () => {
    setup({ menuOpen: true });
    expect(screen.getByRole("button", { name: /Close/ })).toHaveAttribute("aria-expanded", "true");
  });

  it("offers the opposite theme", async () => {
    const { onToggleTheme } = setup({ dark: true });
    const btn = screen.getByRole("button", { name: "Switch colour theme" });
    expect(btn).toHaveTextContent("Light");
    expect(btn).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(btn);
    expect(onToggleTheme).toHaveBeenCalled();
  });
});
