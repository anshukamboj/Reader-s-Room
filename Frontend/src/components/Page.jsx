import { useState, useEffect } from "react";
import Navbar from "./Navbar";

export default function Page() {
    const [isDark, setIsDark] = useState(true);

    // lock the page: no scrolling, no scrollbar (restored when you leave this page)
    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        const prevHtml = html.style.overflow;
        const prevBody = body.style.overflow;
        html.style.overflow = "hidden";
        body.style.overflow = "hidden";
        window.scrollTo(0, 0);
        return () => {
            html.style.overflow = prevHtml;
            body.style.overflow = prevBody;
        };
    }, []);

    return (
        <main className="relative isolate h-screen overflow-hidden bg-[#0f1a15] text-[#eef3ee]">
            <video
                className="absolute inset-0 -z-20 h-full w-full object-cover"
                src="/lib.MP4"
                autoPlay
                muted
                loop
                playsInline
                aria-hidden="true"
            />
            {isDark && (
                <>
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_8%,rgba(236,226,170,0.28)_0%,transparent_45%)]"
                    />

                    <div
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(10,20,15,0.94)_0%,rgba(10,20,15,0.78)_34%,rgba(10,20,15,0.25)_62%,rgba(10,20,15,0.1)_100%)]"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(10,20,15,0.55)_0%,transparent_22%,transparent_62%,rgba(10,20,15,0.92)_100%)]"
                    />
                </>
            )}

            <div className="flex h-full w-full flex-col overflow-hidden">

                <Navbar isDark={isDark} onToggleTheme={() => setIsDark((v) => !v)} />

                <header id="home" className="px-4 pt-28 pb-14 sm:pt-36 lg:pt-44">
                    <h1
                        style={
                            isDark
                                ? undefined
                                : { textShadow: "0 0 12px rgba(255,255,255,0.95), 0 0 28px rgba(255,255,255,0.8), 0 0 48px rgba(255,255,255,0.6)" }
                        }
                        className={`mb-10 font-serif text-6xl font-medium leading-[1.12] tracking-tight [text-wrap:balance] sm:text-5xl lg:text-6xl ${
                            isDark ? "text-[#eef3ee]" : "text-[#141211]"
                        }`}
                    >
                        Every Great Journey <br /> Begins With a Book
                    </h1>

                    <p
                        style={
                            isDark
                                ? undefined
                                : { textShadow: "0 0 10px rgba(255,255,255,0.95), 0 0 24px rgba(255,255,255,0.8)" }
                        }
                        className={`mb-12 text-[28px] ${isDark ? "text-[#eef3ee]/90" : "text-[#141211]"}`}
                    >
                        Manage, discover, and reserve your next read <br /> with our intelligent digital archive.
                    </p>

                    <div className="flex flex-wrap gap-5">
                        <a
                            href="#explore"
                            className="inline-flex min-h-[42px] items-center rounded-lg bg-[#2f6b4a] px-7 text-[25px] font-semibold text-[#f4faf5] transition-colors hover:bg-[#3b8259]"
                        >
                            Explore Library
                        </a>
                        <a
                            href="#start"
                            className="inline-flex min-h-[42px] items-center rounded-lg border border-[#eef3ee]/55 px-5 text-[15px] font-semibold transition-colors hover:bg-white/10"
                        >
                            Join Now
                        </a>
                    </div>
                </header>
            </div>
        </main>
    );
}