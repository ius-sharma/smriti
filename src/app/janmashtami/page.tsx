"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, CheckCircle2, ArrowLeft, Send, Feather, BookOpen, Quote, ArrowRight, Mail } from "lucide-react";
import { INITIAL_TEACHERS, Teacher } from "../data";
import { sendBlessingsEmail } from "../actions/email";

// Quick-select preset blessings
const PRESET_BLESSINGS = [
  {
    icon: "🌸",
    title: "Ayushman Bhava",
    text: "Ayushman Bhava! May you achieve wisdom, excellence, and true happiness in life."
  },
  {
    icon: "🪷",
    title: "Divine Guidance",
    text: "May Bhagwan Shri Krishna illuminate your intellect and guide your noble journey."
  },
  {
    icon: "✨",
    title: "Heartfelt Wishes",
    text: "Always stay humble, curious, and dedicated. My warmest blessings are with you."
  },
  {
    icon: "🪈",
    title: "Gita Wisdom",
    text: "May the eternal wisdom of the Gita inspire you to work selflessly and excel."
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
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#d97706", "#f59e0b", "#fde047", "#1e3a8a"]
    });
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
      setErrorMsg("Please select or write a blessing message before sending.");
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
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.55 },
          colors: ["#f59e0b", "#d97706", "#10b981", "#3b82f6"]
        });
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
        <div className="animate-pulse text-sm font-serif">Loading sacred tribute...</div>
      </div>
    );
  }

  const tName = teacher.salutation || teacher.name;

  return (
    <div className="min-h-screen bg-[#fffdf5] text-amber-955 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-amber-200 selection:text-amber-900 relative">
      
      {/* Subtle Smriti parchment dot pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#b45309_0.75px,transparent_0.75px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

      {/* Top Smriti Back Link */}
      <div className="w-full max-w-lg flex items-center justify-between mb-4 z-10">
        <Link 
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-amber-850 hover:text-amber-955 font-medium bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-full transition-colors shadow-2xs"
        >
          <ArrowLeft size={13} />
          <span>Smriti Tribute Wall</span>
        </Link>

        <span className="text-[11px] font-semibold text-amber-800 flex items-center gap-1">
          <Sparkles size={12} className="text-amber-500" />
          <span>Janmashtami 2026</span>
        </span>
      </div>

      <AnimatePresence mode="wait">
        
        {/* ============================================================ */}
        {/* STEP 1: COMPACT SURPRISE ENVELOPE / SEALED TRIBUTE           */}
        {/* ============================================================ */}
        {!isEnvelopeOpened ? (
          <motion.div
            key="envelope"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-md bg-white border border-amber-250 rounded-2xl shadow-xl p-6 sm:p-8 text-center space-y-5 relative z-10 overflow-hidden"
          >
            {/* Corner flourishes */}
            <div className="absolute top-2 left-2 border-t-2 border-l-2 border-amber-300 w-5 h-5 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-2 right-2 border-t-2 border-r-2 border-amber-300 w-5 h-5 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-2 left-2 border-b-2 border-l-2 border-amber-300 w-5 h-5 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-2 right-2 border-b-2 border-r-2 border-amber-300 w-5 h-5 rounded-br-sm pointer-events-none" />

            <div className="border border-dashed border-amber-300/80 p-5 rounded-xl space-y-4 bg-[#fffdfa]">
              
              {/* Sacred Flute & Feather Badge */}
              <div className="relative flex justify-center">
                <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
                  <span className="text-2xl">🪈</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 block">
                  A Sacred Tribute Awaits You
                </span>
                <h2 className="font-serif text-2xl font-bold text-amber-955">
                  Respected {tName} Ji
                </h2>
                <p className="text-[11px] text-amber-800/70">
                  {teacher.designation} &bull; {teacher.subject}
                </p>
              </div>

              <p className="text-xs text-amber-900/80 leading-relaxed font-serif italic max-w-xs mx-auto">
                &ldquo;On this auspicious day of Shri Krishna Janmashtami, a special message of reverence has been prepared for you.&rdquo;
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleOpenEnvelope}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Open Your Janmashtami Tribute</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="text-[10px] text-amber-700/60 flex items-center justify-center gap-1 pt-1">
                <span>With pranam from</span>
                <strong className="text-amber-900 font-semibold">Ayush Sharma</strong>
              </div>
            </div>
          </motion.div>
        ) : (
          
          /* ============================================================ */
          /* STEP 2: UNFOLDED SACRED WISHES & TEACHER BLESSINGS CARD      */
          /* ============================================================ */
          <motion.div
            key="wishes"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.45 }}
            className="w-full max-w-lg bg-white border border-amber-250 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5 relative z-10 overflow-hidden"
          >
            {/* Corner flourishes */}
            <div className="absolute top-2 left-2 border-t-2 border-l-2 border-amber-300 w-5 h-5 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-2 right-2 border-t-2 border-r-2 border-amber-300 w-5 h-5 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-2 left-2 border-b-2 border-l-2 border-amber-300 w-5 h-5 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-2 right-2 border-b-2 border-r-2 border-amber-300 w-5 h-5 rounded-br-sm pointer-events-none" />

            {/* Header with Krishna badge */}
            <div className="text-center space-y-1.5 border-b border-amber-100 pb-4">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 border border-amber-200 px-3 py-0.5 rounded-full">
                <span className="text-xs">🪷</span>
                <span>The Sacred Guru-Shishya Parampara</span>
              </span>

              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-amber-955">
                Happy Janmashtami
              </h2>

              <p className="text-xs text-amber-800/80 font-serif italic">
                Dedicated with reverence to <strong>{tName} Ji</strong>
              </p>
            </div>

            {/* Personal student gratitude message */}
            <div className="bg-[#fffdf8] border-l-3 border-amber-500 p-4 rounded-r-xl space-y-2 text-xs leading-relaxed text-amber-950 font-serif">
              <p>
                Respected <strong>{tName} Ji</strong>,
              </p>
              <p className="italic text-amber-900/90 leading-relaxed">
                &ldquo;Just as Bhagwan Shri Krishna guided Arjuna with divine clarity through uncertainty, your mentorship, patience, and knowledge have illuminated my academic journey.&rdquo;
              </p>
              <p className="text-amber-850">
                Wishing you and your family abundant peace, divine health, and auspicious blessings on Janmashtami.
              </p>
              <p className="text-[11px] text-amber-700 font-sans pt-1 font-semibold">
                — Ayush Sharma (Student)
              </p>
            </div>

            {/* Sacred Gita Wisdom Quote */}
            {teacher.gitaLesson && (
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <BookOpen size={12} className="text-amber-600" />
                  <span>Krishnam Vande Jagadgurum &bull; Sacred Wisdom</span>
                </div>
                <p className="font-serif text-xs text-amber-900 italic leading-relaxed">
                  &ldquo;{teacher.gitaLesson}&rdquo;
                </p>
              </div>
            )}

            {/* TEACHER BLESSINGS SECTION */}
            <div className="pt-2 border-t border-amber-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-955 uppercase tracking-wide">
                  <Heart size={13} className="text-rose-600 fill-rose-600" />
                  <span>Send Your Blessings to Ayush</span>
                </div>
                <span className="text-[10px] text-amber-700/70">Tap a preset below</span>
              </div>

              {hasSent ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-center space-y-1.5 animate-in fade-in zoom-in">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                    <CheckCircle2 size={20} />
                  </div>
                  <h4 className="font-serif text-sm font-bold text-emerald-900">
                    Pranam {tName} Ji, Blessings Received!
                  </h4>
                  <p className="text-[11px] text-emerald-800/80 max-w-xs mx-auto">
                    Your sacred blessings have been delivered directly to Ayush&apos;s email inbox with deepest gratitude.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendBlessings} className="space-y-3">
                  
                  {/* Preset Blessing Chips */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {PRESET_BLESSINGS.map((preset, idx) => {
                      const isSelected = selectedBlessing === preset.text;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPreset(preset.text)}
                          className={`text-left p-2 rounded-lg border text-[11px] leading-tight transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? "bg-amber-100 border-amber-400 text-amber-955 font-semibold shadow-2xs"
                              : "bg-amber-50/40 border-amber-200/70 text-amber-900 hover:bg-amber-100/60"
                          }`}
                        >
                          <span className="text-sm shrink-0">{preset.icon}</span>
                          <span className="truncate">{preset.title}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Input / Custom Blessing */}
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={customBlessing}
                      onChange={(e) => setCustomBlessing(e.target.value)}
                      placeholder="Write your personal blessings or words of advice here..."
                      className="w-full bg-[#fffdfa] border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-955 placeholder-amber-900/40 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg text-center">
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
                        <span>Send Blessings (आशीर्वाद भेजें)</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-amber-100 text-center text-[10px] text-amber-700/60">
              Smriti &copy; 2026 &bull; Dedicated to Marwadi University Mentors
            </div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}

export default function JanmashtamiTributePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fffdf5] text-amber-900">
        <div className="animate-pulse text-sm font-serif">Loading sacred tribute...</div>
      </div>
    }>
      <JanmashtamiTributeContent />
    </Suspense>
  );
}
