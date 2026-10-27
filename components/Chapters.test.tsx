import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { chapters, person } from "@/content/site";
import Chapters from "./Chapters";

function setup() {
  const { container } = render(<Chapters />);
  return { container, sections: [...container.querySelectorAll<HTMLElement>("section[data-ch]")] };
}

describe("<Chapters />", () => {
  it("renders one section per chapter, in order", () => {
    const { sections } = setup();
    expect(sections.map((s) => s.id)).toEqual(chapters.map((c) => c.id));
    expect(sections.map((s) => s.dataset.label)).toEqual(chapters.map((c) => c.label));
  });

  it("gives every section a stage and an accessible name", () => {
    const { sections } = setup();
    for (const s of sections) {
      expect(s.querySelector("[data-stage]")).not.toBeNull();
      expect(s.getAttribute("aria-label") ?? s.getAttribute("aria-labelledby")).toBeTruthy();
    }
  });

  it("marks at most one title per chapter for the WebGL renderer", () => {
    const { sections } = setup();
    for (const s of sections) expect(s.querySelectorAll("[data-title]").length).toBeLessThanOrEqual(1);
  });

  it("renders the name as the only h1 and a mailto link to the contact address", () => {
    const { container } = setup();
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(container.querySelector("h1")).toHaveTextContent(`${person.first}${person.last}`);
    expect(container.querySelector(`a[href="mailto:${person.email}"]`)).not.toBeNull();
  });

  it("opens external links safely", () => {
    const { container } = setup();
    for (const a of container.querySelectorAll('a[target="_blank"]')) expect(a).toHaveAttribute("rel", "noopener");
  });
});
