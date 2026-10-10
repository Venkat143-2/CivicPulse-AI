import React, { useState } from 'react';
import {
  Activity,
  Menu,
  X,
  PlusCircle,
  Search,
  Shield,
  User,
  LogOut,
  Database,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { SupabaseSetupModal } from '../common/SupabaseSetupModal';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, isAdmin, isCitizen, logout, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/20 group-hover:scale-105 transition">
              <Activity className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                CivicPulse <span className="text-teal-400 font-black text-xs uppercase px-1.5 py-0.5 rounded bg-teal-950/80 border border-teal-800/80">AI</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block">
                City Issue Resolution System
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300">
            <button
              onClick={() => handleNav('home')}
              className={`px-3 py-1.5 rounded-lg transition ${
                currentPage === 'home' ? 'text-white bg-slate-800 font-semibold' : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => handleNav('track')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                currentPage === 'track' ? 'text-white bg-slate-800 font-semibold' : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-teal-400" />
              <span>Track Issue</span>
            </button>

            {isCitizen && (
              <>
                <button
                  onClick={() => handleNav('citizen_dashboard')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    currentPage === 'citizen_dashboard'
                      ? 'text-white bg-slate-800 font-semibold'
                      : 'hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  My Reports
                </button>
                <button
                  onClick={() => handleNav('new_complaint')}
                  className="ml-1 px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold flex items-center gap-1.5 transition shadow-sm hover:scale-102"
                >
                  <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                  <span>Report Issue</span>
                </button>
              </>
            )}

            {isAdmin && (
              <>
                <button
                  onClick={() => handleNav('admin_dashboard')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    currentPage === 'admin_dashboard'
                      ? 'text-white bg-slate-800 font-semibold'
                      : 'hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Admin Ops
                </button>
                <button
                  onClick={() => handleNav('admin_complaints')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    currentPage === 'admin_complaints'
                      ? 'text-white bg-slate-800 font-semibold'
                      : 'hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Triage Queue
                </button>
                <button
                  onClick={() => handleNav('admin_map')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
                    currentPage === 'admin_map'
                      ? 'text-white bg-slate-800 font-semibold'
                      : 'hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-teal-400" />
                  <span>City Map</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action Tools */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Database & Schema Guide Trigger */}
            <button
              type="button"
              onClick={() => setShowDbModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition"
              title="Database & Architecture"
            >
              <Database className="w-3.5 h-3.5 text-teal-400" />
              <span>{isSupabaseConfigured ? 'Supabase' : 'Schema/DB'}</span>
            </button>

            {/* Role indicator & Quick switch */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="text-right leading-tight">
                  <div className="text-xs font-bold text-slate-200">{user.fullName}</div>
                  <div className="text-[10px] text-teal-400 font-semibold uppercase flex items-center justify-end gap-1">
                    {isAdmin ? <Shield className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                    <span>{user.role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => switchRole(isAdmin ? 'citizen' : 'admin')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 rounded-md transition"
                    title={`Switch to ${isAdmin ? 'Citizen' : 'Admin'} view`}
                  >
                    Switch to {isAdmin ? 'Citizen' : 'Admin'}
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      handleNav('portal');
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleNav('portal')}
                className="px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <span>Select Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setShowDbModal(true)}
              className="p-1.5 text-teal-400 bg-slate-800 rounded-lg"
              title="Database Info"
            >
              <Database className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-6 space-y-2">
            <button
              onClick={() => handleNav('home')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200"
            >
              Overview
            </button>
            <button
              onClick={() => handleNav('track')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-teal-400 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Track Complaint</span>
            </button>

            {isCitizen && (
              <>
                <button
                  onClick={() => handleNav('citizen_dashboard')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200"
                >
                  Citizen Dashboard
                </button>
                <button
                  onClick={() => handleNav('new_complaint')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold bg-teal-500 text-slate-950 flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Report an Issue</span>
                </button>
              </>
            )}

            {isAdmin && (
              <>
                <button
                  onClick={() => handleNav('admin_dashboard')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200"
                >
                  Admin Operations Dashboard
                </button>
                <button
                  onClick={() => handleNav('admin_complaints')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200"
                >
                  All Complaints Queue
                </button>
                <button
                  onClick={() => handleNav('admin_map')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200"
                >
                  City Map View
                </button>
              </>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              {user ? (
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="text-xs font-bold text-slate-200">{user.fullName}</div>
                    <div className="text-[10px] text-teal-400 uppercase font-semibold">Active: {user.role}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => switchRole(isAdmin ? 'citizen' : 'admin')}
                      className="px-2.5 py-1 text-xs bg-slate-800 text-teal-300 rounded font-medium"
                    >
                      To {isAdmin ? 'Citizen' : 'Admin'}
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        handleNav('portal');
                      }}
                      className="p-1 text-rose-400"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleNav('portal')}
                  className="w-full py-2 bg-teal-500 text-slate-950 font-bold text-center rounded-lg text-sm"
                >
                  Choose Portal
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Supabase & Architecture setup modal */}
      <SupabaseSetupModal isOpen={showDbModal} onClose={() => setShowDbModal(false)} />
    </>
  );
};
