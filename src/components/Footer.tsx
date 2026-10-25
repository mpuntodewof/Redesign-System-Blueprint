import { FULL_NAME } from "@/lib/profile";

const Footer = () => (
  <footer className="mx-auto flex max-w-[1180px] flex-wrap justify-between gap-2 px-4 pb-14 pt-7 font-mono text-xs text-muted-foreground md:px-8">
    <span>
      © {new Date().getFullYear()} {FULL_NAME}
    </span>
    <span>B.Eng. Informatics · Mulawarman University</span>
  </footer>
);

export default Footer;
