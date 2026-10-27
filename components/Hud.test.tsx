import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { chapters } from "@/content/site";
import Hud from "./Hud";

describe("<Hud />", () => {
  it("shows the current chapter number, total and label", () => {
    const { container } = render(<Hud chapters={chapters} current={4} dark={false} onGo={vi.fn()} />);
    expect(container.querySelector("[data-hud-count]")).toHaveTextContent("05");
    expect(container.querySelector("[data-hud-total]")).toHaveTextContent("/ 16");
    expect(container.querySelector("[data-hud-label]")).toHaveTextContent("Now");
  });

  it("exposes the nodes the engine animates", () => {
    const { container } = render(<Hud chapters={chapters} current={0} dark onGo={vi.fn()} />);
    for (const sel of ["[data-hud-progress]", "[data-hud-cue]", "[data-hud-bar]"]) {
      expect(container.querySelector(sel)).not.toBeNull();
    }
    expect(container.firstElementChild).toHaveAttribute("data-dark");
  });

  it("jumps to a chapter from the rail and highlights the current one", async () => {
    const onGo = vi.fn();
    render(<Hud chapters={chapters} current={2} dark={false} onGo={onGo} />);
    const tick = screen.getByRole("button", { name: "Go to Markets" });
    expect(tick).toHaveAttribute("aria-current", "true");
    await userEvent.click(screen.getByRole("button", { name: "Go to Contact" }));
    expect(onGo).toHaveBeenCalledWith(15);
  });
});
