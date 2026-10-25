import { type HTMLAttributes, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface HudCardProps extends HTMLAttributes<HTMLElement> {
  /** Adds the cursor-follow glow and hover border. */
  glow?: boolean;
  as?: "div" | "article";
}

const HudCard = ({ glow = false, as: Tag = "div", className, children, onMouseMove, ...rest }: HudCardProps) => {
  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    if (glow) {
      const rect = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
    }
    onMouseMove?.(event);
  };

  return (
    <Tag className={cn("hud", glow && "glowcard", className)} onMouseMove={handleMouseMove} {...rest}>
      {glow && <span className="spot" aria-hidden="true" />}
      {children}
    </Tag>
  );
};

export default HudCard;
