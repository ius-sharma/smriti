"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Heart, 
  Search, 
  Plus, 
  X, 
  ChevronDown, 
  Send, 
  Mail, 
  Sparkles, 
  Clock, 
  Award,
  BookOpenCheck,
  CheckCircle2,
  ArrowLeft,
  User,
  GraduationCap,
  MessageSquare,
  Zap,
  Target,
  Sparkle,
  Book,
  ArrowRight,
  Share2,
  Lock
} from "lucide-react";
import confetti from "canvas-confetti";
import { INITIAL_TEACHERS, Teacher } from "./data";
import { sendThankYouEmail, sendBlessingsEmail } from "./actions/email";


// Native Deflate compression/decompression helpers
const compressData = async (data: any): Promise<string> => {
  try {
    const jsonStr = JSON.stringify(data);
    const stream = new Blob([jsonStr]).stream();
    // @ts-ignore
    const compressedStream = stream.pipeThrough(new CompressionStream("deflate"));
    const response = new Response(compressedStream);
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch (err) {
    console.error("Deflate compression failed, falling back to base64 JSON", err);
    return window.btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  }
};

const decompressData = async (base64: string): Promise<any> => {
  try {
    let normalized = base64.replace(/-/g, "+").replace(/_/g, "/");
    while (normalized.length % 4) normalized += "=";
    const binary = window.atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const stream = new Blob([bytes]).stream();
    // @ts-ignore
    const decompressedStream = stream.pipeThrough(new DecompressionStream("deflate"));
    const response = new Response(decompressedStream);
    const text = await response.text();
    return JSON.parse(text);
  } catch (err) {
    console.warn("Deflate decompression failed, attempting base64 fallback", err);
    try {
      return JSON.parse(decodeURIComponent(escape(window.atob(base64))));
    } catch (e) {
      throw new Error("Decoding failed");
    }
  }
};

interface Festival {
  name: string;
  nameHindi?: string;
  date: string;
  description: string;
}

const FESTIVALS: Festival[] = [
  // 2026
  { name: "Nag Panchami", nameHindi: "नाग पंचमी", date: "2026-08-17T00:00:00+05:30", description: "A sacred day of traditional worship of Nagas (snakes)." },
  { name: "Raksha Bandhan", nameHindi: "रक्षाबंधन", date: "2026-08-28T00:00:00+05:30", description: "Celebrating the sacred bond of love and protection between brothers and sisters." },
  { name: "Krishna Janmashtami", nameHindi: "कृष्ण जन्माष्टमी", date: "2026-09-03T00:00:00+05:30", description: "Celebrating the birth of Lord Krishna, the eighth incarnation of Lord Vishnu." },
  { name: "Ganesh Chaturthi", nameHindi: "गणेश चतुर्थी", date: "2026-09-14T00:00:00+05:30", description: "Celebrating the arrival of Lord Ganesha, the remover of obstacles." },
  { name: "Sharad Navratri", nameHindi: "शरद नवरात्रि", date: "2026-10-11T00:00:00+05:30", description: "Nine nights dedicated to the worship of Goddess Durga's forms." },
  { name: "Dussehra", nameHindi: "दशहरा", date: "2026-10-20T00:00:00+05:30", description: "Celebrating the victory of Lord Rama over Ravana, victory of good over evil." },
  { name: "Diwali", nameHindi: "दीपावली", date: "2026-11-08T00:00:00+05:30", description: "The festival of lights, celebrating the return of Lord Rama to Ayodhya." },
  { name: "Govardhan Puja", nameHindi: "गोवर्धन पूजा", date: "2026-11-09T00:00:00+05:30", description: "Worshipping Mount Govardhan and Lord Krishna's protection." },
  { name: "Chhath Puja", nameHindi: "छठ पूजा", date: "2026-11-14T00:00:00+05:30", description: "Ancient solar festival dedicated to the Sun God and Chhathi Maiya." },
  { name: "Kartik Purnima", nameHindi: "कार्तिक पूर्णिमा", date: "2026-11-24T00:00:00+05:30", description: "The auspicious full moon night in the holy month of Kartik." },
  // 2027
  { name: "Makar Sankranti", nameHindi: "मकर संक्रांति", date: "2027-01-14T00:00:00+05:30", description: "Harvest festival marking the sun's transition into Capricorn." },
  { name: "Vasant Panchami", nameHindi: "वसंत पंचमी", date: "2027-02-11T00:00:00+05:30", description: "Celebrating learning and wisdom, dedicated to Goddess Saraswati." },
  { name: "Maha Shivaratri", nameHindi: "महाशिवरात्रि", date: "2027-03-06T00:00:00+05:30", description: "The great night of Lord Shiva, celebrating cosmic marriage." },
  { name: "Holi", nameHindi: "होली", date: "2027-03-22T00:00:00+05:30", description: "The vibrant spring festival of colors, joy, and new beginnings." },
  { name: "Rama Navami", nameHindi: "राम नवमी", date: "2027-04-16T00:00:00+05:30", description: "Birth of Lord Rama, the ideal king and human." },
  { name: "Hanuman Jayanti", nameHindi: "हनुमान जयंती", date: "2027-04-21T00:00:00+05:30", description: "Celebrating the birth of Lord Hanuman, the epitome of devotion." },
  { name: "Raksha Bandhan", nameHindi: "रक्षाबंधन", date: "2027-08-17T00:00:00+05:30", description: "Celebrating the sacred bond of love and protection between siblings." },
  { name: "Krishna Janmashtami", nameHindi: "कृष्ण जन्माष्टमी", date: "2027-08-25T00:00:00+05:30", description: "Celebrating the birth of Lord Krishna." },
  { name: "Ganesh Chaturthi", nameHindi: "गणेश चतुर्थी", date: "2027-09-04T00:00:00+05:30", description: "Celebrating the arrival of Lord Ganesha." },
  { name: "Dussehra", nameHindi: "दशहरा", date: "2027-10-09T00:00:00+05:30", description: "Victory of good over evil." },
  { name: "Diwali", nameHindi: "दीपावली", date: "2027-10-29T00:00:00+05:30", description: "The festival of lights." }
];

export default function Home() {
  // General app state
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [activeTeacher, setActiveTeacher] = useState<Teacher | null>(null);

  // Festival countdown states
  const [upcomingFestival, setUpcomingFestival] = useState<Festival | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; isToday: boolean } | null>(null);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isThankYouFormOpen, setIsThankYouFormOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [lastGeneratedLink, setLastGeneratedLink] = useState("");
  const [lastGeneratedTeacher, setLastGeneratedTeacher] = useState("");

  // Password verification modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordTeacher, setPasswordTeacher] = useState<Teacher | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  // Custom tribute form state
  const [customTeacherName, setCustomTeacherName] = useState("");
  const [customDesignation, setCustomDesignation] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customCollege, setCustomCollege] = useState("");
  const [customBestAdvice, setCustomBestAdvice] = useState("");
  const [customFavoriteMemory, setCustomFavoriteMemory] = useState("");
  const [customStudentName, setCustomStudentName] = useState("");
  const [customStudentEmail, setCustomStudentEmail] = useState("");
  const [customTeacherEmail, setCustomTeacherEmail] = useState("");

  // Personalized flow states
  const [personalizedTeacher, setPersonalizedTeacher] = useState<Teacher | null>(null);
  const [personalizedStep, setPersonalizedStep] = useState(0); // 0: public wall, 1: envelope, 2: wishes, 3: full profile
  const [blessingsText, setBlessingsText] = useState("");
  const [blessingsSent, setBlessingsSent] = useState(false);
  const [isSendingBlessings, setIsSendingBlessings] = useState(false);

  // Clipboard share states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  // Form states for adding tribute
  const [newName, setNewName] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newDesignation, setNewDesignation] = useState("");
  const [newCollege, setNewCollege] = useState("");
  const [newYears, setNewYears] = useState("");
  const [newBestLesson, setNewBestLesson] = useState("");
  const [newMemory, setNewMemory] = useState("");
  const [newTeachingStyle, setNewTeachingStyle] = useState("");
  const [newPersonality, setNewPersonality] = useState("");
  const [newLifeLesson, setNewLifeLesson] = useState("");
  const [newHowTheyShaped, setNewHowTheyShaped] = useState("");
  const [newSkillsLearned, setNewSkillsLearned] = useState("");
  const [newFavoriteSaying, setNewFavoriteSaying] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhotoPath, setNewPhotoPath] = useState("");

  // Form states for sending thank you email (from public view)
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [isSendingNote, setIsSendingNote] = useState(false);
  const [noteSentStatus, setNoteSentStatus] = useState(false);

  // References
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Load teachers & last generated link from localStorage on load
  useEffect(() => {
    const saved = localStorage.getItem("smriti_tributes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Teacher[];
        // Sync predefined teachers with INITIAL_TEACHERS to ensure latest asset paths are loaded
        const synced = parsed.map(t => {
          const latest = INITIAL_TEACHERS.find(init => init.id === t.id);
          return latest ? latest : t;
        });
        setTeachers(synced);
        localStorage.setItem("smriti_tributes", JSON.stringify(synced));
      } catch (e) {
        setTeachers(INITIAL_TEACHERS);
      }
    } else {
      setTeachers(INITIAL_TEACHERS);
    }

    if (typeof window !== "undefined") {
      const savedLink = localStorage.getItem("smriti_last_link");
      const savedTeacher = localStorage.getItem("smriti_last_teacher");
      if (savedLink && savedTeacher) {
        setLastGeneratedLink(savedLink);
        setLastGeneratedTeacher(savedTeacher);
      }
    }
  }, []);

  // Parse URL query parameter on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const teacherSlug = params.get("teacher")?.toLowerCase();
      
      if (teacherSlug) {
        const slugMap: { [key: string]: string } = {
          "paras": "1",
          "reshma": "2",
          "niraj": "3",
          "charmy": "4",
          "dhara": "5",
          "kajal": "6"
        };
        const id = slugMap[teacherSlug];
        if (id) {
          // Deactivate links for predefined teachers under Guiding Lights
          setToastMessage("Tribute links for Guiding Lights have been deactivated.");
          setShowToast(true);
          setTimeout(() => setShowToast(false), 5000);
          
          // Clear teacher param from URL without reloading
          const url = new URL(window.location.href);
          url.searchParams.delete("teacher");
          window.history.replaceState({}, "", url.toString());
        }
      } else {
        const compressedParam = params.get("c") || params.get("custom");
        if (compressedParam) {
          decompressData(compressedParam).then((decodedData) => {
            if (decodedData && decodedData.t) {
              const mappedTeacher: Teacher = {
                id: "custom",
                name: decodedData.t,
                salutation: decodedData.t,
                subject: decodedData.s || "",
                designation: decodedData.d || "",
                college: decodedData.c || "",
                years: "Current Tribute",
                photo: "",
                bestAdvice: decodedData.a || "",
                favoriteMemory: decodedData.m || "",
                teachingStyle: "Custom",
                personality: "Custom",
                lifeLesson: "Custom",
                howTheyShaped: `Received message from ${decodedData.n || "Student"}`,
                skillsLearned: "", 
                favoriteSaying: "",
                contactEmail: decodedData.e || "",
                initials: decodedData.t.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
                avatarColor: "from-amber-200 to-amber-300 text-amber-955 border-amber-450",
                bgPattern: "bg-[radial-gradient(#b45309_0.8px,transparent_0.8px)] [background-size:14px_14px]"
              };
              setPersonalizedTeacher(mappedTeacher);
              setPersonalizedStep(1);
            } else if (decodedData && decodedData.teacherName) {
              // Legacy support
              const mappedTeacher: Teacher = {
                id: "custom",
                name: decodedData.teacherName,
                salutation: decodedData.teacherName,
                subject: decodedData.subject || "",
                designation: decodedData.designation || "",
                college: decodedData.college || "",
                years: "Current Tribute",
                photo: "",
                bestAdvice: decodedData.bestAdvice || "",
                favoriteMemory: decodedData.favoriteMemory || "",
                teachingStyle: "Custom",
                personality: "Custom",
                lifeLesson: "Custom",
                howTheyShaped: `Received message from ${decodedData.studentName || "Student"}`,
                skillsLearned: "", 
                favoriteSaying: "",
                contactEmail: decodedData.teacherEmail || "",
                initials: decodedData.teacherName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
                avatarColor: "from-amber-200 to-amber-300 text-amber-955 border-amber-450",
                bgPattern: "bg-[radial-gradient(#b45309_0.8px,transparent_0.8px)] [background-size:14px_14px]"
              };
              setPersonalizedTeacher(mappedTeacher);
              setPersonalizedStep(1);
            }
          }).catch(err => {
            console.error("Link decompression failed:", err);
          });
        } else {
          const t = params.get("t") || params.get("tn");
          if (t) {
            const designation = params.get("d") || params.get("dg") || "";
            const subject = params.get("s") || params.get("sj") || "";
            const college = params.get("c") || params.get("cl") || "";
            const teacherEmail = params.get("e") || params.get("te") || "";
            const studentName = params.get("n") || params.get("sn") || "";
            const advice = params.get("a") || params.get("ad") || "";
            const memory = params.get("m") || params.get("mm") || "";

            const mappedTeacher: Teacher = {
              id: "custom",
              name: t,
              salutation: t,
              subject: subject,
              designation: designation,
              college: college,
              years: "Current Tribute",
              photo: "",
              bestAdvice: advice,
              favoriteMemory: memory,
              teachingStyle: "Custom",
              personality: "Custom",
              lifeLesson: "Custom",
              howTheyShaped: `Received message from ${studentName}`,
              skillsLearned: "", 
              favoriteSaying: "",
              contactEmail: teacherEmail,
              initials: t.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
              avatarColor: "from-amber-200 to-amber-300 text-amber-955 border-amber-450",
              bgPattern: "bg-[radial-gradient(#b45309_0.8px,transparent_0.8px)] [background-size:14px_14px]"
            };
            setPersonalizedTeacher(mappedTeacher);
            setPersonalizedStep(1);
          }
        }
      }
    }
  }, []);

  // Automatically trigger confetti when Step 2 loads
  useEffect(() => {
    if (personalizedStep === 2) {
      triggerConfetti();
    }
  }, [personalizedStep]);

  // Upcoming festival countdown calculation
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      
      // Find next upcoming festival. Stays active on the day itself (up to 24 hours after start)
      const next = FESTIVALS.find(f => {
        const fDate = new Date(f.date);
        const diff = fDate.getTime() - now.getTime();
        return diff > -86400000; // remains active for 24 hours
      });

      if (next) {
        setUpcomingFestival(next);
        const targetDate = new Date(next.date);
        const diff = targetDate.getTime() - now.getTime();

        if (diff <= 0 && diff > -86400000) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isToday: true });
        } else if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / 1000 / 60) % 60);
          const seconds = Math.floor((diff / 1000) % 60);
          setTimeLeft({ days, hours, minutes, seconds, isToday: false });
        }
      } else {
        setUpcomingFestival(null);
        setTimeLeft(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save teachers helper
  const saveTeachers = (updatedList: Teacher[]) => {
    setTeachers(updatedList);
    localStorage.setItem("smriti_tributes", JSON.stringify(updatedList));
  };

  const subjects = ["All", ...Array.from(new Set(teachers.map(t => t.subject)))];

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.bestAdvice.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "All" || t.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  // Link copy logic (triggers custom verification modal for predefined teachers)
  const handleCopyLink = (teacher: Teacher, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // prevent grid card triggers
    
    if (typeof window !== "undefined") {
      const isPredefined = ["1", "2", "3", "4", "5", "6"].includes(teacher.id);
      if (isPredefined) {
        setToastMessage("Sharing links for Guiding Lights is disabled.");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }

      executeCopyLink(teacher);
    }
  };

  // Helper to execute native clipboard copy
  const executeCopyLink = (teacher: Teacher) => {
    if (typeof window === "undefined") return;
    const slugMap: { [key: string]: string } = {
      "1": "paras",
      "2": "reshma",
      "3": "niraj",
      "4": "charmy",
      "5": "dhara",
      "6": "kajal"
    };
    const slug = slugMap[teacher.id] || teacher.name.split(" ")[0].toLowerCase();
    const link = `${window.location.origin}?teacher=${slug}`;
    
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(teacher.id);
      setToastMessage(`Personalized link for ${teacher.name} copied successfully!`);
      setShowToast(true);
      
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
      
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
    }).catch(() => {
      setToastMessage("Failed to copy link.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    });
  };

  // Custom password form verification handler
  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTeacher) return;

    if (passwordInput === "20061029") {
      executeCopyLink(passwordTeacher);
      setIsPasswordModalOpen(false);
      setPasswordTeacher(null);
      setPasswordInput("");
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  // Add new tribute submission handler
  const handleAddTribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSubject || !newBestLesson || !newMemory || !newDesignation || !newCollege) return;

    const initials = newName
      .split(" ")
      .map(n => n[0])
      .join("")
      .substring(0, 3)
      .toUpperCase();

    const randomBgIndex = Math.floor(Math.random() * 4);
    const bgPatterns = [
      "bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]",
      "bg-[linear-gradient(45deg,#fffdf5_25%,#fefce8_25%,#fefce8_50%,#fffdf5_50%,#fffdf5_75%,#fefce8_75%)] [background-size:24px_24px]",
      "bg-[radial-gradient(#d97706_0.8px,transparent_0.8px)] [background-size:12px_12px]",
      "bg-[linear-gradient(to_right,#fefce8_1px,transparent_1px),linear-gradient(to_bottom,#fefce8_1px,transparent_1px)] [background-size:20px_20px]"
    ];

    const randomColorIndex = Math.floor(Math.random() * 3);
    const colors = [
      "from-amber-100 to-amber-250 text-amber-900 border-amber-300",
      "from-amber-200 to-amber-400 text-amber-955 border-amber-400",
      "from-amber-50 to-amber-200 text-amber-900 border-amber-300"
    ];

    const newTeacher: Teacher = {
      id: Date.now().toString(),
      name: newName,
      salutation: newName.includes("Mam") || newName.includes("Mrs") || newName.includes("Dhara") || newName.includes("Kajal") || newName.includes("Charmy") || newName.includes("Reshma") ? `${newName.split(" ")[0]} Mam` : `${newName.split(" ")[0]} Sir`,
      subject: newSubject,
      designation: newDesignation,
      college: newCollege,
      years: newYears || "2025-2026",
      photo: newPhotoPath || "",
      bestAdvice: newBestLesson,
      favoriteMemory: newMemory,
      teachingStyle: newTeachingStyle || "Interactive lectures and problem-solving.",
      personality: newPersonality || "Enthusiastic and dedicated.",
      lifeLesson: newLifeLesson || "Continuous learning.",
      howTheyShaped: newHowTheyShaped || "Inspired me to dive deeper into engineering projects.",
      skillsLearned: newSkillsLearned || "Practical development capabilities.",
      favoriteSaying: newFavoriteSaying || undefined,
      contactEmail: newEmail,
      initials: initials || "TR",
      avatarColor: colors[randomColorIndex],
      bgPattern: bgPatterns[randomBgIndex]
    };

    const updatedList = [newTeacher, ...teachers];
    saveTeachers(updatedList);

    // Reset fields
    setNewName("");
    setNewSubject("");
    setNewDesignation("");
    setNewCollege("");
    setNewYears("");
    setNewBestLesson("");
    setNewMemory("");
    setNewTeachingStyle("");
    setNewPersonality("");
    setNewLifeLesson("");
    setNewHowTheyShaped("");
    setNewSkillsLearned("");
    setNewFavoriteSaying("");
    setNewEmail("");
    setNewPhotoPath("");
    setIsAddModalOpen(false);

    triggerConfetti();
  };

  // Triggers gold/amber confetti explosion
  const triggerConfetti = () => {
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#f59e0b", "#fff", "#d97706"]
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#f59e0b", "#fff", "#d97706"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // Public thank you submission
  const handleSendThankYou = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderEmail || !thankYouMessage || !activeTeacher) return;

    setIsSendingNote(true);

    // Call secure Server Action
    const result = await sendThankYouEmail({
      teacherName: activeTeacher.name,
      teacherEmail: activeTeacher.contactEmail,
      senderName,
      senderEmail,
      message: thankYouMessage
    });

    if (result.success) {
      setIsSendingNote(false);
      setNoteSentStatus(true);
      triggerConfetti();
    } else {
      console.warn("Server action failed, launching fallback mailto client. Error code:", result.error);
      
      // Fallback mailto triggers directly
      if (activeTeacher.contactEmail) {
        const emailSubject = `Appreciation Message from ${senderName} (via Smriti)`;
        const emailBody = `Dear ${activeTeacher.name},\n\nI wanted to reach out and express my deepest appreciation for your lessons.\n\n"${thankYouMessage}"\n\nBest regards,\n${senderName}\n(${senderEmail})`;
        
        const mailtoUrl = `mailto:${activeTeacher.contactEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.open(mailtoUrl, "_blank");
      }
      
      setIsSendingNote(false);
      setNoteSentStatus(true);
      triggerConfetti();
    }

    setTimeout(() => {
      setNoteSentStatus(false);
      setSenderName("");
      setSenderEmail("");
      setThankYouMessage("");
      setIsThankYouFormOpen(false);
    }, 2500);
  };

  // Personalized flow blessings submission
  const handleSendBlessings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blessingsText || !personalizedTeacher) return;

    setIsSendingBlessings(true);

    const studentDestEmail = personalizedTeacher.id === "custom" ? personalizedTeacher.skillsLearned : undefined;

    // Call secure Server Action (transmitting blessings directly to the student/owner securely)
    const result = await sendBlessingsEmail({
      teacherName: personalizedTeacher.name,
      teacherEmail: personalizedTeacher.contactEmail,
      designation: personalizedTeacher.designation,
      subject: personalizedTeacher.subject,
      college: personalizedTeacher.college,
      blessingsText,
      studentEmail: studentDestEmail
    });

    if (result.success) {
      setIsSendingBlessings(false);
      setBlessingsSent(true);
      triggerConfetti();
    } else {
      console.warn("Server action blessings send failed, launching fallback mailto client. Error:", result.error);
      
      // Fallback mailto link
      const targetEmail = personalizedTeacher.id === "custom" ? personalizedTeacher.skillsLearned : "sharmaeditzayush@gmail.com";
      const emailSubject = `Blessings & Reply from ${personalizedTeacher.name}`;
      const emailBody = `Dear Student,\n\nThank you for the beautiful tribute on Smriti.\n\nHere are my blessings / reply:\n\n"${blessingsText}"\n\nBest wishes,\n${personalizedTeacher.name}`;
      const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(mailtoUrl, "_blank");

      setIsSendingBlessings(false);
      setBlessingsSent(true);
      triggerConfetti();
    }

    setTimeout(() => {
      setBlessingsSent(false);
      setBlessingsText("");
    }, 4000);
  };

  // Generate clean, compressed custom tribute link
  const handleGenerateCustomLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !customTeacherName || 
      !customDesignation || 
      !customSubject || 
      !customCollege || 
      !customBestAdvice || 
      !customFavoriteMemory || 
      !customStudentName || 
      !customTeacherEmail
    ) return;

    try {
      const data = {
        t: customTeacherName,
        d: customDesignation,
        s: customSubject,
        c: customCollege,
        e: customTeacherEmail,
        n: customStudentName,
        a: customBestAdvice,
        m: customFavoriteMemory
      };

      const compressed = await compressData(data);
      const link = `${window.location.origin}?c=${compressed}`;

      navigator.clipboard.writeText(link);
      
      // Save link locally to state and storage
      setLastGeneratedLink(link);
      setLastGeneratedTeacher(customTeacherName);
      localStorage.setItem("smriti_last_link", link);
      localStorage.setItem("smriti_last_teacher", customTeacherName);

      setToastMessage("Tribute link generated and copied!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // Close and reset form modal instantly
      setCustomTeacherName("");
      setCustomDesignation("");
      setCustomSubject("");
      setCustomCollege("");
      setCustomBestAdvice("");
      setCustomFavoriteMemory("");
      setCustomStudentName("");
      setCustomStudentEmail("");
      setCustomTeacherEmail("");
      setGeneratedLink("");
      setIsCustomModalOpen(false);
    } catch (err) {
      console.error("Failed to generate link:", err);
    }
  };

  // Close and reset custom wish link modal
  const handleCloseCustomModal = () => {
    setCustomTeacherName("");
    setCustomDesignation("");
    setCustomSubject("");
    setCustomCollege("");
    setCustomBestAdvice("");
    setCustomFavoriteMemory("");
    setCustomStudentName("");
    setCustomStudentEmail("");
    setCustomTeacherEmail("");
    setGeneratedLink("");
    setIsCustomModalOpen(false);
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeTeacher) setActiveTeacher(null);
        if (isAddModalOpen) setIsAddModalOpen(false);
        if (isCustomModalOpen) handleCloseCustomModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTeacher, isAddModalOpen, isCustomModalOpen]);

  // Focus trap
  useEffect(() => {
    if (activeTeacher && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [activeTeacher]);

  // RENDER PERSONALIZED GUIDED FLOW
  if (personalizedTeacher) {
    return (
      <div className="relative min-h-screen bg-[#fffdf5] selection:bg-amber-200 selection:text-amber-900 flex flex-col justify-between overflow-hidden font-sans">
        
        {/* Glow circles */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
          <div className="absolute top-[15%] left-[10%] w-[35rem] h-[35rem] bg-[radial-gradient(circle,#fefce8_0%,transparent_70%)] animate-glow" />
          <div className="absolute bottom-[15%] right-[5%] w-[45rem] h-[45rem] bg-[radial-gradient(circle,#fef9c3_0%,transparent_75%)] animate-glow" style={{ animationDelay: "1.5s" }} />
        </div>

        {/* Dynamic header */}
        <header className="sticky top-0 z-40 bg-[#fffdf5]/80 backdrop-blur-md px-6 py-4 border-b border-amber-100 flex items-center justify-between">
          <span className="font-serif text-xl font-bold tracking-wide text-amber-900">Smriti</span>
          <button
            onClick={() => setPersonalizedTeacher(null)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 border border-amber-200 bg-white rounded-lg shadow-3xs transition-all"
          >
            <ArrowLeft size={13} />
            Tribute Wall
          </button>
        </header>

        {/* STEP-BY-STEP CONTENTS */}
        <main className="flex-1 flex items-center justify-center p-4 z-10">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: WELCOME GOLDEN ENVELOPE */}
            {personalizedStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.45 }}
                className="w-full max-w-md bg-white border border-amber-200/80 rounded-2xl shadow-xl overflow-hidden p-6 md:p-8 text-center space-y-6 relative diary-page-curl"
              >
                <div className="border border-dashed border-amber-300 p-6 rounded-xl space-y-6">
                  <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                    <Book size={28} className="stroke-[1.5]" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500">Dear Teacher</span>
                    <h2 className="font-serif text-3xl font-extrabold text-amber-955">
                      Welcome {personalizedTeacher.salutation}
                    </h2>
                  </div>

                  <p className="text-xs md:text-sm text-amber-900/70 leading-relaxed italic font-serif">
                    &ldquo;We have opened a special diary of memory and gratitude dedicated to you. A modest space created to honor the values and paths you helped design.&rdquo;
                  </p>

                  <button
                    onClick={() => setPersonalizedStep(2)}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    Open Envelope
                    <ArrowRight size={13} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: GURU PURNIMA CONGRATULATIONS */}
            {personalizedStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-full max-w-lg bg-white border border-amber-250 rounded-2xl shadow-2xl overflow-hidden p-6 md:p-10 text-center space-y-6 relative"
              >
                <div className="absolute top-2 left-2 border-t border-l border-amber-300 w-6 h-6" />
                <div className="absolute top-2 right-2 border-t border-r border-amber-300 w-6 h-6" />
                <div className="absolute bottom-2 left-2 border-b border-l border-amber-300 w-6 h-6" />
                <div className="absolute bottom-2 right-2 border-b border-r border-amber-300 w-6 h-6" />

                <div className="relative flex justify-center">
                  <div className="absolute w-24 h-24 bg-amber-100 rounded-full blur-xl animate-glow" />
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="relative w-16 h-16 rounded-full border border-amber-300 bg-white flex items-center justify-center text-amber-500 shadow-2xs"
                  >
                    <Sparkles size={28} className="animate-pulse" />
                  </motion.div>
                </div>

                <div className="space-y-3">
                  <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-amber-955">
                    Happy Guru Purnima
                  </h2>
                  <div className="h-0.5 w-12 bg-amber-300 mx-auto" />
                  <p className="text-xs uppercase tracking-widest font-semibold text-amber-600">
                    A Tribute to Your Lessons & Influence
                  </p>
                </div>

                <p className="text-sm text-amber-900/80 leading-relaxed font-serif italic max-w-sm mx-auto">
                  &ldquo;A guru leads from dark pathways into clarity. Thank you for your guidance, patience, and for constantly believing in my possibilities.&rdquo;
                </p>

                <button
                  onClick={() => setPersonalizedStep(3)}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1"
                >
                  See Your Impact
                  <ArrowRight size={13} />
                </button>
              </motion.div>
            )}

            {/* STEP 3: DETAILED REVEAL */}
            {personalizedStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-3xl bg-white border border-amber-200 rounded-2xl shadow-xl overflow-hidden p-6 md:p-10 my-6 space-y-8 relative"
              >


                {/* 1. Header Section */}
                <div className="flex flex-col items-center text-center border-b border-amber-100 pb-8 pt-6">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-amber-355 p-1 bg-white mb-4">
                    <div className="w-full h-full rounded-full overflow-hidden bg-linear-to-br from-amber-50 to-amber-150 flex items-center justify-center font-serif text-3xl font-bold text-amber-900 relative">
                      {personalizedTeacher.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={personalizedTeacher.photo}
                          alt={personalizedTeacher.name}
                          className="w-full h-full object-cover relative z-10"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : null}
                      <div className={`absolute inset-0 opacity-15 ${personalizedTeacher.bgPattern}`} />
                      <span className="absolute z-0">{personalizedTeacher.initials}</span>
                    </div>
                  </div>

                  <h3 className="font-serif text-3xl font-extrabold text-amber-955">
                    {personalizedTeacher.name}
                  </h3>
                  <p className="text-amber-800 font-serif font-medium text-sm mt-1">
                    {personalizedTeacher.designation} &bull; <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-full">{personalizedTeacher.subject}</span>
                  </p>
                  <p className="text-xs text-amber-800/40 mt-1.5 font-medium flex items-center gap-1.5">
                    <GraduationCap size={13} className="text-amber-500/70" />
                    {personalizedTeacher.college} | {personalizedTeacher.years}
                  </p>
                </div>

                {personalizedTeacher.id === "5" || personalizedTeacher.id === "6" ? (
                  <div className="bg-amber-50/40 border border-amber-200/50 p-8 rounded-xl text-center space-y-4 my-6 shadow-3xs">
                    <div className="w-12 h-12 rounded-full bg-amber-100/80 flex items-center justify-center mx-auto text-amber-700">
                      <GraduationCap className="stroke-[1.25]" size={24} />
                    </div>
                    <p className="font-serif text-base md:text-lg text-amber-955 italic leading-relaxed">
                      &ldquo;It is an honor to begin this academic journey under your guidance in the 5th semester. I am excited to learn, grow, and create wonderful memories under your mentorship.&rdquo;
                    </p>
                  </div>
                ) : personalizedTeacher.id === "custom" ? (
                  <>
                    {/* 2. "Best Advice" Section */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-amber-500 text-center">Words That Stay</h4>
                      <div className="bg-[#fffdf2] border border-amber-200/60 p-6 md:p-8 rounded-xl text-center shadow-3xs relative overflow-hidden">
                        <div className="absolute top-2 left-4 text-3xl font-serif text-amber-300 select-none opacity-40">❝</div>
                        <p className="font-serif text-base md:text-lg italic text-amber-900 leading-relaxed px-4">
                          {personalizedTeacher.bestAdvice}
                        </p>
                        <div className="absolute bottom-1 right-4 text-3xl font-serif text-amber-300 select-none opacity-40">❞</div>
                      </div>
                    </div>

                    {/* 3. "Favorite Memory" Section */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-amber-500 flex items-center gap-1.5">
                        <MessageSquare size={13} className="text-amber-500" />
                        A Moment to Remember
                      </h4>
                      <div className="bg-[#faf7ee]/60 border border-amber-100 p-5 rounded-xl text-sm leading-relaxed text-amber-900/80 italic whitespace-pre-line">
                        {personalizedTeacher.favoriteMemory}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* 2. "Best Advice" Section */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-amber-500 text-center">Words That Stay</h4>
                      <div className="bg-[#fffdf2] border border-amber-200/60 p-6 md:p-8 rounded-xl text-center shadow-3xs relative overflow-hidden">
                        <div className="absolute top-2 left-4 text-3xl font-serif text-amber-300 select-none opacity-40">❝</div>
                        <p className="font-serif text-base md:text-lg italic text-amber-900 leading-relaxed px-4">
                          {personalizedTeacher.bestAdvice}
                        </p>
                        <div className="absolute bottom-1 right-4 text-3xl font-serif text-amber-300 select-none opacity-40">❞</div>
                      </div>
                    </div>

                    {/* 3. "Favorite Memory" Section */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-amber-500 flex items-center gap-1.5">
                        <MessageSquare size={13} className="text-amber-500" />
                        A Moment to Remember
                      </h4>
                      <div className="bg-[#faf7ee]/60 border border-amber-100 p-5 rounded-xl text-sm leading-relaxed text-amber-900/80 italic whitespace-pre-line">
                        {personalizedTeacher.favoriteMemory}
                      </div>
                    </div>

                    {/* 4. "Teaching Style & Personality" Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-amber-100 p-4 rounded-xl space-y-1.5 bg-white shadow-3xs">
                        <h5 className="text-[10px] uppercase font-bold tracking-wider text-amber-500 flex items-center gap-1.5">
                          <BookOpen size={13} />
                          How You Taught
                        </h5>
                        <p className="text-xs text-amber-900/70 leading-relaxed">{personalizedTeacher.teachingStyle}</p>
                      </div>

                      <div className="border border-amber-150 p-4 rounded-xl space-y-1.5 bg-white shadow-3xs">
                        <h5 className="text-[10px] uppercase font-bold tracking-wider text-amber-500 flex items-center gap-1.5">
                          <User size={13} />
                          Who You Were
                        </h5>
                        <p className="text-xs text-amber-900/70 leading-relaxed">{personalizedTeacher.personality}</p>
                      </div>
                    </div>

                    {/* 5. "Impact & Legacy" Section */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-amber-500">How You Shaped Me</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Life Lesson */}
                        <div className="border border-amber-150/70 p-4 rounded-xl bg-white shadow-3xs space-y-1.5">
                          <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600 w-fit">
                            <Award size={14} />
                          </div>
                          <h5 className="text-xs font-bold text-amber-955">Life Lesson</h5>
                          <p className="text-[11px] text-amber-900/70 leading-relaxed">{personalizedTeacher.lifeLesson}</p>
                        </div>

                        {/* The Difference */}
                        <div className="border border-amber-150/70 p-4 rounded-xl bg-white shadow-3xs space-y-1.5">
                          <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600 w-fit">
                            <Zap size={14} />
                          </div>
                          <h5 className="text-xs font-bold text-amber-955">The Difference</h5>
                          <p className="text-[11px] text-amber-900/70 leading-relaxed">{personalizedTeacher.howTheyShaped}</p>
                        </div>

                        {/* Skills Gained */}
                        <div className="border border-amber-150/70 p-4 rounded-xl bg-white shadow-3xs space-y-1.5">
                          <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600 w-fit">
                            <Target size={14} />
                          </div>
                          <h5 className="text-xs font-bold text-amber-955">Skills I Gained</h5>
                          <p className="text-[11px] text-amber-900/70 leading-relaxed">{personalizedTeacher.skillsLearned}</p>
                        </div>
                      </div>
                    </div>

                    {/* 6. Signature Line Section */}
                    {personalizedTeacher.favoriteSaying && (
                      <div className="bg-amber-50 border border-amber-200/50 p-4 rounded-xl text-center">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-amber-600 block mb-1">Signature Saying</span>
                        <p className="font-serif italic text-base text-amber-900/90 tracking-wide">
                          &ldquo;{personalizedTeacher.favoriteSaying}&rdquo;
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* 7. Send Blessings Form */}
                {personalizedTeacher.id !== "custom" && (
                  <div className="border-t border-amber-100 pt-6">
                    <div className="bg-[#fffdf2] border border-amber-200/60 p-5 rounded-xl">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 mb-3">
                        <Heart size={14} className="text-amber-500 fill-amber-500" />
                        Leave Your Blessings or Message
                      </h4>

                      {blessingsSent ? (
                        <div className="flex flex-col items-center justify-center py-4 text-center text-amber-900">
                          <CheckCircle2 size={32} className="text-amber-600 mb-1.5" />
                          <h5 className="font-bold text-sm">Thank You for Your Blessings!</h5>
                          <p className="text-xs text-amber-800/70 mt-0.5">
                            Your reply has been prepared and opened in your mail handler.
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleSendBlessings} className="space-y-4">
                          <textarea
                            required
                            rows={3}
                            value={blessingsText}
                            onChange={(e) => setBlessingsText(e.target.value)}
                            placeholder="Dear student, I am glad to see your progress. Keep shining..."
                            className="w-full px-3 py-2 text-xs border border-amber-200 focus:outline-hidden focus:ring-1 focus:ring-amber-400 bg-white rounded-lg text-amber-955"
                          />
                          <button
                            type="submit"
                            disabled={isSendingBlessings}
                            className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 disabled:bg-amber-450 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Send size={12} />
                            {isSendingBlessings ? "Sending blessings..." : "Send Reply"}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}

                {/* Return to general wall */}
                <div className="text-center pt-4 border-t border-amber-50">
                  <button
                    onClick={() => setPersonalizedTeacher(null)}
                    className="text-xs font-bold uppercase tracking-wider text-amber-600 hover:text-amber-800 transition-colors"
                  >
                    Go to general tribute wall &rarr;
                  </button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* FOOTER */}
        <footer className="bg-amber-950 text-amber-100/90 py-12 px-6 border-t border-amber-900 z-10 relative">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs tracking-wide text-amber-200/80 font-serif italic">
                &ldquo;In My mind I&apos;m always the best&rdquo;
              </p>
              <p className="text-[10px] text-amber-200/40">
                Tribute Crafted with gratitude by <strong className="text-amber-200/70 font-semibold">Ayush Sharma</strong>
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-3.5 mt-1">
                <a 
                  href="https://github.com/ius-sharma" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title="GitHub Profile"
                  className="p-1.5 rounded-full border border-amber-900 hover:border-amber-700 bg-amber-955 hover:bg-amber-900 text-amber-200/50 hover:text-amber-100 transition-all shadow-3xs flex items-center justify-center"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a 
                  href="https://www.linkedin.com/in/ayush-sharma-833163320/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title="LinkedIn Profile"
                  className="p-1.5 rounded-full border border-amber-900 hover:border-amber-700 bg-amber-955 hover:bg-amber-900 text-amber-200/50 hover:text-amber-100 transition-all shadow-3xs flex items-center justify-center"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a 
                  href="https://www.instagram.com/ocn.ayush07/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title="Instagram Profile"
                  className="p-1.5 rounded-full border border-amber-900 hover:border-amber-700 bg-amber-955 hover:bg-amber-900 text-amber-200/50 hover:text-amber-100 transition-all shadow-3xs flex items-center justify-center"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a 
                  href="mailto:sharmaeditzayush@gmail.com"
                  title="Contact Email"
                  className="p-1.5 rounded-full border border-amber-900 hover:border-amber-700 bg-amber-955 hover:bg-amber-900 text-amber-200/50 hover:text-amber-100 transition-all shadow-3xs flex items-center justify-center"
                >
                  <Mail size={14} />
                </a>
              </div>
            </div>

            <div className="text-[9px] text-amber-800/40 uppercase tracking-widest">
              Smriti © 2026 | Dedicated to the teachers
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // PUBLIC TRIBUTE WALL
  return (
    <div className="relative min-h-screen bg-[#fffdf5] selection:bg-amber-200 selection:text-amber-900 overflow-hidden font-sans">
      
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <div className="absolute top-[10%] left-[5%] w-[40rem] h-[40rem] bg-[radial-gradient(circle,#fefce8_0%,transparent_70%)] animate-glow" />
        <div className="absolute bottom-[20%] right-[-5%] w-[50rem] h-[50rem] bg-[radial-gradient(circle,#fef9c3_0%,transparent_75%)] animate-glow" style={{ animationDelay: "2s" }} />
      </div>

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#fffdf5]/85 backdrop-blur-md border-b border-amber-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold tracking-wide text-amber-900">
              Smriti
            </span>
          </a>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-amber-900/80">
            <a href="#about" className="hover:text-amber-600 transition-colors">Why Smriti?</a>
            <a href="#wall" className="hover:text-amber-600 transition-colors">The Guiding Lights</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCustomModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-amber-900 border border-amber-250 bg-amber-50/20 hover:bg-amber-50 rounded-full shadow-3xs transition-colors duration-205"
            >
              Wish Your Teacher
            </button>
          </div>
        </div>
      </header>
      <section id="hero" className="relative min-h-[90vh] flex flex-col justify-center items-center px-6 py-20 z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto space-y-8 select-none"
        >
          {/* Elegant header label */}
          <div className="flex items-center justify-center gap-2">
            <span className="h-[1px] w-8 bg-amber-300/60" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 font-sans">A digital tribute space</span>
            <span className="h-[1px] w-8 bg-amber-300/60" />
          </div>

          {/* Typography headers */}
          <div className="space-y-4">
            <h1 className="font-serif text-7xl md:text-9xl font-extrabold tracking-tight text-amber-955 select-text">
              Smriti
            </h1>
            <p className="font-serif text-lg md:text-2xl text-amber-700 tracking-wide font-normal italic select-text">
              स्मृति — A Tribute to Those Who Lit the Way
            </p>
          </div>

          {/* Typography Quote Block */}
          <div className="relative max-w-2xl mx-auto px-8 py-8 border-y border-amber-250/30 my-8">
            <div className="absolute top-2 left-6 text-6xl font-serif text-amber-200 select-none opacity-50">“</div>
            <p className="font-serif text-xl md:text-3xl text-amber-900 italic leading-relaxed px-4 select-text">
              The best teachers teach from the heart, not from the book.
            </p>
            <div className="absolute bottom-2 right-6 text-6xl font-serif text-amber-200 select-none opacity-50">”</div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3.5 justify-center relative z-20">
            <button
              onClick={() => setIsCustomModalOpen(true)}
              className="px-6 py-3 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors duration-205"
            >
              Wish Your Teacher
            </button>
            <a
              href="#wall"
              className="px-6 py-3 bg-white border border-amber-200 text-amber-955 font-bold text-xs uppercase tracking-widest rounded-lg shadow-3xs flex items-center justify-center gap-1.5"
            >
              View Tribute Wall
            </a>
          </div>
        </motion.div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section id="about" className="py-24 px-6 bg-white/50 border-y border-amber-100/50 z-10 relative">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs uppercase tracking-widest font-bold text-amber-500 mb-3 block">Introduction</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-amber-955 mb-6">Why Smriti?</h2>
          <div className="h-0.5 w-16 bg-amber-300 mx-auto mb-8" />
          
          <p className="font-serif text-lg md:text-xl text-amber-900/80 leading-relaxed max-w-2xl mx-auto italic">
            &ldquo;Smriti is a personal digital sanctuary built to honor and remember the teachers who shaped my journey. They didn&apos;t just teach lessons from textbooks; they lit fires of curiosity, taught empathy, and gave us the courage to build our own paths.&rdquo;
          </p>
        </div>
      </section>

      {/* CREATOR'S NOTE SECTION */}
      <section id="creator-note" className="py-16 px-6 max-w-4xl mx-auto z-10 relative">
        <div className="bg-white/80 border border-amber-200/80 p-8 md:p-10 rounded-2xl shadow-3xs diary-page-curl relative overflow-hidden transition-all duration-300">


          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 shadow-2xs">
              <BookOpen className="stroke-[1.25]" size={28} />
            </div>
            
            <div className="text-center md:text-left space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 block">Behind the Code</span>
              <h3 className="font-serif text-2xl font-bold text-amber-955">Tribute Crafted by Ayush Sharma</h3>
              <div className="h-0.5 w-12 bg-amber-300 mx-auto md:mx-0" />
              
              <p className="text-sm md:text-base text-amber-900/80 leading-relaxed font-serif italic pt-1">
                &ldquo;I built this digital sanctuary, Smriti, to bridge the distance between us and the mentors who spend tireless hours shaping our future. As a student of Marwadi University, I wanted to create something more permanent than a temporary card or message—a digital time-capsule where teachers can see their cumulative impact. Every line of code was written with deep respect and admiration for their teachings, patience, and constant encouragement.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING FESTIVAL REMINDER */}
      {upcomingFestival && timeLeft && (
        <section id="festival-reminder" className="py-8 px-6 max-w-4xl mx-auto z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -4, boxShadow: "0 12px 24px -10px rgba(180,83,9,0.12)" }}
            className="relative bg-white/80 border border-amber-250/70 p-6 md:p-8 rounded-2xl shadow-3xs diary-page-curl overflow-hidden transition-all duration-300"
          >
            {/* Ambient decorative glowing backdrops */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-100/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-200/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col items-center text-center space-y-5 relative">
              {/* Auspicious motif/header */}
              <div className="flex items-center justify-center gap-3">
                <span className="h-[1px] w-10 bg-amber-300/50" />
                <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-3xs animate-float">
                  <Sparkles className="stroke-[1.25]" size={16} />
                </div>
                <span className="h-[1px] w-10 bg-amber-300/50" />
              </div>

              {/* Text Info */}
              <div className="space-y-1.5 max-w-xl">
                <span className="text-[9px] uppercase font-bold tracking-widest text-amber-500 block">Upcoming Celebration</span>
                <h3 className="font-serif text-2xl md:text-3xl font-extrabold text-amber-955 flex items-center justify-center gap-2">
                  <span>{upcomingFestival.name}</span>
                  {upcomingFestival.nameHindi && (
                    <>
                      <span className="text-amber-300 text-base md:text-lg font-normal">•</span>
                      <span className="font-serif text-xl md:text-2xl text-amber-800 font-medium">{upcomingFestival.nameHindi}</span>
                    </>
                  )}
                </h3>
                <p className="text-xs text-amber-900/70 leading-relaxed font-serif italic max-w-lg mx-auto">
                  {upcomingFestival.description}
                </p>
              </div>

              {/* Countdown or Celebration state */}
              {timeLeft.isToday ? (
                <div className="py-3.5 px-7 bg-amber-50/70 border border-amber-250/40 rounded-xl shadow-3xs animate-pulse">
                  <span className="font-serif text-sm md:text-base font-extrabold text-amber-800 tracking-wide uppercase flex items-center gap-2">
                    🙏 Celebrating Today! Happy {upcomingFestival.name} ✨
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-sm w-full">
                  {[
                    { label: "Days", value: timeLeft.days },
                    { label: "Hours", value: timeLeft.hours },
                    { label: "Mins", value: timeLeft.minutes },
                    { label: "Secs", value: timeLeft.seconds }
                  ].map((unit, idx) => (
                    <div
                      key={idx}
                      className="bg-amber-50/40 border border-amber-200/50 p-2 sm:p-3.5 rounded-xl flex flex-col items-center justify-center shadow-3xs transition-all hover:bg-amber-50/80 hover:border-amber-250/70 group"
                    >
                      <span className="font-serif text-lg sm:text-2xl font-extrabold text-amber-955 font-mono tracking-tight group-hover:scale-105 transition-transform duration-300">
                        {String(unit.value).padStart(2, '0')}
                      </span>
                      <span className="text-[8px] sm:text-[9px] uppercase font-bold text-amber-600/80 tracking-wider mt-0.5">
                        {unit.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </section>
      )}

      {/* 3. TEACHERS GRID SECTION */}
      <section id="wall" className="py-24 px-6 max-w-7xl mx-auto z-10 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-amber-500 mb-2 block">Tribute Wall</span>
            <h2 className="font-serif text-3xl md:text-5xl font-extrabold text-amber-955">The Guiding Lights</h2>
            <p className="text-amber-800/70 text-sm mt-1">Discover, read, and write messages of gratitude to the mentors who change lives.</p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search teacher or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 text-sm bg-white border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg shadow-2xs text-amber-955 placeholder:text-amber-800/40"
              />
              <Search className="absolute left-3 top-3.5 text-amber-800/40" size={16} />
            </div>

            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-white border border-amber-200 pl-4 pr-10 py-2.5 text-sm font-medium rounded-lg text-amber-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400 cursor-pointer shadow-2xs"
              >
                {subjects.map(subj => (
                  <option key={subj} value={subj}>
                    {subj === "All" ? "All Subjects" : subj}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-amber-800/50 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {filteredTeachers.length === 0 ? (
          <div className="text-center py-20 bg-white/40 border border-amber-100 rounded-xl">
            <p className="text-amber-800/60 font-medium">No tributes found matching your search.</p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedSubject("All"); }}
              className="mt-4 text-xs font-semibold text-amber-600 hover:text-amber-800 underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredTeachers.map((teacher, index) => (
                <motion.div
                  key={teacher.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: index * 0.04 }}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -8px rgba(180,83,9,0.12)" }}
                  onClick={() => {
                    setActiveTeacher(teacher);
                    setIsThankYouFormOpen(false);
                  }}
                  className="bg-white border border-amber-100 hover:border-amber-250 p-6 rounded-xl cursor-pointer transition-all duration-300 flex flex-col justify-between diary-page-curl group shadow-2xs"
                >
                  <div>
                    <div className="flex items-center gap-4 mb-5">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border border-amber-200 bg-linear-to-br from-amber-50 to-amber-150 flex items-center justify-center font-serif text-lg font-bold text-amber-900 shadow-2xs">
                        {teacher.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={teacher.photo}
                            alt={teacher.name}
                            className="w-full h-full object-cover relative z-10"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}
                        <div className={`absolute inset-0 opacity-10 ${teacher.bgPattern}`} />
                        <span className="absolute z-0">{teacher.initials}</span>
                      </div>
                      
                      <div>
                        <h3 className="font-serif text-base font-bold text-amber-955 group-hover:text-amber-700 transition-colors">
                          {teacher.name}
                        </h3>
                        <span className="inline-block px-2 py-0.5 mt-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/50 rounded-full uppercase tracking-wider">
                          {teacher.subject}
                        </span>
                      </div>
                    </div>

                    <blockquote className="border-l border-amber-300 pl-3.5 py-0.5 mb-6">
                      <p className="font-serif text-xs italic text-amber-800 leading-relaxed">
                        &ldquo;{teacher.bestAdvice}&rdquo;
                      </p>
                    </blockquote>
                  </div>

                  {/* Footer with Years and Copy/Read Links */}
                  <div className="flex items-center justify-between text-[11px] pt-3.5 border-t border-amber-50">
                    <span className="text-amber-800/40 font-medium flex items-center gap-1">
                      <Clock size={11} />
                      {teacher.years}
                    </span>
                    <div className="flex items-center gap-2">
                      {!["1", "2", "3", "4", "5", "6"].includes(teacher.id) && (
                        <button
                          onClick={(e) => handleCopyLink(teacher, e)}
                          title="Copy shareable link"
                          className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50 hover:text-amber-800 border border-transparent hover:border-amber-200 transition-all flex items-center justify-center"
                        >
                          {copiedId === teacher.id ? <CheckCircle2 size={13} className="text-green-600" /> : <Share2 size={13} />}
                        </button>
                      )}
                      <span className="font-semibold text-amber-600 hover:text-amber-800 transition-colors">
                        Read Detailed Story &rarr;
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="bg-amber-950 text-amber-100 py-16 px-6 mt-16 z-10 relative">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <p className="font-serif text-2xl md:text-3xl text-amber-300 tracking-wide">
              &ldquo;गुरुर्ब्रह्मा गुरुर्विष्णु गुरुर्देवो महेश्वरः&rdquo;
            </p>
            <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold opacity-60">
              Guru Brahma, Guru Vishnu, Guru Devo Maheshwara
            </p>
            <p className="text-xs max-w-md mx-auto text-amber-200/50 mt-2 italic leading-relaxed">
              (The teacher is the creator, the preserver, and the transformer; the guiding light in physical and spiritual forms)
            </p>
          </div>

          <div className="h-px bg-amber-900 max-w-xl mx-auto" />

          <div className="flex flex-col items-center gap-4">
            <p className="text-sm tracking-wide text-amber-200/80 font-serif italic">
              &ldquo;In My mind I&apos;m always the best&rdquo;
            </p>
            
            <p className="text-xs text-amber-200/40">
              Tribute Crafted with gratitude by <strong className="text-amber-200/70 font-semibold">Ayush Sharma</strong>
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-2 justify-center">
              <a 
                href="https://github.com/ius-sharma" 
                target="_blank" 
                rel="noopener noreferrer"
                title="GitHub Profile"
                className="p-2 rounded-full border border-amber-900 hover:border-amber-700 bg-amber-955 hover:bg-amber-900 text-amber-200/60 hover:text-amber-100 transition-all shadow-3xs flex items-center justify-center"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a 
                href="https://www.linkedin.com/in/ayush-sharma-833163320/" 
                target="_blank" 
                rel="noopener noreferrer"
                title="LinkedIn Profile"
                className="p-2 rounded-full border border-amber-900 hover:border-amber-700 bg-amber-955 hover:bg-amber-900 text-amber-200/60 hover:text-amber-100 transition-all shadow-3xs flex items-center justify-center"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a 
                href="https://www.instagram.com/ocn.ayush07/" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Instagram Profile"
                className="p-2 rounded-full border border-amber-900 hover:border-amber-700 bg-amber-955 hover:bg-amber-900 text-amber-200/60 hover:text-amber-100 transition-all shadow-3xs flex items-center justify-center"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a 
                href="mailto:sharmaeditzayush@gmail.com"
                title="Contact Email"
                className="p-2 rounded-full border border-amber-900 hover:border-amber-700 bg-amber-955 hover:bg-amber-900 text-amber-200/60 hover:text-amber-100 transition-all shadow-3xs flex items-center justify-center"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          <div className="text-[10px] text-amber-800/40 uppercase tracking-widest">
            Smriti © 2026 | Dedicated to the teachers
          </div>
        </div>
      </footer>


      {/* PUBLIC DETAILED PROFILE VIEW MODAL */}
      <AnimatePresence>
        {activeTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveTeacher(null)}
              className="fixed inset-0 bg-amber-955/30 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: "spring", duration: 0.45 }}
              className="relative w-full max-w-3xl bg-white border border-amber-200 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col my-8 max-h-[85vh] focus:outline-hidden"
              tabIndex={-1}
            >
              {/* Back button + Copy link inside modal header */}
              <div className="absolute top-4 left-6 z-20 flex items-center gap-2">
                <button
                  onClick={() => setActiveTeacher(null)}
                  className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 hover:text-amber-900 border border-amber-200 bg-white rounded-md transition-all shadow-3xs"
                >
                  <ArrowLeft size={12} />
                  Back
                </button>

                {!["1", "2", "3", "4", "5", "6"].includes(activeTeacher.id) && (
                  <button
                    onClick={() => handleCopyLink(activeTeacher)}
                    className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-750 hover:text-amber-900 border border-amber-200 bg-white rounded-md transition-all shadow-3xs"
                  >
                    {copiedId === activeTeacher.id ? (
                      <>
                        <CheckCircle2 size={12} className="text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Share2 size={12} className="text-amber-600" />
                        Copy Link
                      </>
                    )}
                  </button>
                )}
              </div>

              <button
                ref={closeButtonRef}
                onClick={() => setActiveTeacher(null)}
                aria-label="Close modal"
                className="absolute top-4 right-4 z-20 p-2 rounded-full text-amber-800/50 hover:text-amber-955 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              >
                <X size={16} />
              </button>

              <div className="overflow-y-auto p-6 md:p-10 pt-16 space-y-8 scroll-smooth">
                
                {/* 1. Header Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="flex flex-col items-center text-center border-b border-amber-100 pb-8"
                >
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-amber-300 p-1 bg-white mb-4 shadow-sm">
                    <div className="w-full h-full rounded-full overflow-hidden bg-linear-to-br from-amber-50 to-amber-150 flex items-center justify-center font-serif text-3xl font-bold text-amber-900 relative">
                      {activeTeacher.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={activeTeacher.photo}
                          alt={activeTeacher.name}
                          className="w-full h-full object-cover relative z-10"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : null}
                      <div className={`absolute inset-0 opacity-15 ${activeTeacher.bgPattern}`} />
                      <span className="absolute z-0">{activeTeacher.initials}</span>
                    </div>
                  </div>

                  <h3 className="font-serif text-3xl font-extrabold text-amber-955">
                    {activeTeacher.name}
                  </h3>
                  <p className="text-amber-800 font-serif font-medium text-sm mt-1">
                    {activeTeacher.designation} &bull; <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-full">{activeTeacher.subject}</span>
                  </p>
                  <p className="text-xs text-amber-800/40 mt-1.5 font-medium flex items-center gap-1.5">
                    <GraduationCap size={13} className="text-amber-500/70" />
                    {activeTeacher.college} | {activeTeacher.years}
                  </p>
                </motion.div>

                {activeTeacher.id === "5" || activeTeacher.id === "6" ? (
                  <div className="bg-amber-50/40 border border-amber-200/50 p-8 rounded-xl text-center space-y-4 my-6 shadow-3xs">
                    <div className="w-12 h-12 rounded-full bg-amber-100/80 flex items-center justify-center mx-auto text-amber-750">
                      <GraduationCap className="stroke-[1.25]" size={24} />
                    </div>
                    <p className="font-serif text-base md:text-lg text-amber-955 italic leading-relaxed">
                      &ldquo;It is a privilege to begin this academic journey under her guidance in the 5th semester. Excited to learn, grow, and create inspiring memories under her mentorship.&rdquo;
                    </p>
                  </div>
                ) : (
                  <>
                    {/* 2. "Best Advice" Section */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-3"
                    >
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-amber-500 text-center">Words That Stay</h4>
                      <div className="bg-[#fffdf2] border border-amber-200/60 p-6 md:p-8 rounded-xl text-center shadow-3xs relative overflow-hidden">
                        <div className="absolute top-2 left-4 text-3xl font-serif text-amber-300 select-none opacity-40">❝</div>
                        <p className="font-serif text-base md:text-lg italic text-amber-900 leading-relaxed px-4">
                          {activeTeacher.bestAdvice}
                        </p>
                        <div className="absolute bottom-1 right-4 text-3xl font-serif text-amber-300 select-none opacity-40">❞</div>
                      </div>
                    </motion.div>

                    {/* 3. "Favorite Memory" Section */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="space-y-3"
                    >
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-amber-500 flex items-center gap-1.5">
                        <MessageSquare size={13} className="text-amber-500" />
                        A Moment to Remember
                      </h4>
                      <div className="bg-[#faf7ee]/60 border border-amber-100 p-5 rounded-xl text-sm leading-relaxed text-amber-900/80 italic whitespace-pre-line">
                        {activeTeacher.favoriteMemory}
                      </div>
                    </motion.div>

                    {/* 4. "Teaching Style & Personality" Section */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className="border border-amber-100 p-4 rounded-xl space-y-1.5 bg-white shadow-3xs">
                        <h5 className="text-[10px] uppercase font-bold tracking-wider text-amber-500 flex items-center gap-1.5">
                          <BookOpen size={13} />
                          How They Taught
                        </h5>
                        <p className="text-xs text-amber-900/70 leading-relaxed">{activeTeacher.teachingStyle}</p>
                      </div>

                      <div className="border border-amber-100 p-4 rounded-xl space-y-1.5 bg-white shadow-3xs">
                        <h5 className="text-[10px] uppercase font-bold tracking-wider text-amber-500 flex items-center gap-1.5">
                          <User size={13} />
                          Who They Were
                        </h5>
                        <p className="text-xs text-amber-900/70 leading-relaxed">{activeTeacher.personality}</p>
                      </div>
                    </motion.div>

                    {/* 5. "Impact & Legacy" Section */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="space-y-4"
                    >
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-amber-500">How They Shaped Me</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Life Lesson */}
                        <div className="border border-amber-150/70 p-4 rounded-xl bg-white shadow-3xs space-y-1.5">
                          <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600 w-fit">
                            <Award size={14} />
                          </div>
                          <h5 className="text-xs font-bold text-amber-955">Life Lesson</h5>
                          <p className="text-[11px] text-amber-900/70 leading-relaxed">{activeTeacher.lifeLesson}</p>
                        </div>

                        {/* The Difference */}
                        <div className="border border-amber-150/70 p-4 rounded-xl bg-white shadow-3xs space-y-1.5">
                          <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600 w-fit">
                            <Zap size={14} />
                          </div>
                          <h5 className="text-xs font-bold text-amber-955">The Difference</h5>
                          <p className="text-[11px] text-amber-900/70 leading-relaxed">{activeTeacher.howTheyShaped}</p>
                        </div>

                        {/* Skills Gained */}
                        <div className="border border-amber-150/70 p-4 rounded-xl bg-white shadow-3xs space-y-1.5">
                          <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600 w-fit">
                            <Target size={14} />
                          </div>
                          <h5 className="text-xs font-bold text-amber-955">Skills I Gained</h5>
                          <p className="text-[11px] text-amber-900/70 leading-relaxed">{activeTeacher.skillsLearned}</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* 6. Signature Line Section */}
                    {activeTeacher.favoriteSaying && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-amber-50 border border-amber-200/50 p-4 rounded-xl text-center relative overflow-hidden"
                      >
                        <span className="text-[9px] uppercase font-bold tracking-widest text-amber-600 block mb-1">Signature Saying</span>
                        <p className="font-serif italic text-base text-amber-900/90 tracking-wide">
                          &ldquo;{activeTeacher.favoriteSaying}&rdquo;
                        </p>
                      </motion.div>
                    )}
                  </>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ADD NEW TRIBUTE MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-amber-955/40 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.45 }}
              className="relative w-full max-w-xl bg-white border border-amber-200 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col my-8 max-h-[85vh]"
            >
              <div className="p-6 border-b border-amber-100 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-amber-955 flex items-center gap-1.5">
                    <Award className="text-amber-500" size={20} />
                    Add a New Tribute
                  </h3>
                  <p className="text-xs text-amber-800/60 mt-0.5">Honor a teacher who guided your steps.</p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-full text-amber-800/60 hover:text-amber-955 hover:bg-amber-50 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddTribute} className="overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Teacher&apos;s Name *</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Mrs. Susan Mathew"
                      className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Designation / Title *</label>
                    <input
                      type="text"
                      required
                      value={newDesignation}
                      onChange={(e) => setNewDesignation(e.target.value)}
                      placeholder="e.g. Assistant Professor"
                      className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-950"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Subject Taught *</label>
                    <input
                      type="text"
                      required
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="e.g. Chemistry"
                      className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-955"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-amber-800 mb-1">College/School *</label>
                    <input
                      type="text"
                      required
                      value={newCollege}
                      onChange={(e) => setNewCollege(e.target.value)}
                      placeholder="e.g. Marwadi University"
                      className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-955"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Years Taught</label>
                    <input
                      type="text"
                      value={newYears}
                      onChange={(e) => setNewYears(e.target.value)}
                      placeholder="e.g. 2025-2026"
                      className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-955"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Teacher&apos;s Email *</label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="teacher@school.edu"
                      className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-955"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Photo Local Filepath (Optional)</label>
                  <input
                    type="text"
                    value={newPhotoPath}
                    onChange={(e) => setNewPhotoPath(e.target.value)}
                    placeholder="e.g. C:\Users\sharm\OneDrive\Desktop\MU\TEACHERS\Photo.jpeg"
                    className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-955 placeholder:text-amber-800/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Best Advice (One-liner quote) *</label>
                  <input
                    type="text"
                    required
                    value={newBestLesson}
                    onChange={(e) => setNewBestLesson(e.target.value)}
                    placeholder="e.g. Focus on understandings concepts instead of marks."
                    className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-955 placeholder:text-amber-800/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Favorite Memory Story *</label>
                  <textarea
                    required
                    rows={2}
                    value={newMemory}
                    onChange={(e) => setNewMemory(e.target.value)}
                    placeholder="Share a specific moment, how they helped you..."
                    className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-955 placeholder:text-amber-800/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Teaching Style</label>
                    <input
                      type="text"
                      value={newTeachingStyle}
                      onChange={(e) => setNewTeachingStyle(e.target.value)}
                      placeholder="e.g. Practical and interactive"
                      className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-955"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Personality Traits</label>
                    <input
                      type="text"
                      value={newPersonality}
                      onChange={(e) => setNewPersonality(e.target.value)}
                      placeholder="e.g. Calm and self focused"
                      className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-955"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Life Lesson</label>
                    <input
                      type="text"
                      value={newLifeLesson}
                      onChange={(e) => setNewLifeLesson(e.target.value)}
                      placeholder="e.g. Consistency"
                      className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-955"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-amber-800 mb-1">How They Shaped You</label>
                    <input
                      type="text"
                      value={newHowTheyShaped}
                      onChange={(e) => setNewHowTheyShaped(e.target.value)}
                      placeholder="e.g. Never stop trying"
                      className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-955"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Skills Gained</label>
                    <input
                      type="text"
                      value={newSkillsLearned}
                      onChange={(e) => setNewSkillsLearned(e.target.value)}
                      placeholder="e.g. Code optimization"
                      className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-955"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Signature Saying</label>
                  <input
                    type="text"
                    value={newFavoriteSaying}
                    onChange={(e) => setNewFavoriteSaying(e.target.value)}
                    placeholder="e.g. Marks will follow, focus on skills"
                    className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-955"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-colors shadow-md hover:shadow-lg mt-4"
                >
                  Publish Tribute to Wall
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE CUSTOM TRIBUTE LINK MODAL */}
      <AnimatePresence>
        {isCustomModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseCustomModal}
              className="fixed inset-0 bg-amber-955/40 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.45 }}
              className="relative w-full max-w-xl bg-white border border-amber-200 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col my-8 max-h-[85vh]"
            >
              <div className="p-6 border-b border-amber-100 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-amber-955 flex items-center gap-1.5">
                    Wish Your Teacher
                  </h3>
                  <p className="text-xs text-amber-800/60 mt-0.5">Generate a personalized step-by-step tribute link for your teacher.</p>
                </div>
                <button
                  onClick={handleCloseCustomModal}
                  className="p-1 rounded-full text-amber-800/60 hover:text-amber-955 hover:bg-amber-50 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleGenerateCustomLink} className="overflow-y-auto p-6 space-y-4">
                {generatedLink && (
                  <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl space-y-2 text-emerald-950 my-2 animate-fadeIn relative">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wide">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      Link Generated & Copied!
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedLink}
                        onClick={(e) => e.currentTarget.select()}
                        className="flex-1 px-3 py-1.5 text-xs border border-emerald-200 bg-white focus:outline-hidden rounded-lg text-emerald-900 font-mono select-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedLink);
                          setToastMessage("Link copied again!");
                          setShowToast(true);
                          setTimeout(() => setShowToast(false), 2000);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-[10px] text-emerald-800/80 leading-normal">
                      Share this link with your teacher. They will experience the tribute you crafted!
                    </p>
                  </div>
                )}

                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 block border-b border-amber-50 pb-1">1. Teacher's Details</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Teacher's Name *</label>
                    <input
                      type="text"
                      required
                      value={customTeacherName}
                      onChange={(e) => setCustomTeacherName(e.target.value)}
                      placeholder="e.g. Reshma Mam"
                      className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Designation / Title *</label>
                    <input
                      type="text"
                      required
                      value={customDesignation}
                      onChange={(e) => setCustomDesignation(e.target.value)}
                      placeholder="e.g. Assistant Professor"
                      className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-955"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Subject *</label>
                    <input
                      type="text"
                      required
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="e.g. Java Technology"
                      className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-955"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-amber-800 mb-1">College/School *</label>
                    <input
                      type="text"
                      required
                      value={customCollege}
                      onChange={(e) => setCustomCollege(e.target.value)}
                      placeholder="e.g. Marwadi University"
                      className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-955"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Teacher's Email *</label>
                  <input
                    type="email"
                    required
                    value={customTeacherEmail}
                    onChange={(e) => setCustomTeacherEmail(e.target.value)}
                    placeholder="teacher@university.edu"
                    className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-955"
                  />
                </div>

                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 block border-b border-amber-50 pt-2 pb-1">2. Your Tribute details</span>

                <div>
                  <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={customStudentName}
                    onChange={(e) => setCustomStudentName(e.target.value)}
                    placeholder="e.g. Ayush Sharma"
                    className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-955"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Teacher's Best Advice *</label>
                  <input
                    type="text"
                    required
                    value={customBestAdvice}
                    onChange={(e) => setCustomBestAdvice(e.target.value)}
                    placeholder="e.g. Focus on understandings concepts instead of marks."
                    className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-955"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Favorite Memory / Message *</label>
                  <textarea
                    required
                    rows={3}
                    value={customFavoriteMemory}
                    onChange={(e) => setCustomFavoriteMemory(e.target.value)}
                    placeholder="Share a specific moment, how they helped you, or your gratitude..."
                    className="w-full px-3 py-2 text-sm border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 rounded-lg text-amber-955 placeholder:text-amber-800/30"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-colors shadow-md hover:shadow-lg mt-4 flex items-center justify-center gap-1.5"
                >
                  <Send size={12} />
                  Generate & Copy Tribute Link
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LAST GENERATED LINK FLOATING CARD */}
      <AnimatePresence>
        {lastGeneratedLink && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 35, scale: 0.95 }}
            className="fixed bottom-6 left-6 z-40 bg-emerald-950 text-emerald-50 border border-emerald-900 shadow-2xl p-4 rounded-xl max-w-sm w-[calc(100vw-3rem)] sm:w-80"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wide">
                <Sparkle size={13} className="text-emerald-400 animate-pulse" />
                Tribute Link Generated
              </div>
              <button
                onClick={() => {
                  setLastGeneratedLink("");
                  setLastGeneratedTeacher("");
                  localStorage.removeItem("smriti_last_link");
                  localStorage.removeItem("smriti_last_teacher");
                }}
                className="text-emerald-500 hover:text-emerald-300 transition-colors"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-[11px] text-emerald-200/80 mb-2.5 leading-snug">
              Here is the tribute link for <strong className="text-white">{lastGeneratedTeacher}</strong>:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={lastGeneratedLink}
                onClick={(e) => e.currentTarget.select()}
                className="flex-1 px-2.5 py-1 text-[10px] bg-emerald-900 border border-emerald-850 rounded-lg text-emerald-200 focus:outline-hidden font-mono truncate select-all"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(lastGeneratedLink);
                  setToastMessage("Copied again!");
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 2000);
                }}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors"
              >
                Copy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PASSWORD VERIFICATION MODAL */}
      <AnimatePresence>
        {isPasswordModalOpen && passwordTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsPasswordModalOpen(false);
                setPasswordTeacher(null);
              }}
              className="fixed inset-0 bg-amber-955/35 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-sm bg-white border-2 border-amber-200 rounded-2xl shadow-2xl p-6 z-10 flex flex-col diary-page"
            >
              <button
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordTeacher(null);
                }}
                className="absolute top-4 right-4 text-amber-800/60 hover:text-amber-955 transition-colors"
              >
                <X size={16} />
              </button>

              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto text-amber-600 border border-amber-200">
                  <Lock size={20} className="stroke-[1.5]" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-amber-955">Verify Access</h3>
                  <p className="text-xs text-amber-800/60 leading-normal px-2">
                    Enter the password to copy the shareable link for <strong className="text-amber-900">{passwordTeacher.name}</strong>.
                  </p>
                </div>

                <form onSubmit={handleVerifyPassword} className="space-y-3 pt-2 text-left">
                  <div className="space-y-1">
                    <input
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        if (passwordError) setPasswordError(false);
                      }}
                      placeholder="Enter password..."
                      className={`w-full px-3.5 py-2 text-xs text-center font-mono border ${
                        passwordError ? "border-red-400 focus:ring-red-400" : "border-amber-200 focus:ring-amber-400"
                      } bg-[#fffdfa] rounded-lg text-amber-955 placeholder:text-amber-800/30 focus:outline-hidden focus:ring-2`}
                      autoFocus
                    />
                    {passwordError && (
                      <p className="text-[10px] text-red-600 font-semibold text-center mt-1">
                        Incorrect Password! Please try again.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs"
                  >
                    Verify & Copy
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST ALERTS SYSTEM */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-amber-950 text-amber-50 px-4 py-3 rounded-xl border border-amber-900 shadow-xl flex items-center gap-2 text-xs font-semibold max-w-sm"
          >
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
