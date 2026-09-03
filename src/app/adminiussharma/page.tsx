"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  Trash2, 
  Edit3, 
  Search, 
  LogOut, 
  Sparkles, 
  Eye, 
  ArrowLeft, 
  Clock, 
  Database,
  Calendar,
  Send,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Mail,
  UserCheck
} from "lucide-react";
import { adminGetAllWalls, adminDeleteWall, adminUpdateWall, seedAdminWall } from "../actions/wall";
import { dispatchJanmashtamiBatch, DispatchResultItem } from "../actions/email";
import { INITIAL_TEACHERS } from "../data";

export default function AdminPage() {
  // Authentication states
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");

  // Data states
  const [walls, setWalls] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Edit modal states
  const [editingWall, setEditingWall] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCreatorName, setEditCreatorName] = useState("");
  const [editVisibility, setEditVisibility] = useState("public");
  const [editTheme, setEditTheme] = useState("amber");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete modal confirmation states
  const [deletingWallId, setDeletingWallId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast alerts
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string, duration = 3000) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), duration);
  };

  // Auto-Mailer states
  const [activeAdminTab, setActiveAdminTab] = useState<"mailer" | "registry">("mailer");
  const [mailerTarget, setMailerTarget] = useState<"test_only" | "all_teachers">("test_only");
  const [selectedTeacherId, setSelectedTeacherId] = useState("5"); // default to Dr. Dhara Joshi
  const [testEmailOverride, setTestEmailOverride] = useState("sharmaeditzayush@gmail.com");
  const [scheduledDate, setScheduledDate] = useState("2026-09-04");
  const [scheduledTime, setScheduledTime] = useState("18:00");
  const [isScheduleArmed, setIsScheduleArmed] = useState(false);
  const [countdownText, setCountdownText] = useState("");
  const [isInstantSending, setIsInstantSending] = useState(false);
  const [isAutoSending, setIsAutoSending] = useState(false);
  const [deliveryLogs, setDeliveryLogs] = useState<DispatchResultItem[]>([]);
  const [customMailMessage, setCustomMailMessage] = useState(
    "On this auspicious festival of Shri Krishna Janmashtami, I reflect with profound gratitude on the eternal Guru-Shishya Parampara. Just as Shri Krishna illuminated Arjuna's path in the midst of uncertainty, your guidance, patience, and mentorship have shaped my academic journey. Wishing you and your family abundant peace, joy, and blessings on Janmashtami."
  );

  // Tribute Passcode Manager states
  const [currentTributePasscode, setCurrentTributePasscode] = useState("67672006");
  const [newTributePasscode, setNewTributePasscode] = useState("");
  const [isUpdatingPasscode, setIsUpdatingPasscode] = useState(false);
  const [showPasscodePlaintext, setShowPasscodePlaintext] = useState(false);

  // Load scheduler config from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("smriti_mailer_schedule");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.scheduledDate) setScheduledDate(parsed.scheduledDate);
          if (parsed.scheduledTime) setScheduledTime(parsed.scheduledTime);
          if (parsed.mailerTarget) setMailerTarget(parsed.mailerTarget);
          if (parsed.testEmailOverride) setTestEmailOverride(parsed.testEmailOverride);
          if (parsed.customMailMessage) setCustomMailMessage(parsed.customMailMessage);
          if (typeof parsed.isScheduleArmed === "boolean") setIsScheduleArmed(parsed.isScheduleArmed);
          if (Array.isArray(parsed.logs)) setDeliveryLogs(parsed.logs);
        } catch (e) {
          console.error("Failed to parse smriti_mailer_schedule:", e);
        }
      }
    }
  }, []);

  // Save schedule state changes to localStorage
  const persistScheduleState = (armed: boolean) => {
    setIsScheduleArmed(armed);
    if (typeof window !== "undefined") {
      const payload = {
        scheduledDate,
        scheduledTime,
        mailerTarget,
        testEmailOverride,
        customMailMessage,
        isScheduleArmed: armed,
        logs: deliveryLogs
      };
      localStorage.setItem("smriti_mailer_schedule", JSON.stringify(payload));
    }
  };

  // Dispatch execution handler
  const executeBatchDispatch = async (isAuto = false) => {
    if (isAuto) setIsAutoSending(true);
    else setIsInstantSending(true);

    try {
      const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const payload = {
        target: mailerTarget,
        testTeacherId: selectedTeacherId,
        testEmailOverride: mailerTarget === "test_only" ? testEmailOverride : undefined,
        senderName: "Ayush Sharma",
        senderEmail: "sharmaeditzayush@gmail.com",
        customMessage: customMailMessage,
        baseUrl: currentOrigin
      };

      let res: any;
      try {
        // Use direct HTTP API route (immune to Server Action hash mismatch on Vercel)
        const apiResponse = await fetch("/api/cron/janmashtami-mailer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        res = await apiResponse.json();
      } catch {
        // Fallback to Server Action
        res = await dispatchJanmashtamiBatch(payload);
      }

      if (res.results && res.results.length > 0) {
        setDeliveryLogs(prev => {
          const updated = [...res.results, ...prev];
          if (typeof window !== "undefined") {
            const saved = localStorage.getItem("smriti_mailer_schedule") || "{}";
            try {
              const parsed = JSON.parse(saved);
              parsed.logs = updated;
              localStorage.setItem("smriti_mailer_schedule", JSON.stringify(parsed));
            } catch (e) {}
          }
          return updated;
        });
      }

      if (res.success) {
        triggerToast(`Dispatched ${res.totalSent} of ${res.totalTargeted} gratitude emails!`);
      } else {
        triggerToast(res.error || "Batch execution finished with errors.");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error triggering batch email dispatch.");
    } finally {
      setIsInstantSending(false);
      setIsAutoSending(false);
    }
  };

  // Fetch current tribute passcode from server and localStorage
  const fetchCurrentTributePasscode = async () => {
    if (typeof window !== "undefined") {
      const savedPass = localStorage.getItem("smriti_tribute_passcode");
      if (savedPass) {
        setCurrentTributePasscode(savedPass);
      }
    }
    try {
      const res = await fetch("/api/tribute-passcode");
      const data = await res.json();
      if (data?.passcode) {
        setCurrentTributePasscode(data.passcode);
        if (typeof window !== "undefined") {
          localStorage.setItem("smriti_tribute_passcode", data.passcode);
        }
      }
    } catch (e) {
      // Gracefully maintain cached/local passcode
    }
  };

  useEffect(() => {
    fetchCurrentTributePasscode();
  }, [isAuthenticated]);

  // Update tribute passcode handler
  const handleUpdateTributePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newTributePasscode.trim();
    if (!cleanCode || cleanCode.length < 4) {
      triggerToast("Passcode must be at least 4 characters long.");
      return;
    }

    setIsUpdatingPasscode(true);
    try {
      // 1. Immediately persist to localStorage for instant client-side update
      if (typeof window !== "undefined") {
        localStorage.setItem("smriti_tribute_passcode", cleanCode);
      }
      setCurrentTributePasscode(cleanCode);
      setNewTributePasscode("");

      // 2. Sync to server API in background
      try {
        const effectiveEmail = adminEmail || (typeof window !== "undefined" ? sessionStorage.getItem("smriti_admin_email") : "") || "sharmaeditzayush@gmail.com";
        const effectivePass = adminPass || (typeof window !== "undefined" ? sessionStorage.getItem("smriti_admin_pass") : "") || "Ayush@20061029";

        await fetch("/api/tribute-passcode", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: effectiveEmail,
            pass: effectivePass,
            newPasscode: cleanCode
          })
        });
      } catch (syncErr) {
        console.warn("API sync notice:", syncErr);
      }

      triggerToast(`Passcode updated to "${cleanCode}" successfully! 🔐`);
    } catch (err: any) {
      triggerToast(err?.message || "Error updating passcode.");
    } finally {
      setIsUpdatingPasscode(false);
    }
  };

  // Live Countdown & Auto-Trigger Timer
  useEffect(() => {
    if (!isScheduleArmed) {
      setCountdownText("");
      return;
    }

    const checkTimer = async () => {
      const targetDateTimeStr = `${scheduledDate}T${scheduledTime}:00`;
      const targetTime = new Date(targetDateTimeStr).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        persistScheduleState(false);
        setCountdownText("Target time reached! Dispatching auto-mailer now...");
        await executeBatchDispatch(true);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdownText(
          `${String(hours).padStart(2, "0")}h : ${String(minutes).padStart(2, "0")}m : ${String(seconds).padStart(2, "0")}s remaining`
        );
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [isScheduleArmed, scheduledDate, scheduledTime, mailerTarget, testEmailOverride, customMailMessage]);

  // Check session storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = sessionStorage.getItem("smriti_admin_email");
      const savedPass = sessionStorage.getItem("smriti_admin_pass");
      if (savedEmail === "sharmaeditzayush@gmail.com" && savedPass === "Ayush@20061029") {
        setAdminEmail(savedEmail);
        setAdminPass(savedPass);
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Fetch walls when authenticated
  useEffect(() => {
    if (isAuthenticated && adminEmail && adminPass) {
      loadWalls();
    }
  }, [isAuthenticated, adminEmail, adminPass]);

  const loadWalls = async () => {
    setIsLoading(true);
    try {
      const res = await adminGetAllWalls(adminEmail, adminPass);
      if (res.success && res.walls) {
        setWalls(res.walls);
      } else {
        triggerToast(res.error || "Failed to load database walls.");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error connecting to server actions.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Admin Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = "sharmaeditzayush@gmail.com";
    const targetPass = "Ayush@20061029";

    if (emailInput.trim() === targetEmail && passwordInput === targetPass) {
      setAdminEmail(targetEmail);
      setAdminPass(targetPass);
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("smriti_admin_email", targetEmail);
        sessionStorage.setItem("smriti_admin_pass", targetPass);
      }
      triggerToast("Access Authorized. Welcome, Admin!");
    } else {
      triggerToast("Invalid credentials! Access Denied.");
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminEmail("");
    setAdminPass("");
    setEmailInput("");
    setPasswordInput("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("smriti_admin_email");
      sessionStorage.removeItem("smriti_admin_pass");
    }
    triggerToast("Logged out successfully.");
  };

  // Handle Wall Deletion
  const handleDeleteConfirm = async () => {
    if (!deletingWallId) return;
    setIsDeleting(true);
    try {
      const res = await adminDeleteWall(adminEmail, adminPass, deletingWallId);
      if (res.success) {
        triggerToast("Tribute Wall deleted permanently.");
        setDeletingWallId(null);
        loadWalls();
      } else {
        triggerToast(res.error || "Deletion failed.");
      }
    } catch (err) {
      console.error(err);
      triggerToast("An error occurred during deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Wall Update
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWall) return;
    setIsUpdating(true);
    try {
      const res = await adminUpdateWall(adminEmail, adminPass, editingWall, {
        title: editTitle.trim(),
        creator_name: editCreatorName.trim(),
        visibility: editVisibility,
        theme: editTheme
      });

      if (res.success) {
        triggerToast("Tribute Wall updated successfully.");
        setEditingWall(null);
        loadWalls();
      } else {
        triggerToast(res.error || "Failed to update wall details.");
      }
    } catch (err) {
      console.error(err);
      triggerToast("An error occurred during update.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Triggers the server action to seed the Admin Favorite Wall
  const handleSeedAdminWall = async () => {
    setIsSeeding(true);
    try {
      const res = await seedAdminWall(adminEmail, adminPass);
      if (res.success) {
        triggerToast(res.message || "Admin Wall created successfully!");
        loadWalls();
      } else {
        triggerToast(res.error || "Failed to seed Admin Wall.");
      }
    } catch (err) {
      console.error(err);
      triggerToast("An error occurred during seeding.");
    } finally {
      setIsSeeding(false);
    }
  };

  // Start Edit mode details
  const startEdit = (wall: any) => {
    setEditingWall(wall.id);
    setEditTitle(wall.title);
    setEditCreatorName(wall.creator_name);
    setEditVisibility(wall.visibility || "public");
    setEditTheme(wall.theme || "amber");
  };

  // Calculations for stats
  const totalWalls = walls.length;
  const publicWalls = walls.filter(w => w.visibility === "public").length;
  const privateWalls = walls.filter(w => w.visibility === "private" || w.visibility === "password").length;

  // Filter list by search query
  const filteredWalls = searchQuery.trim()
    ? walls.filter(
        w =>
          w.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.creator_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.id?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : walls;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fffdf5] flex items-center justify-center p-6 relative select-none">
        {/* Backdrop patterns */}
        <div className="absolute inset-0 opacity-5 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[radial-gradient(#78350f_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative z-10 w-full max-w-md bg-white border border-amber-200 rounded-2xl shadow-2xl p-8 space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto text-amber-600 border border-amber-200 shadow-2xs">
              <Lock size={24} className="stroke-[1.5]" />
            </div>
            <h2 className="font-serif text-2xl font-extrabold text-amber-955">Smriti Control Center</h2>
            <p className="text-xs text-amber-800/60 leading-normal">
              Enter Administrator credentials to configure tribute walls and directories.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-amber-900/80">Admin Email</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-3 py-2 text-xs border border-amber-250 bg-white rounded-lg text-amber-955 placeholder:text-amber-800/35 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-amber-900/80">Security Password</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs border border-amber-250 bg-white rounded-lg text-amber-955 placeholder:text-amber-800/35 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Authorize Credentials
            </button>
          </form>

          <button
            onClick={() => { window.location.href = "/"; }}
            className="w-full py-2 text-center text-xs font-semibold text-amber-700/60 hover:text-amber-900 flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <ArrowLeft size={13} />
            Back to Public Sanctuary
          </button>
        </motion.div>

        {/* TOAST SYSTEM */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="fixed bottom-6 right-6 z-50 bg-amber-955 text-amber-50 px-4 py-3 rounded-xl border border-amber-900 shadow-xl flex items-center gap-2 text-xs font-semibold max-w-sm"
            >
              <Sparkles size={14} className="text-amber-400 animate-pulse" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#fffdf5] selection:bg-amber-200 selection:text-amber-900 text-amber-955 font-sans">
      
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-[#fffdf5]/85 backdrop-blur-md px-6 py-4 border-b border-amber-200 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-1.5">
          <span className="font-serif text-xl font-black tracking-wide text-amber-955">Smriti</span>
          <span className="font-serif text-xl font-normal tracking-wide text-amber-800/85 italic">Admin</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border border-amber-250 text-red-700 bg-red-50/20 hover:bg-red-50 cursor-pointer transition-colors shadow-2xs"
        >
          <LogOut size={13} />
          Revoke Session
        </button>
      </header>

      {/* DASHBOARD BODY */}
      <main className="max-w-6xl mx-auto py-12 px-6 space-y-8">
        
        {/* TOP NAVIGATION TABS */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-200/80 pb-4">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveAdminTab("mailer")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeAdminTab === "mailer"
                  ? "bg-[#78350f] text-white shadow-sm border border-[#451a03]"
                  : "bg-white text-[#78350f] hover:text-[#451a03] border-2 border-amber-300 hover:bg-amber-50"
              }`}
            >
              <Sparkles size={14} className={activeAdminTab === "mailer" ? "text-amber-200" : "text-amber-600"} />
              <span>Janmashtami Auto-Mailer</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeAdminTab === "mailer" ? "bg-amber-800 text-amber-100" : "bg-amber-100 text-amber-900"
              }`}>
                4 Sep Special
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab("registry")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeAdminTab === "registry"
                  ? "bg-[#78350f] text-white shadow-sm border border-[#451a03]"
                  : "bg-white text-[#78350f] hover:text-[#451a03] border-2 border-amber-300 hover:bg-amber-50"
              }`}
            >
              <Database size={14} className={activeAdminTab === "registry" ? "text-amber-200" : "text-amber-600"} />
              <span>Sanctuary Registry &amp; Walls</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeAdminTab === "registry" ? "bg-amber-800 text-amber-100" : "bg-amber-100 text-amber-900"
              }`}>
                {totalWalls}
              </span>
            </button>
          </div>

          <a
            href="/"
            className="text-xs font-bold text-[#78350f] hover:text-[#451a03] flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={13} />
            Back to Tribute Sanctuary
          </a>
        </div>

        {/* TAB 1: JANMASHTAMI AUTO-MAILER CONSOLE */}
        {activeAdminTab === "mailer" && (
          <div className="space-y-8">
            {/* HERO STATUS BANNER (HIGH CONTRAST SMRITI THEME) */}
            <div className="bg-white border-2 border-amber-300 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500" />
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2.5 max-w-2xl text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-400 shadow-2xs font-sans">
                      Guru-Shishya Parampara • 4 September 2026
                    </span>
                    <span className="text-xs font-bold text-amber-900">
                      Automated Tribute Engine
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1c150c] tracking-tight">
                    Janmashtami Mentor Tribute Scheduler
                  </h2>
                  <p className="text-sm text-neutral-800 leading-relaxed font-sans font-medium">
                    Schedule automated gratitude emails to your mentors for 6:00 PM today without missing, or test instant delivery with individual faculty mentors.
                  </p>
                </div>

                {/* STATUS BADGE / COUNTDOWN CLOCK */}
                <div className="w-full lg:w-auto shrink-0">
                  {isScheduleArmed ? (
                    <div className="bg-emerald-50 border-2 border-emerald-600 rounded-2xl p-5 text-center shadow-sm space-y-2 min-w-[240px]">
                      <div className="flex items-center justify-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                        </span>
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
                          Auto-Scheduler Armed
                        </span>
                      </div>
                      <div className="font-mono text-2xl font-black text-emerald-950 tracking-wider">
                        {countdownText || "Calculating..."}
                      </div>
                      <div className="text-xs text-emerald-900 font-bold">
                        Target: {scheduledDate} at {scheduledTime} IST
                      </div>
                      <button
                        type="button"
                        onClick={() => persistScheduleState(false)}
                        className="mt-2 w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
                      >
                        Disarm Scheduler
                      </button>
                    </div>
                  ) : (
                    <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-5 text-center space-y-1.5 shadow-sm min-w-[240px]">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                        Scheduler Status
                      </span>
                      <div className="font-serif text-xl font-black text-[#1c150c]">
                        Standby Mode
                      </div>
                      <p className="text-xs text-neutral-700 max-w-[210px] mx-auto leading-normal font-semibold">
                        Arm the scheduler below to activate precision auto-dispatch.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TRIBUTE PASSCODE MANAGER CARD */}
            <div className="bg-white border-2 border-amber-300 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                      <Lock size={16} />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-amber-955">
                      6 Mentors Tribute Passcode Manager
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Control the secret code required to open the 6 teachers&apos; wishings and tributes on the homepage.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                  <span className="text-[11px] font-bold text-amber-900">Current Code:</span>
                  <span className="font-mono text-xs font-black text-amber-955 tracking-wider">
                    {showPasscodePlaintext ? currentTributePasscode : "••••••••"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPasscodePlaintext(!showPasscodePlaintext)}
                    className="p-1 text-amber-700 hover:text-amber-950 transition-colors cursor-pointer"
                    title={showPasscodePlaintext ? "Hide Code" : "Show Code"}
                  >
                    <Eye size={13} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdateTributePasscode} className="flex flex-col sm:flex-row items-end gap-3 pt-1">
                <div className="flex-1 w-full space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                    Set New Passcode
                  </label>
                  <input
                    type="text"
                    value={newTributePasscode}
                    onChange={(e) => setNewTributePasscode(e.target.value)}
                    placeholder="Enter new custom passcode (e.g. 67672006)..."
                    className="w-full px-3.5 py-2 text-xs border border-amber-300 rounded-lg text-amber-955 bg-white font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPasscode || !newTributePasscode.trim()}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-800 hover:to-amber-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Lock size={12} />
                  <span>{isUpdatingPasscode ? "Saving..." : "Update Passcode"}</span>
                </button>
              </form>
            </div>

            {/* CONFIGURATION GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT: TIMING & TARGET SETTINGS */}
              <div className="lg:col-span-6 bg-[#fffdfa] border border-amber-200 p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
                <div className="border-b border-amber-100 pb-3">
                  <h3 className="font-serif text-lg font-bold text-amber-955 flex items-center gap-2">
                    <Clock size={16} className="text-amber-700" />
                    Target Mentors &amp; Timing
                  </h3>
                  <p className="text-xs text-amber-800/60 mt-0.5">
                    Select who receives the emails and set the exact delivery schedule.
                  </p>
                </div>

                {/* 1. Target Selector */}
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                    1. Select Recipients
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      onClick={() => setMailerTarget("test_only")}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-1 ${
                        mailerTarget === "test_only"
                          ? "bg-blue-50/70 border-blue-600/60 text-blue-955 shadow-2xs"
                          : "bg-white border-amber-200/80 text-amber-900/80 hover:bg-amber-50/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">Single Mentor</span>
                        <input
                          type="radio"
                          name="mailerTarget"
                          checked={mailerTarget === "test_only"}
                          onChange={() => setMailerTarget("test_only")}
                          className="accent-[#1e3a5f]"
                        />
                      </div>
                      <span className="text-[11px] text-blue-900/70">
                        Selected from dropdown below
                      </span>
                    </label>

                    <label
                      onClick={() => setMailerTarget("all_teachers")}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-1 ${
                        mailerTarget === "all_teachers"
                          ? "bg-amber-50 border-amber-600 text-amber-955 shadow-2xs"
                          : "bg-white border-amber-200/80 text-amber-900/80 hover:bg-amber-50/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">All Faculty Mentors</span>
                        <input
                          type="radio"
                          name="mailerTarget"
                          checked={mailerTarget === "all_teachers"}
                          onChange={() => setMailerTarget("all_teachers")}
                          className="accent-amber-800"
                        />
                      </div>
                      <span className="text-[11px] text-amber-900/70">
                        All 6 Faculty Profiles in Smriti
                      </span>
                    </label>
                  </div>

                  {/* Test Email Override Input */}
                  {mailerTarget === "test_only" && (
                    <div className="pt-2 space-y-2.5">
                      {/* Teacher Selector for Tribute Card */}
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block mb-1">
                          Select Mentor for Tribute &amp; Card:
                        </label>
                        <select
                          value={selectedTeacherId}
                          onChange={(e) => {
                            const id = e.target.value;
                            setSelectedTeacherId(id);
                            const t = INITIAL_TEACHERS.find(x => x.id === id);
                            if (t) {
                              triggerToast(`Selected: ${t.salutation || t.name}`);
                            }
                          }}
                          className="w-full px-3 py-2 text-xs border border-amber-300 bg-white rounded-lg text-amber-955 font-serif font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                        >
                          {INITIAL_TEACHERS.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.salutation || t.name} — {t.subject} ({t.designation})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-blue-950 block mb-1">
                          Test Delivery Email (Your Personal Inbox or Mentor Email)
                        </label>
                        <div className="relative">
                          <Mail size={14} className="absolute left-3 top-3 text-blue-800/50" />
                          <input
                            type="email"
                            value={testEmailOverride}
                            onChange={(e) => setTestEmailOverride(e.target.value)}
                            placeholder="sharmaeditzayush@gmail.com"
                            className="w-full pl-9 pr-3 py-2 text-xs border border-blue-200 bg-blue-50/30 rounded-lg text-blue-950 focus:outline-hidden focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                      </div>

                      {/* Quick recipient chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] text-blue-900/70 font-semibold self-center">Quick Targets:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setTestEmailOverride("sharmasldayush@gmail.com");
                            triggerToast("Target set to sharmasldayush@gmail.com");
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-mono transition-colors cursor-pointer ${
                            testEmailOverride === "sharmasldayush@gmail.com"
                              ? "bg-blue-600 text-white border-blue-700"
                              : "bg-blue-100/60 text-blue-900 border-blue-200 hover:bg-blue-200/60"
                          }`}
                        >
                          sharmasldayush@gmail.com
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTestEmailOverride("sharmaeditzayush@gmail.com");
                            triggerToast("Target set to sharmaeditzayush@gmail.com");
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-mono transition-colors cursor-pointer ${
                            testEmailOverride === "sharmaeditzayush@gmail.com"
                              ? "bg-blue-600 text-white border-blue-700"
                              : "bg-blue-100/60 text-blue-900 border-blue-200 hover:bg-blue-200/60"
                          }`}
                        >
                          sharmaeditzayush@gmail.com
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTeacherId("5");
                            setTestEmailOverride("dhara.joshi@marwadieducation.edu.in");
                            triggerToast("Target set to Dhara Mam's official email!");
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-mono transition-colors cursor-pointer ${
                            testEmailOverride === "dhara.joshi@marwadieducation.edu.in"
                              ? "bg-blue-600 text-white border-blue-700"
                              : "bg-amber-100/80 text-amber-955 border-amber-300 hover:bg-amber-200/80"
                          }`}
                        >
                          dhara.joshi@marwadieducation.edu.in
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTeacherId("6");
                            setTestEmailOverride("kajalben.tanchak@marwadieducation.edu.in");
                            triggerToast("Target set to Kajal Mam's official email!");
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-mono transition-colors cursor-pointer ${
                            testEmailOverride === "kajalben.tanchak@marwadieducation.edu.in"
                              ? "bg-blue-600 text-white border-blue-700"
                              : "bg-amber-100/80 text-amber-955 border-amber-300 hover:bg-amber-200/80"
                          }`}
                        >
                          kajalben.tanchak@marwadieducation.edu.in
                        </button>
                      </div>

                      <p className="text-[10px] text-blue-800/70 mt-1.5">
                        Send to any email above for verification, or select &quot;All Faculty Mentors&quot; to send to all professors!
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Date & Time Scheduler */}
                <div className="space-y-3 pt-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                    2. Dispatch Schedule
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-amber-800/70 block mb-1">
                        Scheduled Date
                      </label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-amber-250 bg-white rounded-lg text-amber-955 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-amber-800/70 block mb-1">
                        Exact Time (IST)
                      </label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-amber-250 bg-white rounded-lg text-amber-955 focus:outline-hidden font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[10px] font-bold uppercase text-amber-800/60">Presets:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setScheduledDate("2026-09-04");
                        setScheduledTime("18:00");
                        triggerToast("Set schedule to Today 6:00 PM!");
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-amber-100 hover:bg-amber-200/80 text-amber-900 border border-amber-300/80 rounded-md transition-colors cursor-pointer"
                    >
                      Today at 6:00 PM
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        now.setMinutes(now.getMinutes() + 2);
                        const yyyy = now.getFullYear();
                        const mm = String(now.getMonth() + 1).padStart(2, "0");
                        const dd = String(now.getDate()).padStart(2, "0");
                        const hh = String(now.getHours()).padStart(2, "0");
                        const min = String(now.getMinutes()).padStart(2, "0");
                        setScheduledDate(`${yyyy}-${mm}-${dd}`);
                        setScheduledTime(`${hh}:${min}`);
                        triggerToast(`Preset armed for test in 2 minutes (${hh}:${min})!`);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-blue-100 hover:bg-blue-200/80 text-blue-950 border border-blue-300 rounded-md transition-colors cursor-pointer"
                    >
                      In 2 Mins (Auto Test)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        now.setSeconds(now.getSeconds() + 30);
                        const yyyy = now.getFullYear();
                        const mm = String(now.getMonth() + 1).padStart(2, "0");
                        const dd = String(now.getDate()).padStart(2, "0");
                        const hh = String(now.getHours()).padStart(2, "0");
                        const min = String(now.getMinutes()).padStart(2, "0");
                        setScheduledDate(`${yyyy}-${mm}-${dd}`);
                        setScheduledTime(`${hh}:${min}`);
                        triggerToast(`Preset armed for quick test (${hh}:${min})!`);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-100 hover:bg-emerald-200/80 text-emerald-950 border border-emerald-300 rounded-md transition-colors cursor-pointer"
                    >
                      Quick Test (Next Min)
                    </button>
                  </div>
                </div>

                {/* 3. Action Control Bar */}
                <div className="pt-4 border-t border-amber-100 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Instant Dispatch Button */}
                    <button
                      type="button"
                      disabled={isInstantSending || isAutoSending}
                      onClick={() => executeBatchDispatch(false)}
                      className="flex-1 py-3 px-4 bg-amber-800 hover:bg-amber-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isInstantSending ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Dispatching Mail...</span>
                        </>
                      ) : (
                        <>
                          <Send size={13} className="text-amber-200" />
                          <span>
                            {mailerTarget === "test_only" 
                              ? `Send Instant Test Mail (${testEmailOverride ? testEmailOverride.split("@")[0] : "Test"})` 
                              : "Send Instant Mail to All 6 Mentors"}
                          </span>
                        </>
                      )}
                    </button>

                    {/* Arm / Disarm Button */}
                    {isScheduleArmed ? (
                      <button
                        type="button"
                        onClick={() => persistScheduleState(false)}
                        className="py-3 px-5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Square size={13} />
                        <span>Cancel Schedule</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          persistScheduleState(true);
                          triggerToast(`Scheduler armed for ${scheduledDate} at ${scheduledTime} IST!`);
                        }}
                        className="py-3 px-5 bg-[#091322] hover:bg-[#1e3a5f] text-yellow-400 border border-yellow-500/50 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play size={13} className="text-yellow-400 fill-yellow-400" />
                        <span>Arm Scheduler</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: MESSAGE PERSONALIZATION & LIVE PREVIEW */}
              <div className="lg:col-span-6 bg-[#fffdfa] border border-amber-200 p-6 sm:p-8 rounded-2xl shadow-xs space-y-5">
                <div className="border-b border-amber-100 pb-3">
                  <h3 className="font-serif text-lg font-bold text-amber-955 flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-700" />
                    Gratitude Message & Email Preview
                  </h3>
                  <p className="text-xs text-amber-800/60 mt-0.5">
                    Personalized tribute content formatted in Janmashtami Vrindavan aesthetics.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                    Custom Tribute Message Body
                  </label>
                  <textarea
                    rows={4}
                    value={customMailMessage}
                    onChange={(e) => setCustomMailMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-amber-200 bg-white rounded-xl text-amber-955 focus:outline-hidden focus:ring-2 focus:ring-amber-400 leading-relaxed"
                  />
                </div>

                {/* Visual Preview Box */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800/70 block">
                    Recipient Inbox Preview
                  </span>
                  
                  <div className="bg-white border border-[#e8e2d5] rounded-xl overflow-hidden shadow-2xs text-xs">
                    <div className="bg-gradient-to-r from-[#091322] via-[#1e3a5f] to-[#091322] px-4 py-3.5 border-b-2 border-[#d4af37] text-center text-white">
                      <div className="text-[11px] uppercase font-bold tracking-wider text-yellow-300">
                        Shri Krishna Janmashtami • 2026
                      </div>
                    </div>

                    <div className="p-4 space-y-3 bg-[#faf9f5]">
                      <div className="space-y-1">
                        <p className="font-serif text-sm font-semibold text-[#1c150c]">
                          Respected {INITIAL_TEACHERS.find(t => t.id === selectedTeacherId)?.salutation || "Paras Shingadiya"},
                        </p>
                        {mailerTarget === "all_teachers" && (
                          <div className="inline-flex items-center gap-1 text-[10px] text-amber-900 bg-amber-100/90 border border-amber-300/70 px-2 py-0.5 rounded-full font-sans font-medium">
                            <span>✨ Note: Har teacher ko unka apna real naam jayega (e.g. Paras Shingadiya, Reshma Sunil, Dr. Dhara Joshi...)</span>
                          </div>
                        )}
                      </div>

                      <p className="text-neutral-700 leading-relaxed text-xs">
                        {customMailMessage}
                      </p>

                      <div className="bg-[#fefdf8] border-l-3 border-[#b45309] border border-[#fef3c7] p-2.5 rounded-r-lg text-amber-900 leading-relaxed text-[11px]">
                        <span className="font-bold text-[10px] text-[#92400e] block uppercase tracking-wider mb-0.5">Krishnam Vande Jagadgurum • Sacred Wisdom</span>
                        <em>&ldquo;Yogasthah kuru karmani — Perform your duty with steadfast equanimity...&rdquo;</em>
                      </div>

                      <div className="pt-2 border-t border-[#e8e2d5] text-[11px] text-neutral-600 flex items-center justify-between">
                        <span>With sincere pranam: <strong className="text-[#1c150c]">Ayush Sharma</strong></span>
                        <span className="text-neutral-400 text-[10px]">Smriti &copy; 2026</span>
                      </div>

                      <div className="pt-2 border-t border-dashed border-[#e8e2d5] text-center">
                        <span className="text-[11px] text-amber-800 underline font-serif italic">
                          View interactive Janmashtami card &amp; send blessings &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DELIVERY LOGS & AUDIT CONSOLE */}
            <div className="bg-[#fffdfa] border border-amber-200 p-6 sm:p-8 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-serif text-lg font-bold text-amber-955 flex items-center gap-2">
                    <UserCheck size={16} className="text-amber-700" />
                    Delivery Receipts & Audit Log
                  </h3>
                  <p className="text-xs text-amber-800/60 mt-0.5">
                    Real-time logs of test and automated mail dispatches.
                  </p>
                </div>

                {deliveryLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryLogs([]);
                      if (typeof window !== "undefined") {
                        const saved = localStorage.getItem("smriti_mailer_schedule") || "{}";
                        try {
                          const parsed = JSON.parse(saved);
                          parsed.logs = [];
                          localStorage.setItem("smriti_mailer_schedule", JSON.stringify(parsed));
                        } catch (e) {}
                      }
                      triggerToast("Delivery logs cleared.");
                    }}
                    className="px-3 py-1.5 text-xs text-amber-700 hover:text-amber-900 border border-amber-200 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Clear Logs
                  </button>
                )}
              </div>

              {deliveryLogs.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-amber-200 rounded-xl bg-amber-50/20">
                  <Mail className="mx-auto text-amber-400 stroke-[1.25] mb-2" size={24} />
                  <p className="text-xs text-amber-900/60 font-medium">No dispatch events recorded yet.</p>
                  <p className="text-[11px] text-amber-800/40 mt-0.5">Click &ldquo;Send Instant Test Mail&rdquo; to test live delivery!</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-amber-150 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-amber-100/50 border-b border-amber-200 text-amber-900 text-[10px] uppercase tracking-wider font-bold">
                        <th className="p-3">Mentor</th>
                        <th className="p-3">Recipient Email</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Receipt / Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100 bg-white">
                      {deliveryLogs.map((log, idx) => (
                        <tr key={idx} className="hover:bg-amber-50/40 transition-colors">
                          <td className="p-3 font-semibold text-amber-955">{log.teacherName}</td>
                          <td className="p-3 text-amber-900/80 font-mono text-[11px]">{log.recipientEmail}</td>
                          <td className="p-3">
                            {log.success ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 size={11} />
                                Delivered
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
                                <AlertCircle size={11} />
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-amber-800/60 text-[11px]">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="p-3 font-mono text-[11px] text-amber-900/70">
                            {log.messageId ? `ID: ${log.messageId}` : (log.error || "Completed")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SANCTUARY REGISTRY & WALLS */}
        {activeAdminTab === "registry" && (
          <div className="space-y-8">
            {/* STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#fffdfa] border border-amber-200 p-5 rounded-xl shadow-2xs flex items-center gap-4 text-left">
                <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-lg text-amber-700">
                  <Database size={20} className="stroke-[1.5]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800/50 block">Total Tribute Walls</span>
                  <span className="font-serif text-2xl font-black text-amber-950">{totalWalls}</span>
                </div>
              </div>

              <div className="bg-[#fffdfa] border border-amber-200 p-5 rounded-xl shadow-2xs flex items-center gap-4 text-left">
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700">
                  <Sparkles size={20} className="stroke-[1.5]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/50 block">Public Directories</span>
                  <span className="font-serif text-2xl font-black text-emerald-950">{publicWalls}</span>
                </div>
              </div>

              <div className="bg-[#fffdfa] border border-amber-200 p-5 rounded-xl shadow-2xs flex items-center gap-4 text-left">
                <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700">
                  <Lock size={20} className="stroke-[1.5]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800/50 block">Private / Locked</span>
                  <span className="font-serif text-2xl font-black text-indigo-950">{privateWalls}</span>
                </div>
              </div>
            </div>

            {/* SEARCH AND DIRECTORY SECTION */}
            <div className="bg-[#fffdfa] border border-amber-200 p-6 md:p-8 rounded-2xl shadow-xs space-y-6">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="text-left space-y-1">
                  <h3 className="font-serif text-xl font-bold text-amber-955">Sanctuary Registry</h3>
                  <p className="text-xs text-amber-800/50">Manage custom tribute walls, verify edit keys, and audit database content.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={handleSeedAdminWall}
                    disabled={isSeeding}
                    className="flex items-center justify-center gap-1.5 px-8 h-10 min-w-[200px] text-xs font-bold uppercase tracking-wider rounded-xl bg-amber-800 hover:bg-amber-900 text-white cursor-pointer transition-colors shadow-2xs disabled:opacity-50"
                  >
                    <Sparkles size={13} className="text-amber-200" />
                    <span>{isSeeding ? "Seeding..." : "Seed Admin's Wall"}</span>
                  </button>

                  {/* Registry Search */}
                  <div className="relative w-full md:max-w-xs">
                    <Search size={14} className="absolute left-3 top-[13px] text-amber-800/40 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search by Title, Creator or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 h-10 text-xs border border-amber-200 bg-white rounded-xl text-amber-955 placeholder:text-amber-800/35 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* TABLE OF WALLS */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <div className="w-6 h-6 border-2 border-amber-800 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold text-amber-800/60 uppercase tracking-widest">Accessing Secure Database...</span>
                </div>
              ) : filteredWalls.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-amber-200 rounded-xl bg-amber-50/20">
                  <p className="text-xs text-amber-800/50 font-medium">No matching tribute records found in database.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-amber-200/80 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-amber-50/80 border-b border-amber-200 text-amber-900 text-[10px] uppercase tracking-wider font-bold">
                        <th className="p-4">Tribute Wall Title</th>
                        <th className="p-4">Creator</th>
                        <th className="p-4">Theme</th>
                        <th className="p-4">Visibility</th>
                        <th className="p-4">Edit Key</th>
                        <th className="p-4">Created</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100 text-xs font-medium">
                      {filteredWalls.map((wall) => {
                        const formattedDate = wall.created_at 
                          ? new Date(wall.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "N/A";

                        return (
                          <tr key={wall.id} className="hover:bg-amber-50/30 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-amber-955">{wall.title}</div>
                              <div className="text-[10px] text-amber-800/40 font-mono">{wall.id}</div>
                            </td>

                            <td className="p-4 text-amber-900/80">
                              {wall.creator_name || "Anonymous"}
                            </td>

                            <td className="p-4 capitalize">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                wall.theme === "emerald" ? "bg-emerald-100 text-emerald-800" :
                                wall.theme === "royal" ? "bg-indigo-100 text-indigo-800" :
                                wall.theme === "mystic" ? "bg-neutral-800 text-neutral-200" :
                                wall.theme === "vrindavan" ? "bg-blue-900 text-amber-100" :
                                "bg-amber-100 text-amber-800"
                              }`}>
                                {wall.theme || "amber"}
                              </span>
                            </td>

                            <td className="p-4">
                              {wall.is_locked ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                                  <Lock size={10} /> Password
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                  {wall.visibility || "public"}
                                </span>
                              )}
                            </td>

                            <td className="p-4 font-mono text-[11px] text-amber-900/70">
                              {wall.edit_key || "None"}
                            </td>
                            
                            <td className="p-4 text-[10px] text-amber-800/60">
                              <div className="flex items-center gap-1">
                                <Clock size={10} />
                                <span>{formattedDate}</span>
                              </div>
                            </td>

                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <a
                                  href={`/?wall=${wall.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 hover:bg-amber-50 text-amber-700 hover:text-amber-900 rounded-lg transition-colors cursor-pointer"
                                  title="Preview Live Wall"
                                >
                                  <Eye size={14} />
                                </a>
                                <button
                                  onClick={() => startEdit(wall)}
                                  className="p-1.5 hover:bg-amber-50 text-amber-700 hover:text-amber-900 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Wall Metadata"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => setDeletingWallId(wall.id)}
                                  className="p-1.5 hover:bg-red-50 text-red-600 hover:text-red-800 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Permanently"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ADMIN EDIT WALL DETAILS MODAL */}
      <AnimatePresence>
        {editingWall && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingWall(null)}
              className="fixed inset-0 bg-amber-955/30 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              className="relative w-full max-w-md bg-white border border-amber-200 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 z-10 text-left"
            >
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-amber-955">Override Wall Metadata</h3>
                <p className="text-xs text-amber-800/60 leading-normal">
                  You are editing this wall with administrator privileges.
                </p>
              </div>

              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-amber-900/80">Wall Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-amber-250 bg-white rounded-lg text-amber-955 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-amber-900/80">Creator Name</label>
                  <input
                    type="text"
                    required
                    value={editCreatorName}
                    onChange={(e) => setEditCreatorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-amber-250 bg-white rounded-lg text-amber-955 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-amber-900/80">Visibility</label>
                    <select
                      value={editVisibility}
                      onChange={(e) => setEditVisibility(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-amber-250 bg-white rounded-lg text-amber-955 focus:outline-hidden"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="password">Password</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-amber-900/80">Wall Theme</label>
                    <select
                      value={editTheme}
                      onChange={(e) => setEditTheme(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-amber-250 bg-white rounded-lg text-amber-955 focus:outline-hidden"
                    >
                      <option value="amber">Amber</option>
                      <option value="emerald">Emerald</option>
                      <option value="royal">Royal</option>
                      <option value="mystic">Mystic</option>
                      <option value="vrindavan">Vrindavan</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingWall(null)}
                    className="flex-1 py-2 border border-amber-200 text-amber-950 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-amber-50 cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN PERMANENT DELETE WARNING DIALOG */}
      <AnimatePresence>
        {deletingWallId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingWallId(null)}
              className="fixed inset-0 bg-red-955/35 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              className="relative w-full max-w-sm bg-white border border-red-200 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 z-10 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-600 border border-red-150">
                <Trash2 size={22} className="stroke-[1.5] animate-bounce" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-red-900">Confirm Admin Deletion</h3>
                <p className="text-xs text-red-800/60 leading-normal">
                  You are about to permanently delete this tribute wall. All tributes and custom elements will be permanently purged from Supabase. This action is irreversible.
                </p>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeletingWallId(null)}
                  className="flex-1 py-2 border border-amber-250 text-amber-950 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-amber-50 cursor-pointer transition-all"
                >
                  Keep Wall
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? "Purging..." : "Delete Wall"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST SYSTEM */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-amber-955 text-amber-50 px-4 py-3 rounded-xl border border-amber-900 shadow-xl flex items-center gap-2 text-xs font-semibold max-w-sm"
          >
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
