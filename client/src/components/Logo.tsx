interface LogoProps {
  size?: string;
}

// Simple "FS" mark in a filled circle. Works on any background (cream,
// white, teal footer...) since the circle always has a solid fill.
export default function Logo({ size = "h-9 w-9 text-sm" }: LogoProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-marigold font-display font-bold text-ink ${size}`}
    >
      FS
    </span>
  );
}
