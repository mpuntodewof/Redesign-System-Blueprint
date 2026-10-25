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
    fireEvent.mouseMove(card, { clientX: 40, clientY: 12 });
    expect(card.style.getPropertyValue("--mx")).toBe("40px");
    expect(card.style.getPropertyValue("--my")).toBe("12px");
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
