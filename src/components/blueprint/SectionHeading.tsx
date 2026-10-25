interface SectionHeadingProps {
  index: string;
  title: string;
  meta?: string;
}

const SectionHeading = ({ index, title, meta }: SectionHeadingProps) => (
  <div className="mb-8 flex items-center gap-4">
    <span aria-hidden="true" className="font-mono text-xs font-medium tracking-[0.08em] text-primary">{`// ${index}`}</span>
    <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground">{title}</h2>
    <span className="h-px flex-1 bg-gradient-to-r from-border-strong to-transparent" aria-hidden="true" />
    {meta && <p className="mono-label hidden md:block">{meta}</p>}
  </div>
);

export default SectionHeading;
