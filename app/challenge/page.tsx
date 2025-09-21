"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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

const FLOW_STEPS: Array<{ id: string; label: string }> = [
  { id: "welcome", label: "Welcome" },
  { id: "visited", label: "Visited" },
  { id: "inputs", label: "Details" },
  { id: "favorite", label: "Favorite" },
  { id: "riddle", label: "Riddle" },
  { id: "beyrut", label: "Beyrut" },
  { id: "jamshedpur", label: "Jamshedpur" },
  { id: "curry", label: "Curry" },
  { id: "findRed", label: "Find Red" },
  { id: "bbi", label: "BBI" },
  { id: "duck", label: "Cricket" },
  { id: "fortune", label: "Fortune" },
  { id: "shiny", label: "Shiny" },
  { id: "ending", label: "Finish" },
];
function stepIndexFor(step: Screen): number {
  if (step.kind === "choice")
    return FLOW_STEPS.findIndex((s) => s.id === step.id);
  return FLOW_STEPS.findIndex((s) => s.id === step.kind);
}

/* ────────────────────────────────────────────────────────────────────────────
 * SafeImage (hide if missing to avoid sandbox crashes)
 * ──────────────────────────────────────────────────────────────────────────── */
function SafeImage({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  return (
    <img
      src={src}
      width={width}
      height={height}
      alt={alt}
      className={className}
      onError={(e) => {
        const el = e.target as HTMLImageElement;
        el.style.display = "none";
      }}
    />
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Tiny facts for fallback messages
 * ──────────────────────────────────────────────────────────────────────────── */
const FACTS: Record<string, Record<string, string>> = {
  beyrut: {
    Lebanon: "Capital: Beirut. Mezze like hummus and tabbouleh are classics.",
  },
  jamshedpur: {
    "Steel City":
      "Jamshedpur is home to Tata Steel, India’s first steel plant.",
  },
  bbi: {
    "BBI–BKK (Bangkok)":
      "BKK is Bangkok’s main IATA code; the city is famed for street food.",
    "BBI–DXB (Dubai)":
      "DXB is among the world’s busiest international airports.",
    "BBI–SIN (Singapore)":
      "SIN serves Changi—often ranked among the best airports.",
    "BBI–KUL (Kuala Lumpur)":
      "KUL is the gateway to Malaysia’s vibrant food scene.",
  },
  duck: {
    "Golden Duck or Yellow Duck": "Out on the very first ball faced.",
  },
};

/* ────────────────────────────────────────────────────────────────────────────
 * Main Page
 * ──────────────────────────────────────────────────────────────────────────── */
export default function ChallengePage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [favorite, setFavorite] = useState<string>("");

  const [step, setStep] = useState<Screen>({ kind: "welcome" });

  // Toast state (+ tone & duration)
  const [toast, setToast] = useState<string>("");
  const [toastTone, setToastTone] = useState<"default" | "success" | "error">(
    "default"
  );
  const [toastDuration, setToastDuration] = useState<number>(2400);

  // helper to show any toast
  const showToast = (
    message: string,
    tone: "default" | "success" | "error" = "default",
    duration = 2400
  ) => {
    setToastTone(tone);
    setToastDuration(duration);
    setToast(message);
  };

  // On correct, show green toast (5s) then advance
  const handleCorrect = (opts: {
    explanation?: string;
    stepId?: string;
    selectedLabel?: string;
    custom?: string;
  }) => {
    const { explanation, stepId, selectedLabel, custom } = opts;
    const msg =
      custom?.trim() ||
      (stepId && selectedLabel && FACTS[stepId]?.[selectedLabel]) ||
      (selectedLabel
        ? `Excellent choice! ${selectedLabel}.`
        : "Excellent choice!");

    showToast(msg, "success", 4000);
    setTimeout(() => {
      goNext();
    }, 4000);
  };

  // Audio
  const audio = useRef<HTMLAudioElement | null>(null);
  const armed = useRef(false); // set true just before entering shiny
  const [showControls, setShowControls] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFoundBtn, setShowFoundBtn] = useState(false);

  useEffect(() => {
    if (step.kind === "shiny") {
      setShowControls(false);
      setShowFoundBtn(false); // hide button when entering shiny

      const playTimer = setTimeout(() => {
        if (armed.current) {
          audio.current
            ?.play()
            .then(() => setIsPlaying(true))
            .catch(() => {});
        }
      }, 5000);

      const controlsTimer = setTimeout(() => setShowControls(true), 7000);

      // show “I found it” after 15s
      const foundBtnTimer = setTimeout(() => setShowFoundBtn(true), 15000);

      return () => {
        clearTimeout(playTimer);
        clearTimeout(controlsTimer);
        clearTimeout(foundBtnTimer);
      };
    }
  }, [step.kind]);

  // Keep isPlaying in sync
  const onAudioPlay = () => setIsPlaying(true);
  const onAudioPause = () => setIsPlaying(false);
  const onAudioEnded = () => setIsPlaying(false);
  const playAudio = () =>
    audio.current
      ?.play()
      .then(() => setIsPlaying(true))
      .catch(() => {});
  const pauseAudio = () => {
    audio.current?.pause();
    setIsPlaying(false);
  };
  const stopAudio = () => {
    if (audio.current) {
      audio.current.pause();
      audio.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  // Flow
  const goNext = () => {
    setToast(""); // clear any prior toast as we move on
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
          return {
            kind: "choice",
            id: "beyrut",
            prompt: "Which country is famous for hummus, falafel and shawarma?",
            choices: [
              { key: "a", label: "Iran" },
              { key: "b", label: "Jordan" },
              { key: "c", label: "Greece" },
              { key: "d", label: "Lebanon", correct: true },
            ],
            // explanation intentionally omitted to trigger fallback
          };
        case "choice": {
          if (prev.id === "beyrut") {
            return {
              kind: "choice",
              id: "jamshedpur",
              prompt:
                "Lyfe Hotels is expanding base in Jamshedpur, with the first steps laid on the 24th August. Just like Bhubaneswar is known as the 'Temple City' for its vibrant temples, Jamshedpur is famously known as ...",
              choices: [
                { key: "a", label: "Iron City" },
                { key: "b", label: "Steel City", correct: true },
                { key: "c", label: "Golden City" },
                { key: "d", label: "Diamond City" },
              ],
              explanation: "Jamshedpur is also known as Tatanagar.",
            };
          }
          if (prev.id === "jamshedpur") return { kind: "curry" };
          if (prev.id === "bbi") {
            return {
              kind: "choice",
              id: "duck",
              prompt:
                "Asia Cup 2025 is on. If a batter gets out on 0 without facing a single legal ball, it is called a diamond duck. What is it called when a batter gets out on the very first ball they face?",
              choices: [
                { key: "a", label: "Golden Duck", correct: true },
                { key: "b", label: "Green Duck" },
                { key: "c", label: "Bronze Duck" },
                { key: "d", label: "Silver Duck" },
              ],
              explanation:
                "A Golden Duck is when a batter gets out on the very first ball they face.",
            };
          }
          if (prev.id === "duck") return { kind: "fortune" };
          return prev;
        }
        case "curry":
          return { kind: "findRed" };
        case "findRed":
          // BBI (any answer is fine)
          return {
            kind: "choice",
            id: "bbi",
            prompt:
              "If you had to fly out in September, spend max 12–13 hours in a city, try their local cuisine and had to come back the next day. Your boarding pass would read",
            choices: [
              { key: "a", label: "BBI–BKK (Bangkok)", correct: true },
              { key: "b", label: "BBI–DXB (Dubai)", correct: true },
              { key: "c", label: "BBI–SIN (Singapore)", correct: true },
              { key: "d", label: "BBI–KUL (Kuala Lumpur)", correct: true },
            ],
          };
        case "fortune":
          // Arm autoplay before shiny
          armed.current = true;
          return { kind: "shiny" };
        case "shiny":
          return { kind: "ending" };
        default:
          return prev;
      }
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col text-slate-900"
      style={{
        background:
          "radial-gradient(1200px 600px at 50% -10%, #eaf3f3 0%, transparent 60%), radial-gradient(800px 400px at 100% 0%, #f6fbfb 0%, transparent 45%), #ffffff",
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <SafeImage
            src="/sweetbasi.png"
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
      <main className="max-w-2xl mx-auto px-6 py-12 flex-1">
        <Stepper index={stepIndexFor(step)} />

        <AnimatePresence mode="wait">
          <motion.div
            key={JSON.stringify(step)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl ring-1 ring-slate-200 p-8"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.95), #fff)",
              boxShadow:
                "0 8px 20px rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.03)",
            }}
          >
            {step.kind === "welcome" && (
              <div className="text-center">
                <h1
                  className="text-3xl md:text-4xl font-semibold"
                  style={{ color: ACCENT }}
                >
                  Sweet Basil Free Meal Challenge
                </h1>
                <p className="mt-3 text-slate-600">
                  Answer a few fun questions to unlock your reward. Ready?
                </p>
                <Primary className="mt-6" onClick={goNext}>
                  Start
                </Primary>
              </div>
            )}

            {step.kind === "visited" && (
              <div className="text-center">
                <h2
                  className="text-2xl md:text-3xl font-semibold"
                  style={{ color: ACCENT }}
                >
                  Have you visited Sweet Basil before?
                </h2>
                <div className="mt-6 flex gap-3 justify-center">
                  <Button onClick={goNext}>Yes</Button>
                  <Button onClick={goNext}>No</Button>
                </div>
              </div>
            )}

            {step.kind === "inputs" && (
              <div>
                <h2
                  className="text-2xl md:text-3xl font-semibold text-center"
                  style={{ color: ACCENT }}
                >
                  Personalize your challenge
                </h2>
                <p className="mt-3 text-slate-600 text-center mb-4">
                  We’ll only use this to tailor the experience.
                </p>
                <div className="grid gap-4">
                  <label className="grid gap-1 text-sm">
                    <span className="text-slate-600">Name</span>
                    <input
                      className="input p-1 border rounded"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="text-slate-600">Phone</span>
                    <input
                      className="input p-1 border rounded"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone number"
                      inputMode="tel"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="text-slate-600">Birthday</span>
                    <input
                      className="input p-1 border rounded"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      type="date"
                    />
                  </label>
                </div>
                <Primary
                  className="mt-6"
                  onClick={() => {
                    if (!name.trim() || !phone.trim()) {
                      showToast("Please add your name & phone to continue.");
                      return;
                    }
                    goNext();
                  }}
                >
                  Continue
                </Primary>
              </div>
            )}

            {step.kind === "favorite" && (
              <div className="text-center">
                <h2
                  className="text-2xl md:text-3xl font-semibold"
                  style={{ color: ACCENT }}
                >
                  What’s your favorite here at Sweet Basil?
                </h2>
                <div className="mt-6 grid gap-3">
                  <input
                    className="input p-1 border rounded"
                    value={favorite}
                    onChange={(e) => setFavorite(e.target.value)}
                    placeholder="Your favorite dish"
                  />
                  <Primary className="mt-2" onClick={goNext}>
                    Continue
                  </Primary>
                </div>
              </div>
            )}

            {step.kind === "riddle" && (
              <RiddleCard
                onCorrect={(msg) => handleCorrect({ custom: msg })}
                onWrong={() => showToast("Hint: Think of a weekday")}
              />
            )}

            {step.kind === "choice" && (
              <ChoiceCard
                prompt={step.prompt}
                choices={step.choices}
                explanation={step.explanation}
                onCorrect={(selected) =>
                  handleCorrect({
                    explanation: step.explanation,
                    stepId: step.id,
                    selectedLabel: selected.label,
                  })
                }
                onWrong={() => showToast("Not quite — try another option.")}
              />
            )}

            {step.kind === "curry" && (
              <div className="text-center">
                <h2
                  className="text-2xl md:text-3xl font-semibold"
                  style={{ color: ACCENT }}
                >
                  Which Thai curry is your favorite?
                </h2>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button onClick={goNext}>🔴 Red Curry</Button>
                  <Button onClick={goNext}>🟢 Green Curry</Button>
                </div>
              </div>
            )}

            {step.kind === "findRed" && (
              <FindRedCard
                onCorrect={(msg) => handleCorrect({ custom: msg })}
                onWrong={() =>
                  showToast("Hint: object with 4 letters that lights up")
                }
              />
            )}

            {step.kind === "fortune" && (
              <FortuneCookie
                text={
                  "Your future seems bright… but the immediate future is even brighter."
                }
                onDone={goNext}
              />
            )}

            {step.kind === "shiny" && (
              <div className="text-center">
                <h2
                  className="text-2xl md:text-3xl font-semibold"
                  style={{ color: ACCENT }}
                >
                  Final step
                </h2>
                <p className="mt-3 text-slate-600 text-center">
                  Look around your table for something <b>shiny</b> ✨
                </p>

                {/* Single audio element used for autoplay and for visible controls */}
                <audio
                  ref={audio}
                  preload="auto"
                  src="/music/in-my-life-instrumental.mp3"
                  onPlay={onAudioPlay}
                  onPause={onAudioPause}
                  onEnded={onAudioEnded}
                  controls={showControls}
                  style={{
                    transition: "opacity .4s",
                    opacity: showControls ? 1 : 0,
                    margin: "1rem auto",
                  }}
                />

                {showControls && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Button onClick={playAudio}>▶ Play</Button>
                    <Button onClick={pauseAudio}>⏸ Pause</Button>
                    <Button onClick={stopAudio}>⏹ Stop</Button>
                  </div>
                )}
                {showFoundBtn ? (
                  <Primary className="mt-6" onClick={goNext}>
                    I found it
                  </Primary>
                ) : (
                  <p className="mt-6 text-sm text-slate-500">
                    Unlocking final step…
                  </p>
                )}
              </div>
            )}

            {step.kind === "ending" && (
              <div className="text-center">
                <h1
                  className="text-3xl md:text-4xl font-semibold"
                  style={{ color: ACCENT }}
                >
                  Congratulations!
                </h1>
                <p className="mt-3 text-slate-600 text-center">
                  You didn’t just win free meals — you unlocked forever. 💍❤️
                </p>
                <Button
                  className="mt-6"
                  onClick={() => (window.location.href = "/challenge")}
                >
                  Back to Menu
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <Toast
          message={toast}
          tone={toastTone}
          duration={toastDuration}
          onClear={() => setToast("")}
        />
      </main>

      <Footer />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Subcomponents
 * ──────────────────────────────────────────────────────────────────────────── */
function Stepper({ index }: { index: number }) {
  const total = FLOW_STEPS.length;
  const pct = Math.max(0, (index / (total - 1)) * 100);
  return (
    <div className="max-w-2xl mx-auto px-6 mb-4">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Progress</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-2 mt-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: ACCENT,
            transition: "width .35s ease",
          }}
        />
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-10 color-white bg-[#1B3F3F]">
      <div className="max-w-5xl mx-auto px-6 py-8 border-t border-slate-200 grid gap-6 md:grid-cols-[1fr_auto_1fr] items-center">
        <div className="text-sm text-grey-100">
          <div className="font-medium" style={{ color: "white" }}>
            Sweet Basil
          </div>
          <div className="opacity-70 text-white">LYFE Lotels</div>
          <div className="opacity-70 text-white">Open daily · 12:00–23:00</div>
        </div>

        <div className="flex items-center justify-end -mr-6">
          <SafeImage src="/lyfewhitep.png" alt="LYFE" width={110} height={36} />
        </div>

        <div className="text-right text-xs text-slate-500">
          <a className="hover:underline" href="#">
            Privacy
          </a>
          <span className="inline-block mx-2">•</span>
          <a className="hover:underline" href="#">
            Terms
          </a>
          <div className="opacity-70 mt-1">
            © {new Date().getFullYear()} Lyfe Hotels · All rights reserved
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Buttons (kept as tiny components so we don't repeat utility classes)
 * ──────────────────────────────────────────────────────────────────────────── */
function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-lg border border-slate-300 text-sm transition hover:border-slate-400 hover:-translate-y-px active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        props.className ?? ""
      }`}
      style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.02)" }}
    />
  );
}
function Primary(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-lg text-white text-sm transition hover:brightness-95 hover:-translate-y-px active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        props.className ?? ""
      }`}
      style={{
        backgroundColor: ACCENT,
        boxShadow: "0 4px 14px rgba(27,63,63,.15)",
      }}
    />
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Screens
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
  onCorrect: (selected: Choice) => void;
  onWrong: () => void;
}) {
  const hasKeyedCorrect = choices.some((c) => c.correct);
  return (
    <div className="text-center">
      <h2
        className="text-2xl md:text-3xl font-semibold"
        style={{ color: ACCENT }}
      >
        Question
      </h2>
      <p className="mt-3 text-slate-600 text-center">{prompt}</p>
      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {choices.map((c) => (
          <Button
            key={c.key}
            onClick={() =>
              hasKeyedCorrect
                ? c.correct
                  ? onCorrect(c)
                  : onWrong()
                : onCorrect(c)
            }
          >
            {c.label}
          </Button>
        ))}
      </div>
      {explanation && (
        <p className="text-center text-xs mt-4 text-slate-500">{explanation}</p>
      )}
    </div>
  );
}

function RiddleCard({
  onCorrect,
  onWrong,
}: {
  onCorrect: (msg: string) => void;
  onWrong: () => void;
}) {
  const [val, setVal] = useState("");
  const isCorrect = /monday/i.test(val.trim());
  return (
    <div>
      <h2
        className="text-2xl md:text-3xl font-semibold text-center"
        style={{ color: ACCENT }}
      >
        Riddle
      </h2>
      <p className="mt-3 text-slate-600 text-center">
        It is blue, but not the sky or in the eyes. Lots of coffee to elevate
        the mood. They say tomorrow never comes, but it does, and it is not so
        good. What is it?
      </p>
      <div className="mt-4 flex gap-2">
        <input
          className="input flex-1 p-1 border rounded"
          placeholder="Type your answer"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
        <Primary
          onClick={() =>
            isCorrect ? onCorrect("Correct — Monday blues it is!") : onWrong()
          }
        >
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
  onCorrect: (msg: string) => void;
  onWrong: () => void;
}) {
  const [val, setVal] = useState("");
  const ok = /(^|\b)lamp(s)?(\b|$)/i.test(val.trim()); // accept lamp / lamps
  return (
    <div>
      <h2
        className="text-2xl md:text-3xl font-semibold text-center"
        style={{ color: ACCENT }}
      >
        Spot something red
      </h2>
      <p className="mt-3 text-slate-600 text-center">
        Great choice! While you’re here… can you spot something{" "}
        <b style={{ color: ACCENT }}>red</b> on your table?
      </p>
      <div className="mt-4 flex gap-2">
        <input
          className="input flex-1 p-1 border rounded"
          placeholder="What is the red object? (hint: 4 letters)"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
        <Primary
          onClick={() =>
            ok
              ? onCorrect("Nice spot — a lamp literally lights things up!")
              : onWrong()
          }
        >
          Submit
        </Primary>
      </div>
    </div>
  );
}

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
      <h2
        className="text-2xl md:text-3xl font-semibold text-center"
        style={{ color: ACCENT }}
      >
        Fortune Cookie
      </h2>
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
          {/* halves */}
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2"
            initial={{ rotate: 0, x: 0 }}
            animate={cracked ? { rotate: -18, x: -16 } : { rotate: 0, x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <CookieHalf side="left" />
          </motion.div>
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
          className="disabled:opacity-60 my-10"
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

function Toast({
  message,
  onClear,
  tone = "default",
  duration = 2400,
}: {
  message: string;
  onClear: () => void;
  tone?: "default" | "success" | "error";
  duration?: number;
}) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClear, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClear]);
  if (!message) return null;

  const toneClass =
    tone === "success"
      ? "bg-emerald-600"
      : tone === "error"
      ? "bg-red-600"
      : "bg-black";

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 ${toneClass} text-white text-sm px-3 py-2 rounded-lg shadow-lg/20`}
    >
      {message}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Footer / Buttons are below
 * ──────────────────────────────────────────────────────────────────────────── */

function Ending() {
  return (
    <div className="text-center">
      <h1
        className="text-3xl md:text-4xl font-semibold"
        style={{ color: ACCENT }}
      >
        Congratulations!
      </h1>
      <p className="mt-3 text-slate-600 text-center">
        You didn’t just win free meals — you unlocked forever. 💍❤️
      </p>
      <Button className="mt-6" onClick={() => (window.location.href = "/")}>
        Back to Menu
      </Button>
    </div>
  );
}
