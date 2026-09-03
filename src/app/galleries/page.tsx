"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Sparkles, 
  Plus, 
  Download, 
  Mail, 
  Search 
} from "lucide-react";
import { getPublicTributeWalls, getWallByEditKey } from "../actions/wall";

export default function GalleriesPage() {
  // Tabs: 'public' | 'mine'
  const [galleryTab, setGalleryTab] = useState<"public" | "mine">("public");
  
  // Public directory states
  const [galleryWalls, setGalleryWalls] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingPublic, setIsLoadingPublic] = useState(false);
  
  // Personal list states
  const [myCreatedWalls, setMyCreatedWalls] = useState<any[]>([]);
  const [importEditKeyInput, setImportEditKeyInput] = useState("");
  const [isImportingWall, setIsImportingWall] = useState(false);
  
  // Toast alerts
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Trigger Toast Alert helper
  const triggerToast = (msg: string, duration = 3000) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), duration);
  };

  // Fetch public walls from database
  useEffect(() => {
    setIsLoadingPublic(true);
    getPublicTributeWalls().then((res) => {
      if (res.success && res.walls) {
        setGalleryWalls(res.walls);
      } else {
        triggerToast("Failed to fetch public walls.");
      }
      setIsLoadingPublic(false);
    }).catch(() => {
      setIsLoadingPublic(false);
      triggerToast("Error loading galleries.");
    });
  }, []);

  // Fetch local walls from browser localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const existing = localStorage.getItem("smriti_my_walls");
        if (existing) {
          setMyCreatedWalls(JSON.parse(existing));
        }
      } catch (err) {
        console.error("Failed parsing local walls:", err);
      }
    }
  }, []);

  // Handle importing custom wall via Edit Key
  const handleImportWallSubmit = async () => {
    if (!importEditKeyInput) {
      triggerToast("Please enter an Edit Key.");
      return;
    }

    setIsImportingWall(true);
    try {
      const res = await getWallByEditKey(importEditKeyInput.trim().toUpperCase());
      if (res.success && res.wall) {
        const wall = res.wall;
        
        // Add to local storage if not already there
        const existing = localStorage.getItem("smriti_my_walls");
        let list = existing ? JSON.parse(existing) : [];
        const alreadyExists = list.some((item: any) => item.id === wall.id);
        
        if (!alreadyExists) {
          const updatedList = [
            ...list,
            {
              id: wall.id,
              title: wall.title,
              theme: wall.theme,
              creatorName: wall.creatorName,
              editKey: importEditKeyInput.trim().toUpperCase()
            }
          ];
          localStorage.setItem("smriti_my_walls", JSON.stringify(updatedList));
          setMyCreatedWalls(updatedList);
        }
        
        triggerToast("Wall successfully imported! Redirecting...", 2000);
        setImportEditKeyInput("");
        
        // Redirect to live wall page after brief delay
        setTimeout(() => {
          window.location.href = `/?wall=${wall.id}`;
        }, 1200);
      } else {
        triggerToast(res.error || "Failed to find wall with this Edit Key.");
      }
    } catch (err) {
      console.error(err);
      triggerToast("An error occurred during import.");
    } finally {
      setIsImportingWall(false);
    }
  };

  // Filter public walls by search query
  const filteredPublicWalls = galleryWalls.filter(
    (wall) =>
      wall.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wall.creator_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-[#fffdf5] overflow-x-hidden font-sans selection:bg-amber-200 selection:text-amber-900">
      {/* Decorative patterns */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#b45309_0.8px,transparent_0.8px)] [background-size:16px_16px]" />
        <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-[radial-gradient(circle,#fefce8_0%,transparent_70%)]" />
      </div>

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-[#fffdf5]/85 backdrop-blur-md px-6 py-4 border-b border-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-serif text-xl font-black tracking-wide text-amber-955">Smriti</span>
          <span className="font-serif text-xl font-normal tracking-wide text-amber-800/85 italic">Galleries</span>
        </div>

        <button
          onClick={() => {
            window.location.href = "/";
          }}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border border-amber-250 text-amber-955 bg-amber-50/20 hover:bg-amber-50 cursor-pointer transition-colors shadow-2xs"
        >
          <ArrowLeft size={13} />
          Main Sanctuary
        </button>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 max-w-4xl mx-auto py-16 px-6 space-y-10">
        {/* Cover title */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-2">
            <span className="h-[1px] w-6 bg-amber-300" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 font-sans">Student Hallways</span>
            <span className="h-[1px] w-6 bg-amber-300" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-extrabold tracking-tight text-amber-955">
            Student Galleries
          </h1>
          <p className="text-sm text-amber-800/60 leading-relaxed">
            Walk through the hallways of gratitude. Browse public walls built by classmates or recover access to your custom spaces below.
          </p>
        </div>

        {/* TAB BUTTONS SELECTOR */}
        <div className="flex justify-center">
          <div className="grid w-full max-w-md grid-cols-2 gap-1 p-1 bg-amber-50 rounded-xl text-xs font-bold uppercase tracking-wider text-amber-800 border border-amber-200">
            <button
              type="button"
              onClick={() => setGalleryTab("public")}
              className={`py-3 rounded-lg transition-all text-center cursor-pointer ${
                galleryTab === "public"
                  ? "bg-amber-800 text-white shadow-xs"
                  : "hover:bg-amber-500/10 text-amber-800/70"
              }`}
            >
              Public Directories
            </button>
            <button
              type="button"
              onClick={() => setGalleryTab("mine")}
              className={`py-3 rounded-lg transition-all text-center cursor-pointer ${
                galleryTab === "mine"
                  ? "bg-amber-800 text-white shadow-xs"
                  : "hover:bg-amber-500/10 text-amber-800/70"
              }`}
            >
              My Created Walls
            </button>
          </div>
        </div>

        {/* TAB CONTENT PANEL */}
        <div className="bg-[#fffdfa] border border-amber-200 p-6 md:p-8 rounded-2xl shadow-md min-h-[300px]">
          {galleryTab === "public" ? (
            <div className="space-y-6">
              {/* Search Bar for Public List */}
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-3.5 text-amber-800/40 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search walls by title or creator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs border border-amber-200 bg-white rounded-xl text-amber-955 placeholder:text-amber-800/35 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>

              {isLoadingPublic ? (
                <div className="text-center py-20 space-y-2">
                  <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <span className="text-xs text-amber-800/60 font-semibold block">Fetching sanctuary walls...</span>
                </div>
              ) : filteredPublicWalls.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <p className="text-sm font-semibold text-amber-800/60">
                    {searchQuery ? "No matching walls found." : "No public galleries created yet."}
                  </p>
                  <p className="text-xs text-amber-800/40">
                    {searchQuery ? "Try searching for another keyword!" : "Be the first to build a custom wall!"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPublicWalls.map((wall) => {
                    let themeDot = "bg-amber-400";
                    if (wall.theme === "emerald") themeDot = "bg-emerald-500";
                    if (wall.theme === "royal") themeDot = "bg-indigo-500";
                    if (wall.theme === "mystic") themeDot = "bg-neutral-800";
                    if (wall.theme === "vrindavan") themeDot = "bg-blue-900 border border-yellow-400";

                    return (
                      <div
                        key={wall.id}
                        onClick={() => {
                          window.location.href = `/?wall=${wall.id}`;
                        }}
                        className="bg-white hover:bg-amber-50/10 border border-amber-100 hover:border-amber-250 p-5 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between shadow-2xs hover:shadow-xs group"
                      >
                        <div className="space-y-1.5 flex-1 pr-4 text-left">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${themeDot}`} title={`Theme: ${wall.theme}`} />
                            <h4 className="font-serif font-bold text-amber-955 text-sm md:text-base group-hover:text-amber-700 transition-colors">
                              {wall.title}
                            </h4>
                          </div>
                          <p className="text-xs text-amber-800/60 leading-none">
                            By <strong>{wall.creator_name}</strong>
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold group-hover:text-amber-800">
                          <span>Open</span>
                          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* MY CREATED / IMPORTED WALLS */
            <div className="space-y-6">
              {/* Import Section */}
              <div className="p-4 bg-amber-50/30 border border-amber-250/50 rounded-xl space-y-3 text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block border-b border-amber-200/50 pb-1">Import Wall via Edit Key</span>
                <p className="text-xs text-amber-800/60 leading-relaxed font-sans">
                  Access an unlisted private wall or load a wall you built on another device/browser using its secret Edit Key:
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="e.g. EDIT-A1B2C3"
                    value={importEditKeyInput}
                    onChange={(e) => setImportEditKeyInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 text-xs border border-amber-250 bg-white rounded-lg text-amber-955 placeholder:text-amber-800/35 uppercase font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleImportWallSubmit}
                    disabled={isImportingWall}
                    className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isImportingWall ? "Verifying..." : "Import Wall"}
                  </button>
                </div>
              </div>

              {/* Personal Walls list mapping */}
              {myCreatedWalls.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <p className="text-sm font-semibold text-amber-800/50 italic">No custom walls stored in this browser yet.</p>
                  <p className="text-xs text-amber-800/40 max-w-xs mx-auto leading-normal">
                    Walls you generate will automatically be listed here. You can also import them by entering their Edit Key above!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myCreatedWalls.map((wall) => {
                    let themeDot = "bg-amber-400";
                    if (wall.theme === "emerald") themeDot = "bg-emerald-500";
                    if (wall.theme === "royal") themeDot = "bg-indigo-500";
                    if (wall.theme === "mystic") themeDot = "bg-neutral-800";
                    if (wall.theme === "vrindavan") themeDot = "bg-blue-900 border border-yellow-400";

                    return (
                      <div
                        key={wall.id}
                        onClick={() => {
                          window.location.href = `/?wall=${wall.id}`;
                        }}
                        className="bg-white hover:bg-amber-50/10 border border-amber-100 hover:border-amber-250 p-5 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between shadow-2xs hover:shadow-xs group"
                      >
                        <div className="space-y-1.5 flex-1 pr-4 text-left">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${themeDot}`} title={`Theme: ${wall.theme}`} />
                            <h4 className="font-serif font-bold text-amber-955 text-sm md:text-base group-hover:text-amber-700 transition-colors">
                              {wall.title}
                            </h4>
                          </div>
                          <p className="text-xs text-amber-800/60 leading-none">
                            By <strong>{wall.creatorName || "Student"}</strong>
                          </p>
                          <div className="flex items-center gap-1.5 pt-1 text-[10px] text-amber-700/60 font-semibold font-mono">
                            <span>Key: {wall.editKey || "Verified"}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold group-hover:text-amber-800">
                          <span>Open</span>
                          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

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
