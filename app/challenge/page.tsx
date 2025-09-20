"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Challenge Flow Page (/challenge)
 * Theme: minimal + elegant; accent #1B3F3F; generous whitespace.
 *
 * Flow:
 *   welcome → visited → inputs → favorite → riddle → Beyrut → Jamshedpur
 *   → curry → findRed (lamp) → BBI (any) → cricket (Golden Duck)
 *   → fortune → shiny (music after 5s; triple-click stops) → ending
 */

const ACCENT = "#1B3F3F";

/* ────────────────────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────────────────────── */
type Choice = { key: string; label: string; correct?: boolean };

type Screen =
  | { kind: "welcome" }
  | { kind: "visited" }
  | { kind: "inputs" }
  | { kind: "favorite" }
  | { kind: "riddle" }
  | {
      kind: "choice";
      id: string;
      prompt: string;
      choices: Choice[];
      explanation?: string;
    }
  | { kind: "curry" }
  | { kind: "findRed" }
  | { kind: "fortune" }
  | { kind: "shiny" }
  | { kind: "ending" };

/* ────────────────────────────────────────────────────────────────────────────
 * SafeImage (graceful fallback if /public logos are missing)
 * ──────────────────────────────────────────────────────────────────────────── */
function SafeImage({
  src,
  alt,
  width,
  height,
  className,
  onFallback,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  onFallback?: () => void;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      style={{ width, height }}
      className={`flex items-center justify-center ${className ?? ""}`}
      aria-label={failed ? "fallback-active" : "image-active"}
    >
      {!failed ? (
        <img
          src={src}
          width={width}
          height={height}
          alt={alt}
          onError={() => {
            setFailed(true);
            onFallback?.();
          }}
        />
      ) : (
        <div
          className="text-slate-400 text-xs tracking-wide uppercase border border-slate-200 rounded px-2 py-1"
          style={{ width, height, display: "grid", placeItems: "center" }}
        >
          {alt}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────────────────────── */
export default function ChallengePage() {
  // inputs
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [favorite, setFavorite] = useState<string>("");

  // flow
  const [step, setStep] = useState<Screen>({ kind: "welcome" });
  const [toast, setToast] = useState<string>("");

  // music control
  const audio = useRef<HTMLAudioElement | null>(null);
  const armed = useRef(false);
  const [foundClicks, setFoundClicks] = useState(0);

  // Start music 5s after shiny step appears (requires prior interaction)
  useEffect(() => {
    if (step.kind === "shiny") {
      const t = setTimeout(() => {
        if (armed.current) {
          audio.current?.play().catch(() => {});
        }
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [step.kind]);

  // Stop music after pressing "I found it" three times
  useEffect(() => {
    if (foundClicks >= 3) {
      if (audio.current) {
        audio.current.pause();
        audio.current.currentTime = 0;
      }
      setToast("Music stopped 🎵");
    }
  }, [foundClicks]);

  const goNext = () => {
    setToast("");
    setStep((prev) => {
      switch (prev.kind) {
        case "welcome":
          return { kind: "visited" };
        case "visited":
          return { kind: "inputs" };
        case "inputs":
          return { kind: "favorite" };
        case "favorite":
          return { kind: "riddle" };
        case "riddle":
          // Beyrut (Lebanon)
          return {
            kind: "choice",
            id: "beyrut",
            prompt:
              "Which of these countries is famous for foods like hummus, falafel and shawarma?",
            choices: [
              { key: "a", label: "Iran" },
              { key: "b", label: "Jordan" },
              { key: "c", label: "Greece" },
              { key: "d", label: "Lebanon", correct: true },
            ],
            explanation: "Lebanon is at the heart of mezze classics.",
          };
        case "choice": {
          if (prev.id === "beyrut") {
            // Jamshedpur (Steel City)
            return {
              kind: "choice",
              id: "jamshedpur",
              prompt:
                "Lyfe Hotels has begun expanding with first steps in Jamshedpur on 24 August. Just like Bhubaneswar is the Temple City, Jamshedpur is known as…",
              choices: [
                { key: "a", label: "Iron City" },
                { key: "b", label: "Steel City", correct: true },
                { key: "c", label: "Golden City" },
                { key: "d", label: "Diamond City" },
              ],
              explanation: "Jamshedpur is India's Steel City.",
            };
          }
          if (prev.id === "jamshedpur") return { kind: "curry" };

          if (prev.id === "bbi") {
            // Cricket question (Golden Duck)
            return {
              kind: "choice",
              id: "duck",
              prompt:
                "It's India v Pakistan today. If a batter is out for 0 on their first ball, it's called a…",
              choices: [
                { key: "a", label: "Golden Duck", correct: true },
                { key: "b", label: "Green Duck" },
                { key: "c", label: "Bronze Duck" },
                { key: "d", label: "Silver Duck" },
              ],
              explanation: "First-ball duck = Golden Duck.",
            };
          }

          if (prev.id === "duck") return { kind: "fortune" };
          return prev;
        }
        case "curry":
          return { kind: "findRed" };
        case "findRed":
          // BBI (any option fine)
          return {
            kind: "choice",
            id: "bbi",
            prompt:
              "Imagine a foodie day-trip in September: fly out, spend 12–13 hours for cuisine, and fly back. Your boarding pass reads…",
            choices: [
              { key: "a", label: "BBI–BKK (Bangkok)", correct: true },
              { key: "b", label: "BBI–DXB (Dubai)", correct: true },
              { key: "c", label: "BBI–SIN (Singapore)", correct: true },
              { key: "d", label: "BBI–KUL (Kuala Lumpur)", correct: true },
            ],
          };
        case "fortune":
          // arm audio before entering shiny (to satisfy autoplay limitations)
          armed.current = true;
          return { kind: "shiny" };
        case "shiny":
          return { kind: "ending" };
        default:
          return prev;
      }
    });
  };

  /* ──────────────────────────────────────────────────────────────────────────
   * UI
   * ────────────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <SafeImage
            src="/sweetbasil.png"
            alt="Sweet Basil"
            width={120}
            height={40}
          />
          <SafeImage
            src="/lyfe.png"
            alt="Lyfe Hotels"
            width={120}
            height={40}
          />
        </div>
      </header>

      {/* Body */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={JSON.stringify(step)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow ring-1 ring-slate-200 p-8"
          >
            {/* welcome */}
            {step.kind === "welcome" && (
              <div className="text-center">
                <H1>Sweet Basil Free Meal Challenge</H1>
                <P>Answer a few fun questions to unlock your reward. Ready?</P>
                <Primary className="mt-6" onClick={goNext}>
                  Start
                </Primary>
              </div>
            )}

            {/* visited */}
            {step.kind === "visited" && (
              <div className="text-center">
                <H2>Have you visited Sweet Basil before?</H2>
                <div className="mt-6 flex gap-3 justify-center">
                  <Button onClick={goNext}>Yes</Button>
                  <Button onClick={goNext}>No</Button>
                </div>
              </div>
            )}

            {/* inputs */}
            {step.kind === "inputs" && (
              <div>
                <H2>Personalize your challenge</H2>
                <P className="mb-4">
                  We’ll only use this to tailor the experience.
                </P>
                <div className="grid gap-4">
                  <Labeled label="Name">
                    <input
                      className="input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />
                  </Labeled>
                  <Labeled label="Phone">
                    <input
                      className="input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone number"
                      inputMode="tel"
                    />
                  </Labeled>
                  <Labeled label="Birthday">
                    <input
                      className="input"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      type="date"
                    />
                  </Labeled>
                </div>
                <Primary
                  className="mt-6"
                  onClick={() => {
                    if (!name.trim() || !phone.trim()) {
                      setToast("Please add your name & phone to continue.");
                      return;
                    }
                    goNext();
                  }}
                >
                  Continue
                </Primary>
              </div>
            )}

            {/* favorite */}
            {step.kind === "favorite" && (
              <div className="text-center">
                <H2>What’s your favorite here at Sweet Basil?</H2>
                <div className="mt-6 grid sm:grid-cols-2 gap-3">
                  {["Thai Curry", "Dumplings", "Noodles", "Sushi"].map((f) => (
                    <Button
                      key={f}
                      onClick={() => {
                        setFavorite(f);
                        goNext();
                      }}
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* riddle */}
            {step.kind === "riddle" && (
              <RiddleCard
                onCorrect={goNext}
                onWrong={() =>
                  setToast("Hint: Think of coffee and the color in the name.")
                }
              />
            )}

            {/* choices */}
            {step.kind === "choice" && (
              <ChoiceCard
                prompt={step.prompt}
                choices={step.choices}
                explanation={step.explanation}
                onCorrect={goNext}
                onWrong={() => setToast("Not quite — try another option.")}
              />
            )}

            {/* curry */}
            {step.kind === "curry" && (
              <div className="text-center">
                <H2>Which Thai curry is your favorite?</H2>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button onClick={goNext}>🔴 Red Curry</Button>
                  <Button onClick={goNext}>🟢 Green Curry</Button>
                </div>
              </div>
            )}

            {/* findRed */}
            {step.kind === "findRed" && (
              <FindRedCard
                onCorrect={goNext}
                onWrong={() =>
                  setToast("Look for the red object right on your table.")
                }
              />
            )}

            {/* fortune */}
            {step.kind === "fortune" && (
              <FortuneCookie
                text={
                  "Your future seems bright… but the immediate future is even brighter."
                }
                onDone={goNext}
              />
            )}

            {/* shiny */}
            {step.kind === "shiny" && (
              <div className="text-center">
                <H2>Final step</H2>
                <P>
                  To claim your grand prize, look closely around your table for
                  something <b>shiny</b> ✨
                </P>
                <audio
                  ref={audio}
                  preload="auto"
                  src="/music/in-my-life-instrumental.mp3"
                />
                <Primary
                  className="mt-6"
                  onClick={() => setFoundClicks((c) => c + 1)}
                >
                  I found it
                </Primary>
              </div>
            )}

            {/* ending */}
            {step.kind === "ending" && (
              <div className="text-center">
                <H1>Congratulations!</H1>
                <P>
                  You didn’t just win free meals — you unlocked forever. 💍❤️
                </P>
                <Button
                  className="mt-6"
                  onClick={() => (window.location.href = "/")}
                >
                  Back to Menu
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <Toast message={toast} onClear={() => setToast("")} />
      </main>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Components: Headings, Copy, Buttons, Inputs
 * ──────────────────────────────────────────────────────────────────────────── */
function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1
      className="text-3xl md:text-4xl font-semibold text-center"
      style={{ color: ACCENT }}
    >
      {children}
    </h1>
  );
}
function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-2xl md:text-3xl font-semibold text-center"
      style={{ color: ACCENT }}
    >
      {children}
    </h2>
  );
}
function P({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`mt-3 text-slate-600 text-center ${className}`}>{children}</p>
  );
}
function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      className={`px-4 py-2 rounded-lg border border-slate-300 hover:border-slate-400 transition text-sm ${className}`}
      {...rest}
    />
  );
}
function Primary(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      className={`px-4 py-2 rounded-lg text-white shadow-sm text-sm transition ${className}`}
      style={{ backgroundColor: ACCENT }}
      {...rest}
    />
  );
}
function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-slate-600">{label}</span>
      {children}
      <style jsx>{`
        .input {
          border: 1px solid #e2e8f0;
          padding: 0.6rem 0.75rem;
          border-radius: 0.5rem;
        }
        .input:focus {
          outline: none;
          border-color: ${ACCENT};
          box-shadow: 0 0 0 3px rgba(27, 63, 63, 0.1);
        }
      `}</style>
    </label>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Cards: Riddle, Choice, Find Red
 * ──────────────────────────────────────────────────────────────────────────── */
function ChoiceCard({
  prompt,
  choices,
  explanation,
  onCorrect,
  onWrong,
}: {
  prompt: string;
  choices: Choice[];
  explanation?: string;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  // If at least one choice has correct=true, enforce correctness; else accept any
  const hasKeyedCorrect = choices.some((c) => c.correct);
  return (
    <div className="text-center">
      <H2>Question</H2>
      <P>{prompt}</P>
      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {choices.map((c) => (
          <Button
            key={c.key}
            onClick={() =>
              hasKeyedCorrect
                ? c.correct
                  ? onCorrect()
                  : onWrong()
                : onCorrect()
            }
          >
            {c.label}
          </Button>
        ))}
      </div>
      {explanation && <P className="text-xs opacity-60 mt-4">{explanation}</P>}
    </div>
  );
}

function RiddleCard({
  onCorrect,
  onWrong,
}: {
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [val, setVal] = useState("");
  const isCorrect = /moody\s*blues/i.test(val.trim());
  return (
    <div>
      <H2>Riddle</H2>
      <P>
        It’s blue, but not the sky or eyes. Lots of coffee to elevate the mood.
        They say tomorrow never comes — but here it does, and it’s not so good.
        What is it?
      </P>
      <div className="mt-4 flex gap-2">
        <input
          className="input flex-1"
          placeholder="Type your answer"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
        <Primary onClick={() => (isCorrect ? onCorrect() : onWrong())}>
          Submit
        </Primary>
      </div>
    </div>
  );
}

function FindRedCard({
  onCorrect,
  onWrong,
}: {
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [val, setVal] = useState("");
  const ok = /(^|\b)lamp(s)?(\b|$)/i.test(val.trim()); // accept "lamp" / "lamps"
  return (
    <div>
      <H2>Spot something red</H2>
      <P>
        Great choice! While you’re here… can you spot something{" "}
        <b style={{ color: ACCENT }}>red</b> on your table?
      </P>
      <div className="mt-4 flex gap-2">
        <input
          className="input flex-1"
          placeholder="What is the red object? (hint: 4 letters)"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
        <Primary onClick={() => (ok ? onCorrect() : onWrong())}>Submit</Primary>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Fortune Cookie (aligned; Next enabled after reveal)
 * ──────────────────────────────────────────────────────────────────────────── */
function FortuneCookie({ text, onDone }: { text: string; onDone: () => void }) {
  const [cracked, setCracked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const crackNow = () => setCracked(true);

  return (
    <div
      className="text-center"
      data-testid="fortune-root"
      data-state={cracked ? "cracked" : "intact"}
    >
      <H2>Fortune Cookie</H2>
      <div className="mt-6 flex items-center justify-center">
        <div
          className="relative w-56 h-40 cursor-pointer select-none"
          role="button"
          aria-label="Fortune cookie"
          tabIndex={0}
          onClick={crackNow}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              crackNow();
            }
          }}
          data-testid="fortune-cookie-graphic"
          style={{ marginBottom: 16 }}
        >
          {/* left half */}
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2"
            initial={{ rotate: 0, x: 0 }}
            animate={cracked ? { rotate: -18, x: -16 } : { rotate: 0, x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <CookieHalf side="left" />
          </motion.div>
          {/* right half */}
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2"
            initial={{ rotate: 0, x: 0 }}
            animate={cracked ? { rotate: 18, x: 16 } : { rotate: 0, x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <CookieHalf side="right" />
          </motion.div>

          {/* hint icon */}
          <AnimatePresence>
            {!cracked && (
              <motion.div
                key="pulse"
                className="absolute inset-0 grid place-items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-2xl select-none">🥠</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* fortune strip */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 top-1/2"
            initial={{ y: 0, opacity: 0 }}
            animate={cracked ? { y: -64, opacity: 1 } : { y: 0, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onAnimationComplete={() => setRevealed(true)}
          >
            <div className="bg-white border border-slate-200 shadow-sm rounded px-4 py-2 text-sm max-w-xs">
              <span className="italic text-slate-700">{text}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {!cracked ? (
        <Primary data-testid="fortune-crack" onClick={crackNow}>
          Crack the cookie
        </Primary>
      ) : (
        <Primary
          data-testid="fortune-next"
          onClick={onDone}
          disabled={!revealed}
          aria-disabled={!revealed}
          className="disabled:opacity-60"
        >
          Next
        </Primary>
      )}
    </div>
  );
}

function CookieHalf({ side }: { side: "left" | "right" }) {
  const radius = side === "left" ? "rounded-l-[48px]" : "rounded-r-[48px]";
  return (
    <div
      className={`h-full bg-amber-200 ${radius} border border-amber-300 shadow-inner`}
    />
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Toast
 * ──────────────────────────────────────────────────────────────────────────── */
function Toast({ message, onClear }: { message: string; onClear: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClear, 2400);
    return () => clearTimeout(t);
  }, [message, onClear]);
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg/20">
      {message}
    </div>
  );
}
