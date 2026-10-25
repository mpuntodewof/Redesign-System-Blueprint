import { fireEvent, render, screen } from "@testing-library/react";
import { mockReducedMotion } from "@/test/reducedMotion";
import HudCard from "./HudCard";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

describe("HudCard", () => {
  it("renders a hud panel without the glow layer by default", () => {
    render(<HudCard data-testid="card">content</HudCard>);
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("hud");
    expect(card).not.toHaveClass("glowcard");
    expect(card.querySelector(".spot")).toBeNull();
  });

  it("tracks the cursor for the glow when glow is on", () => {
    render(<HudCard glow as="article" data-testid="card">content</HudCard>);
    const card = screen.getByTestId("card");
    expect(card.tagName).toBe("ARTICLE");
    expect(card).toHaveClass("glowcard");
    vi.spyOn(card, "getBoundingClientRect").mockReturnValue({ left: 10, top: 5, right: 0, bottom: 0, width: 0, height: 0, x: 10, y: 5, toJSON: () => ({}) } as DOMRect);
    fireEvent.mouseMove(card, { clientX: 40, clientY: 12 });
    expect(card.style.getPropertyValue("--mx")).toBe("30px");
    expect(card.style.getPropertyValue("--my")).toBe("7px");
  });
});

describe("SectionHeading", () => {
  it("renders the index, an h2 title and the meta line", () => {
    render(<SectionHeading index="02" title="Projects" meta="8 projects" />);
    expect(screen.getByRole("heading", { level: 2, name: "Projects" })).toBeInTheDocument();
    expect(screen.getByText("// 02")).toBeInTheDocument();
    expect(screen.getByText("8 projects")).toBeInTheDocument();
  });
});

describe("Reveal", () => {
  afterEach(() => mockReducedMotion(false));

  it("renders children in a plain wrapper under reduced motion", () => {
    mockReducedMotion(true);
    render(<Reveal className="wrap">child</Reveal>);
    const wrapper = screen.getByText("child");
    expect(wrapper).toHaveClass("wrap");
    expect(wrapper.getAttribute("style")).toBeNull();
  });
});
