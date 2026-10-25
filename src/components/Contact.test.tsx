import { render, screen } from "@testing-library/react";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, RESUME_FILENAME, RESUME_URL } from "@/lib/profile";
import Contact from "./Contact";
import Footer from "./Footer";

describe("Contact", () => {
  it("is addressed to people hiring", () => {
    render(<Contact />);
    expect(screen.getByRole("heading", { level: 2, name: "Hiring for backend or integration work?" })).toBeInTheDocument();
  });

  it("lists email, LinkedIn, GitHub and the CV as terminal commands", () => {
    render(<Contact />);
    expect(screen.getByRole("link", { name: EMAIL })).toHaveAttribute("href", `mailto:${EMAIL}`);
    expect(screen.getByRole("link", { name: "linkedin.com/in/muhammad-puntodewo-fadhillah" })).toHaveAttribute("href", LINKEDIN_URL);
    expect(screen.getByRole("link", { name: "github.com/mpuntodewof" })).toHaveAttribute("href", GITHUB_URL);
    const cv = screen.getByRole("link", { name: RESUME_FILENAME });
    expect(cv).toHaveAttribute("href", RESUME_URL);
    expect(cv).toHaveAttribute("download", RESUME_FILENAME);
  });
});

describe("Footer", () => {
  it("credits the owner by name", () => {
    render(<Footer />);
    expect(screen.getByText(/Muhammad Puntodewo Fadhillah/)).toBeInTheDocument();
  });

  it("is self-contained: carries its own centered max-width container", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toHaveClass("mx-auto", "max-w-[1180px]");
  });
});
