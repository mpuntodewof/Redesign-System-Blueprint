import { type ReactNode } from "react";
import HudCard from "@/components/blueprint/HudCard";
import Reveal from "@/components/blueprint/Reveal";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, RESUME_FILENAME, RESUME_URL } from "@/lib/profile";

const linkClass =
  "border-b border-dashed border-primary/60 text-foreground transition-colors [overflow-wrap:anywhere] hover:text-primary";

const TerminalLine = ({ command, children }: { command: string; children: ReactNode }) => (
  <p>
    <span className="text-primary" aria-hidden="true">
      $
    </span>{" "}
    {command} {children}
  </p>
);

const Contact = () => (
  <section
    id="contact"
    data-stage="4"
    data-stage-x="0.48"
    className="mb-6 flex min-h-[80vh] scroll-mt-20 items-center"
  >
    <Reveal className="w-full lg:w-[min(620px,54%)]">
      <HudCard>
        <div className="flex gap-[7px] border-b border-border px-3.5 py-[11px]" aria-hidden="true">
          {[0, 1, 2].map((dot) => (
            <i key={dot} className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          ))}
        </div>
        <div className="px-6 py-6 font-mono text-sm leading-[1.9] md:px-7">
          <h2 className="mb-2.5 font-sans text-[26px] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            Hiring for backend or integration work?
          </h2>
          <TerminalLine command="contact --email">
            <a className={linkClass} href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
          </TerminalLine>
          <TerminalLine command="open">
            <a className={linkClass} href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
              linkedin.com/in/muhammad-puntodewo-fadhillah
            </a>
          </TerminalLine>
          <TerminalLine command="open">
            <a className={linkClass} href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              github.com/mpuntodewof
            </a>
          </TerminalLine>
          <TerminalLine command="download">
            <a className={linkClass} href={RESUME_URL} download={RESUME_FILENAME}>
              {RESUME_FILENAME}
            </a>
            <span className="caret" aria-hidden="true" />
          </TerminalLine>
        </div>
      </HudCard>
    </Reveal>
  </section>
);

export default Contact;
