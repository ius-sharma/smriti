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
  Database 
} from "lucide-react";
import { adminGetAllWalls, adminDeleteWall, adminUpdateWall, seedAdminWall } from "../actions/wall";

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

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={handleSeedAdminWall}
                disabled={isSeeding}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-amber-800 hover:bg-amber-900 text-white cursor-pointer transition-colors shadow-2xs disabled:opacity-50"
              >
                <Sparkles size={13} className="text-amber-200" />
                <span>{isSeeding ? "Seeding..." : "Seed Admin's Wall"}</span>
              </button>

              {/* Registry Search */}
              <div className="relative w-full md:max-w-xs">
                <Search size={14} className="absolute left-3 top-3.5 text-amber-800/40 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by Title, Creator or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-amber-200 bg-white rounded-xl text-amber-955 placeholder:text-amber-800/35 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* TABLE OF WALLS */}
          {isLoading ? (
            <div className="text-center py-20 space-y-2">
              <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <span className="text-xs text-amber-800/60 font-semibold block">Accessing central ledger...</span>
            </div>
          ) : filteredWalls.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xs text-amber-800/50 italic">No tribute walls found matching your registry query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-amber-100 rounded-xl">
              <table className="w-full text-left border-collapse bg-white">
                <thead>
                  <tr className="bg-amber-50/60 border-b border-amber-100 text-[10px] font-bold uppercase tracking-wider text-amber-900/80">
                    <th className="p-4">Wall Info</th>
                    <th className="p-4">Visibility</th>
                    <th className="p-4">Secret Edit Key</th>
                    <th className="p-4">Tributes</th>
                    <th className="p-4">Audit Logs</th>
                    <th className="p-4 text-center">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50 text-xs">
                  {filteredWalls.map((wall) => {
                    const tributesCount = Array.isArray(wall.tributes) 
                      ? wall.tributes.length 
                      : (typeof wall.tributes === 'object' && wall.tributes !== null) 
                        ? Object.keys(wall.tributes).length 
                        : 0;

                    const formattedDate = new Date(wall.created_at).toLocaleDateString('en-IN', {
                      dateStyle: 'medium'
                    });

                    return (
                      <tr key={wall.id} className="hover:bg-amber-50/10 transition-colors">
                        <td className="p-4 text-left">
                          <div className="font-bold text-amber-955">{wall.title}</div>
                          <div className="text-[10px] text-amber-850/60">By {wall.creator_name}</div>
                          <div className="text-[9px] font-mono text-amber-800/40 select-all">{wall.id}</div>
                        </td>
                        
                        <td className="p-4 uppercase">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                            wall.visibility === 'public' 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                              : wall.visibility === 'password'
                                ? 'bg-rose-50 text-rose-800 border border-rose-100'
                                : 'bg-indigo-50 text-indigo-800 border border-indigo-100'
                          }`}>
                            {wall.visibility}
                          </span>
                        </td>
                        
                        <td className="p-4 font-mono font-bold text-amber-900 select-all">
                          {wall.edit_key || "N/A"}
                        </td>
                        
                        <td className="p-4 font-semibold text-amber-800">
                          {tributesCount} tribute(s)
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
