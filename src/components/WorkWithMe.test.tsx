import { fireEvent, render, screen, within } from "@testing-library/react";
import { ContactDialogProvider } from "@/components/contact/ContactDialogContext";
import { LINKEDIN_URL, RESUME_FILENAME, RESUME_URL } from "@/lib/profile";
import WorkWithMe from "./WorkWithMe";

const renderSection = () =>
  render(
    <ContactDialogProvider>
      <WorkWithMe />
    </ContactDialogProvider>,
  );

describe("WorkWithMe", () => {
  it("offers three linkable engagement tracks", () => {
    const { container } = renderSection();
    expect(container.querySelector("section#work")).not.toBeNull();
    ["work-full-time", "work-contract", "work-project"].forEach((id) => {
      expect(container.querySelector(`article#${id}`)).not.toBeNull();
    });
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Full-time roles",
      "Contract & part-time",
      "Project work",
    ]);
  });

  it("states the facts recruiters check first", () => {
    renderSection();
    const fullTime = screen.getByRole("article", { name: "Full-time roles" });
    expect(within(fullTime).getByText("Fluent English")).toBeInTheDocument();
    expect(within(fullTime).getByText("1-month notice")).toBeInTheDocument();
    const cv = within(fullTime).getByRole("link", { name: "Download CV ↓" });
    expect(cv).toHaveAttribute("href", RESUME_URL);
    expect(cv).toHaveAttribute("download", RESUME_FILENAME);
    expect(within(fullTime).getByRole("link", { name: "LinkedIn ↗" })).toHaveAttribute("href", LINKEDIN_URL);
    const contract = screen.getByRole("article", { name: "Contract & part-time" });
    expect(within(contract).getByText(/~20 h\/week/)).toBeInTheDocument();
    expect(within(contract).getByText(/US-East afternoons, EU midday/)).toBeInTheDocument();
  });

  it("leads the project offerings with integration", () => {
    renderSection();
    const project = screen.getByRole("article", { name: "Project work" });
    const offerings = within(project).getByRole("list", { name: "Offerings" });
    expect(within(offerings).getAllByRole("listitem")[0]).toHaveTextContent("Enterprise System Integration");
  });

  it("publishes no pricing signal", () => {
    const { container } = renderSection();
    expect(container.textContent ?? "").not.toMatch(/\$\s?\d|\bper hour\b|\bhourly\b|\bday rate\b|\bpricing\b|\bget a quote\b/i);
  });

  it("opens the contact form with the track's intent", () => {
    renderSection();
    fireEvent.click(screen.getByRole("button", { name: "Ask about availability →" }));
    expect(screen.getByRole("dialog", { name: "Contract & part-time enquiry" })).toBeInTheDocument();
  });

  it("opens a project brief from the project card", () => {
    renderSection();
    fireEvent.click(screen.getByRole("button", { name: "Send a brief →" }));
    expect(screen.getByRole("dialog", { name: "Start a project" })).toBeInTheDocument();
  });
});
