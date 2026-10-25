import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "next-themes";
import { RESUME_FILENAME, RESUME_URL } from "@/lib/profile";
import Navbar from "./Navbar";

const renderNavbar = () =>
  render(
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <Navbar />
    </ThemeProvider>,
  );

describe("Navbar", () => {
  it("shows the owner's name instead of a generic logo", () => {
    renderNavbar();
    expect(screen.getByRole("link", { name: /Puntodewo Fadhillah/ })).toHaveAttribute("href", "#top");
  });

  it("links to every homepage section", () => {
    renderNavbar();
    const nav = screen.getByRole("navigation", { name: "Primary" });
    const hrefs = Array.from(nav.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["#experience", "#projects", "#stack", "#contract", "#contact"]);
  });

  it("downloads the CV from the résumé button", () => {
    renderNavbar();
    const resume = screen.getByRole("link", { name: "Résumé ↓" });
    expect(resume).toHaveAttribute("href", RESUME_URL);
    expect(resume).toHaveAttribute("download", RESUME_FILENAME);
  });

  it("toggles between dark and light", async () => {
    renderNavbar();
    const toggle = await screen.findByRole("button", { name: "Switch to light mode" });
    fireEvent.click(toggle);
    expect(await screen.findByRole("button", { name: "Switch to dark mode" })).toBeInTheDocument();
  });
});
