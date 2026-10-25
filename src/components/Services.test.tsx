import { fireEvent, render, screen } from "@testing-library/react";
import Services from "./Services";

describe("Services", () => {
  it("renders the four offerings", () => {
    render(<Services />);
    [
      "Enterprise System Integration",
      "Backend & API Development",
      "Legacy Modernisation & Performance",
      "Workflow & Approval Automation",
    ].forEach((title) => {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    });
  });

  it("leads with integration, the least commoditised offering", () => {
    render(<Services />);
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles[0]).toBe("Enterprise System Integration");
  });

  it("no longer sells generic full-stack as its own offering", () => {
    // The most crowded category on every freelance marketplace and the weakest
    // differentiator here. Full-stack capability belongs inside the other offers.
    render(<Services />);
    expect(
      screen.queryByRole("heading", { name: "Full-Stack Web Applications" })
    ).not.toBeInTheDocument();
  });

  it("publishes no pricing signal and no quote language", () => {
    // Pricing routes through the contact form: one figure cannot suit both an
    // ASEAN SME and a European enterprise, and whichever it fits it mis-signals
    // to the other.
    const { container } = render(<Services />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/\$\s?\d|\bper hour\b|\bhourly\b|\bday rate\b|\bpricing\b|\bget a quote\b/i);
  });

  it("routes the call to action at a conversation, not a quote", () => {
    render(<Services />);
    fireEvent.click(screen.getByRole("button", { name: "Discuss a project →" }));
    expect(screen.getByRole("dialog", { name: "Start a Project" })).toBeInTheDocument();
  });
});
