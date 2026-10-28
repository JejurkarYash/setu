import { useEffect, useState } from "react";

type ScrambleTextProps = {
  text: string;
  className?: string;
  delay?: number;
};

const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/·";

export default function ScrambleText({
  text,
  className,
  delay = 0,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(() => {
    if (typeof window === "undefined") return text;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? text
      : text;
  });

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    let intervalId: number | undefined;
    let frame = 0;

    const start = () => {
      intervalId = window.setInterval(() => {
        frame += 1;
        const revealed = Math.floor((frame / 24) * text.length);
        const nextText = Array.from(text, (character, index) => {
          if (character === " " || index < revealed) return character;
          return glyphs[Math.floor(Math.random() * glyphs.length)];
        }).join("");

        setDisplayText(nextText);

        if (frame >= 27) {
          if (intervalId !== undefined) window.clearInterval(intervalId);
          setDisplayText(text);
        }
      }, 42);
    };

    const revealTimeoutId = window.setTimeout(start, delay);

    return () => {
      if (intervalId !== undefined) window.clearInterval(intervalId);
      if (revealTimeoutId !== undefined) window.clearTimeout(revealTimeoutId);
    };
  }, [delay, text]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{displayText}</span>
    </span>
  );
}
