"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, ArrowLeft, Send, Feather, BookOpen, ArrowRight, HeartHandshake } from "lucide-react";
import { INITIAL_TEACHERS, Teacher } from "../data";
import { sendBlessingsEmail } from "../actions/email";

// User's custom flower assets
const FLOWER_ASSETS = [
  { src: "/flowers/flower-pink.png", alt: "Pink Blossom" },
  { src: "/flowers/flower-blue.png", alt: "Blue Blossom" },
  { src: "/flowers/flower-daisy.png", alt: "Daisy Blossom" },
  { src: "/flowers/flower-lotus-blue.png", alt: "Royal Blue Lotus" }
];

// 1. Initial Grand Burst Flowers (Start mein ek saath bohot saare flowers - Instant!)
const INITIAL_BURST_FLOWERS = Array.from({ length: 48 }, (_, i) => ({
  id: `burst-${i}`,
  x: (i * 2.1) % 98,
  yStart: -8 - (i % 4) * 6, // Just above viewport (-8% to -26%) so they enter IMMEDIATELY!
  delay: (i * 0.012) % 0.4, // Almost zero delay (0s to 0.4s max!)
  duration: 3.2 + ((i * 0.18) % 1.5), // 3.2s to 4.7s
  size: 24 + (i % 4) * 6, // 24px to 42px
  rotation: (i * 53) % 360,
  src: FLOWER_ASSETS[i % FLOWER_ASSETS.length].src
}));

// 2. Slow Ambient Flowers (Baad mein kam flowers aur bohot slow/peaceful)
const SLOW_AMBIENT_FLOWERS = Array.from({ length: 12 }, (_, i) => ({
  id: `ambient-${i}`,
  x: (i * 8.3 + 4) % 94,
  yStart: -10,
  delay: 2.8 + (i * 0.65), // Starts after the burst
  duration: 8.0 + ((i * 0.4) % 3.0), // Very slow and soothing (8s - 11s)
  size: 20 + (i % 3) * 5, // 20px to 30px (subtle)
  rotation: (i * 67) % 360,
  src: FLOWER_ASSETS[i % FLOWER_ASSETS.length].src
}));

// Dignified blessings presets paired with flower accents
const PRESET_BLESSINGS = [
  {
    title: "Ayushman Bhava",
    sanskritTag: "दीर्घायुः भव",
    flowerImg: "/flowers/flower-pink.png",
    text: "Ayushman Bhava. May you achieve wisdom, good health, and success in life."
  },
  {
    title: "Jnana & Buddhi",
    sanskritTag: "ज्ञानं सद्बुद्धिः",
    flowerImg: "/flowers/flower-blue.png",
    text: "May Bhagwan Shri Krishna illuminate your intellect and guide your path."
  },
  {
    title: "Kalyanamastu",
    sanskritTag: "कल्याणमस्तु",
    flowerImg: "/flowers/flower-daisy.png",
    text: "Always remain curious, humble, and dedicated. My warmest blessings are with you."
  },
  {
    title: "Yashasvi Bhava",
    sanskritTag: "यशस्वी भव",
    flowerImg: "/flowers/flower-lotus-blue.png",
    text: "May the wisdom of the Gita inspire you toward selfless excellence."
  }
];

function JanmashtamiTributeContent() {
  const searchParams = useSearchParams();
  const teacherId = searchParams.get("id") || searchParams.get("teacher") || "7";

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);
  const [selectedBlessing, setSelectedBlessing] = useState<string>("");
  const [customBlessing, setCustomBlessing] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [hasSent, setHasSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const found = INITIAL_TEACHERS.find(t => t.id === teacherId) || INITIAL_TEACHERS.find(t => t.id === "7") || INITIAL_TEACHERS[0];
    setTeacher(found);
  }, [teacherId]);

  const handleOpenEnvelope = () => {
    setIsEnvelopeOpened(true);
  };

  const handleSelectPreset = (text: string) => {
    setSelectedBlessing(text);
    setCustomBlessing(text);
  };

  const handleSendBlessings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;
    const finalBlessing = customBlessing.trim() || selectedBlessing.trim();
    if (!finalBlessing) {
      setErrorMsg("Please select a blessing or type your words.");
      return;
    }

    setIsSending(true);
    setErrorMsg(null);

    try {
      const result = await sendBlessingsEmail({
        teacherName: teacher.salutation || teacher.name,
        teacherEmail: teacher.contactEmail,
        designation: teacher.designation,
        subject: teacher.subject,
        college: teacher.college,
        blessingsText: finalBlessing,
        studentEmail: "sharmaeditzayush@gmail.com"
      });

      if (result.success) {
        setHasSent(true);
      } else {
        setErrorMsg("Could not dispatch blessing email. Please try again.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error sending blessings";
      setErrorMsg(msg);
    } finally {
      setIsSending(false);
    }
  };

  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffdf5] text-amber-900">
        <div className="animate-pulse text-xs font-serif">Loading sacred tribute...</div>
      </div>
    );
  }

  const tName = teacher.salutation || teacher.name;

  return (
    <div className="min-h-screen bg-[#fffdf5] text-amber-955 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-amber-200 selection:text-amber-955 relative overflow-hidden">
      
      {/* Subtle traditional parchment background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#b45309_0.75px,transparent_0.75px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

      {/* ============================================================ */}
      {/* REAL USER FLOWER ICONS CASCADE (PUSHP VRISHTI)               */}
      {/* ============================================================ */}
      {isEnvelopeOpened && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {/* Wave 1: Immediate Grand Burst (Start mein ek saath bohot saare flowers!) */}
          {INITIAL_BURST_FLOWERS.map((flower, idx) => (
            <motion.div
              key={flower.id}
              initial={{
                top: `${flower.yStart}%`,
                left: `${flower.x}%`,
                opacity: 0,
                rotate: flower.rotation,
                scale: 0.85
              }}
              animate={{
                top: "115%",
                left: `${flower.x + (idx % 2 === 0 ? 6 : -6)}%`,
                opacity: [0, 1, 1, 0],
                rotate: flower.rotation + 360,
                scale: [0.85, 1, 0.9]
              }}
              transition={{
                duration: flower.duration,
                delay: flower.delay,
                repeat: 0,
                ease: "easeOut"
              }}
              className="absolute drop-shadow-sm"
              style={{ width: flower.size, height: flower.size }}
            >
              <Image
                src={flower.src}
                alt="Flower Blossom"
                width={flower.size}
                height={flower.size}
                className="w-full h-full object-contain pointer-events-none select-none"
                unoptimized
              />
            </motion.div>
          ))}

          {/* Wave 2: Slow Ambient Shower (Baad mein kam flowers aur bohot slow) */}
          {SLOW_AMBIENT_FLOWERS.map((flower, idx) => (
            <motion.div
              key={flower.id}
              initial={{
                top: `${flower.yStart}%`,
                left: `${flower.x}%`,
                opacity: 0,
                rotate: flower.rotation,
                scale: 0.8
              }}
              animate={{
                top: "115%",
                left: `${flower.x + (idx % 2 === 0 ? 4 : -4)}%`,
                opacity: [0, 0.85, 0.85, 0],
                rotate: flower.rotation + 240,
                scale: [0.8, 0.95, 0.8]
              }}
              transition={{
                duration: flower.duration,
                delay: flower.delay,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute drop-shadow-xs"
              style={{ width: flower.size, height: flower.size }}
            >
              <Image
                src={flower.src}
                alt="Flower Blossom"
                width={flower.size}
                height={flower.size}
                className="w-full h-full object-contain pointer-events-none select-none"
                unoptimized
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Top Navigation */}
      <header className="w-full max-w-md flex items-center justify-between mb-3 z-20">
        <Link 
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-amber-900 hover:text-amber-955 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-full transition-all shadow-2xs"
        >
          <ArrowLeft size={12} />
          <span>Smriti Wall</span>
        </Link>

        <span className="text-[11px] font-serif font-bold text-amber-800 bg-amber-100/60 border border-amber-200/70 px-3 py-1 rounded-full flex items-center gap-1">
          <Sparkles size={11} className="text-amber-600" />
          <span>Janmashtami 2026</span>
        </span>
      </header>

      <main className="w-full max-w-md z-20">
        <AnimatePresence mode="wait">
          
          {/* ============================================================ */}
          {/* STEP 1: COMPACT SEALED PARCHMENT ENVELOPE                    */}
          {/* ============================================================ */}
          {!isEnvelopeOpened ? (
            <motion.div
              key="envelope"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, y: -15 }}
              transition={{ duration: 0.35 }}
              className="w-full bg-white border-2 border-amber-300 rounded-2xl shadow-xl p-6 sm:p-7 text-center relative overflow-hidden"
            >
              {/* Corner Filigree */}
              <div className="absolute top-2.5 left-2.5 border-t-2 border-l-2 border-amber-400 w-5 h-5 rounded-tl-sm pointer-events-none" />
              <div className="absolute top-2.5 right-2.5 border-t-2 border-r-2 border-amber-400 w-5 h-5 rounded-tr-sm pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 border-b-2 border-l-2 border-amber-400 w-5 h-5 rounded-bl-sm pointer-events-none" />
              <div className="absolute bottom-2.5 right-2.5 border-b-2 border-r-2 border-amber-400 w-5 h-5 rounded-br-sm pointer-events-none" />

              <div className="border border-dashed border-amber-300 p-6 rounded-xl space-y-4 bg-gradient-to-b from-[#fffefc] to-[#fefcf6]">
                
                {/* Teacher's Portrait Frame */}
                <div className="flex justify-center">
                  <div className="relative w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 shadow-md">
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-amber-100 to-amber-250 flex items-center justify-center border-2 border-white">
                      {teacher.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={teacher.photo}
                          alt={teacher.name}
                          className="w-full h-full object-cover relative z-10"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ) : null}
                      <span className="absolute z-0 font-serif text-2xl font-bold text-amber-900">
                        {teacher.initials}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-700 block">
                    Special Tribute Envelope
                  </span>
                  <h1 className="font-serif text-2xl font-bold text-amber-955 leading-tight">
                    Respected {tName}
                  </h1>
                  <p className="text-xs text-amber-900/80 font-serif">
                    {teacher.designation} &bull; {teacher.subject}
                  </p>
                </div>

                <p className="text-xs text-amber-900/85 leading-relaxed font-serif italic py-1 border-y border-amber-200/60 max-w-xs mx-auto">
                  &ldquo;A sacred tribute of gratitude has been prepared for you on Shri Krishna Janmashtami.&rdquo;
                </p>

                <div className="pt-1 space-y-2">
                  <button
                    type="button"
                    onClick={handleOpenEnvelope}
                    className="w-full py-3 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-800 hover:to-amber-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Unseal &amp; Open Tribute</span>
                    <ArrowRight size={13} />
                  </button>

                  <div className="text-[10px] text-amber-800/70 font-serif">
                    From your student: <strong className="text-amber-955">Ayush Sharma</strong>
                  </div>
                </div>

              </div>
            </motion.div>
          ) : (
            
            /* ============================================================ */
            /* STEP 2: SUPER COMPACT WISHES LETTER & DIRECT BLESSINGS CARD  */
            /* ============================================================ */
            <motion.div
              key="wishes"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full bg-white border-2 border-amber-300 rounded-2xl shadow-xl p-5 sm:p-6 space-y-4 relative overflow-hidden"
            >
              {/* Corner Filigree */}
              <div className="absolute top-2.5 left-2.5 border-t-2 border-l-2 border-amber-400 w-4 h-4 rounded-tl-sm pointer-events-none" />
              <div className="absolute top-2.5 right-2.5 border-t-2 border-r-2 border-amber-400 w-4 h-4 rounded-tr-sm pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 border-b-2 border-l-2 border-amber-400 w-4 h-4 rounded-bl-sm pointer-events-none" />
              <div className="absolute bottom-2.5 right-2.5 border-b-2 border-r-2 border-amber-400 w-4 h-4 rounded-br-sm pointer-events-none" />

              {/* Compact Header */}
              <div className="text-center space-y-1 border-b border-amber-100 pb-3">
                <h2 className="font-serif text-2xl font-bold text-amber-955">
                  Happy Janmashtami
                </h2>
                <p className="text-[11px] text-amber-800 font-serif italic">
                  Dedicated in reverence to <strong>{tName}</strong>
                </p>
              </div>

              {/* Short & Sweet Student Message (Compact 3 lines) */}
              <div className="bg-[#fffdf8] border-l-3 border-amber-500 p-3.5 rounded-r-xl space-y-2 text-xs leading-relaxed text-amber-950 font-serif">
                <p>
                  Respected <strong>{tName}</strong>, on this sacred Janmashtami, I offer my humble pranam. Just as Bhagwan Shri Krishna guided Arjuna with divine wisdom, your mentorship and guidance have illuminated my academic journey.
                </p>
                <div className="flex items-center justify-between text-[11px] text-amber-800 font-sans pt-1 border-t border-amber-200/50">
                  <span>Wishing you &amp; family peace and joy.</span>
                  <span className="font-bold text-amber-955">— Ayush Sharma</span>
                </div>
              </div>

              {/* 1-Line Gita Lesson Card */}
              {teacher.gitaLesson && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 flex items-start gap-2 text-[11px]">
                  <BookOpen size={13} className="text-amber-700 shrink-0 mt-0.5" />
                  <p className="font-serif text-amber-955 italic leading-snug">
                    &ldquo;{teacher.gitaLesson}&rdquo;
                  </p>
                </div>
              )}

              {/* COMPACT BLESSINGS SECTION */}
              <div className="pt-2 border-t border-amber-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <HeartHandshake size={12} className="text-amber-700" />
                    <span>Send Your Blessings</span>
                  </span>
                </div>

                {hasSent ? (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 text-center space-y-1 animate-in fade-in zoom-in">
                    <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                      <CheckCircle2 size={16} />
                    </div>
                    <h4 className="font-serif text-xs font-bold text-emerald-950">
                      Pranam {tName}, Blessings Received!
                    </h4>
                    <p className="text-[10px] text-emerald-800 max-w-xs mx-auto">
                      Your sacred blessings have been delivered to Ayush Sharma&apos;s email inbox with deepest gratitude.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSendBlessings} className="space-y-2.5">
                    
                    {/* 4 Compact Preset Pills (2x2 grid with user's flower icons) */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {PRESET_BLESSINGS.map((preset, idx) => {
                        const isSelected = selectedBlessing === preset.text;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectPreset(preset.text)}
                            className={`text-left px-2.5 py-1.5 rounded-lg border text-[11px] transition-all cursor-pointer flex items-center gap-2 ${
                              isSelected
                                ? "bg-amber-200 border-amber-500 font-semibold shadow-2xs text-amber-955"
                                : "bg-amber-50/50 border-amber-200 text-amber-900 hover:bg-amber-100"
                            }`}
                          >
                            <div className="w-5 h-5 shrink-0 relative">
                              <Image
                                src={preset.flowerImg}
                                alt={preset.title}
                                width={20}
                                height={20}
                                className="w-full h-full object-contain"
                                unoptimized
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-serif font-bold leading-none truncate">{preset.title}</div>
                              <div className="text-[9px] text-amber-700/80 font-sans mt-0.5 truncate">{preset.sanskritTag}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Single-line custom input */}
                    <input
                      type="text"
                      value={customBlessing}
                      onChange={(e) => setCustomBlessing(e.target.value)}
                      placeholder="Or type personal advice / blessings here..."
                      className="w-full bg-[#fffdfa] border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-955 placeholder-amber-800/40 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                    />

                    {errorMsg && (
                      <p className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 p-1.5 rounded-md text-center">
                        {errorMsg}
                      </p>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSending}
                      className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSending ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Transmitting Blessings...</span>
                        </>
                      ) : (
                        <>
                          <Send size={12} />
                          <span>Send Blessings to Ayush (आशीर्वाद भेजें)</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Minimal Footer */}
              <div className="pt-2 border-t border-amber-100 text-center text-[10px] text-amber-700/60 font-serif">
                Smriti &copy; 2026 &bull; Dedicated to Marwadi University Mentors
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

    </div>
  );
}

export default function JanmashtamiTributePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fffdf5] text-amber-900">
        <div className="animate-pulse text-xs font-serif">Loading sacred tribute...</div>
      </div>
    }>
      <JanmashtamiTributeContent />
    </Suspense>
  );
}
