import { FULL_NAME } from "@/lib/profile";

const Footer = () => (
  <footer className="flex flex-wrap justify-between gap-2 pb-14 pt-7 font-mono text-xs text-muted-foreground">
    <span>
      © {new Date().getFullYear()} {FULL_NAME}
    </span>
    <span>B.Eng. Informatics · Mulawarman University</span>
  </footer>
);

export default Footer;
