import { useEffect, useRef, useState } from "react";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "FrenCon 2026" },
  { name: "description", content: "Board game convention for friends" },
];

const PARALLAX_RATE = .3; // Detroit moves up at 40% of scroll speed (lagging behind)

export default function Index() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [detroitOffset, setDetroitOffset] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollTop = el.scrollTop;
      setDetroitOffset(scrollTop * PARALLAX_RATE);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial position
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={scrollRef} className="h-full overflow-auto">
      <div className="relative flex flex-col overflow-hidden min-h-[60vh] md:min-h-full bg-primary">
        {/* FrenCon logo - positioned above the Detroit image */}
        <div className="absolute w-full h-3/4 z-10 flex justify-center items-start bg-white">
          <img
            src="/FrenCon26 text.png"
            alt="FrenCon 2026"
            className="relative max-w-[min(45vw,600px)] top-[15px] left-[15px] md:left-[25px] w-auto object-contain"
          />
        </div>

        {/* Detroit skyline - bottom-based parallax on mobile, top-based on desktop */}
        <div
          className="detroit-hero absolute inset-x-0 z-20 w-full"
          style={{
            "--detroit-offset": `${detroitOffset}px`,
            top: `calc(10% - ${detroitOffset}px)`,
            bottom: "auto",
          } as React.CSSProperties & { "--detroit-offset": string }}
        >
          <img
            src="/detroit.png"
            alt="Detroit skyline"
            className="w-full object-cover object-bottom"
          />
        </div>
      </div>
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-primary px-4 py-12">
        <h1 className="font-['Bebas_Neue'] text-primary-foreground text-5xl tracking-wide">
          FRENCON 2026
        </h1>
        <p className="font-['Bebas_Neue'] text-primary-foreground/90 text-xl tracking-wider">
          June 19, 2026 – June 21, 2026
        </p>
        <p className="font-['Bebas_Neue'] text-primary-foreground/90 text-xl tracking-wider">
          Detroit, Michigan
        </p>
      </div>
      <section className="flex flex-col items-center justify-center gap-4 border-t border-border bg-background px-4 py-12">
        <h2 className="font-['Bebas_Neue'] text-3xl tracking-wide">Schedule</h2>
        <p className="text-muted-foreground text-lg">TBA</p>
      </section>
    </div>
  );
}
