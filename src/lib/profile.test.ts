import { existsSync } from "node:fs";
import path from "node:path";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, RESUME_FILENAME, RESUME_URL } from "./profile";

describe("profile", () => {
  it("serves the CV from the site root under the owner's name", () => {
    expect(RESUME_FILENAME).toBe("Muhammad-Puntodewo-Fadhillah-CV.pdf");
    expect(RESUME_URL).toBe("/Muhammad-Puntodewo-Fadhillah-CV.pdf");
  });

  it("ships the CV file in public/", () => {
    expect(existsSync(path.resolve(process.cwd(), "public", RESUME_FILENAME))).toBe(true);
  });

  it("exposes the contact channels used across the page", () => {
    expect(EMAIL).toBe("puntodewofadhillah@gmail.com");
    expect(GITHUB_URL).toBe("https://github.com/mpuntodewof");
    expect(LINKEDIN_URL).toBe("https://www.linkedin.com/in/muhammad-puntodewo-fadhillah-347169160/");
  });
});
