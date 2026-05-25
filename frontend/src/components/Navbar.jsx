import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, LogOut, Shield, User, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full glass-card border-b border-border/60 px-4 py-3 flex items-center justify-between shadow-glass">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="lg:hidden text-foreground hover:text-primary transition-colors p-1"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-tr from-primary to-secondary p-2 rounded-xl shadow-neon-indigo group-hover:rotate-6 transition-transform">
            <span className="text-xl font-bold">🎙️</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-foreground via-slate-100 to-secondary bg-clip-text text-transparent tracking-tight">
            Prep<span className="text-primary font-extrabold">AI</span>
          </span>
        </Link>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          {/* Streak Indicator */}
          <div className="flex items-center gap-1.5 bg-card/65 px-3 py-1.5 rounded-full border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.08)]">
            <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            <span className="text-sm font-extrabold text-orange-400">{user.streak || 0} Day Streak</span>
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 bg-card/40 p-1 pr-3 rounded-full border border-border/80 hover:border-primary/40 transition-all"
            >
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`} 
                alt={user.name} 
                className="w-8 h-8 rounded-full border border-border bg-background"
              />
              <span className="text-sm font-semibold hidden md:inline">{user.name}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-52 glass-card border border-border shadow-2xl rounded-2xl p-2 py-1">
                <div className="px-3 py-2 border-b border-border/50 text-xs font-semibold text-foreground/50">
                  Logged in as <span className="text-primary font-semibold">{user.email}</span>
                </div>
                
                <Link 
                  to="/dashboard" 
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 mt-1 text-sm font-medium text-foreground/80 hover:text-primary rounded-xl hover:bg-primary/5 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>

                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-foreground/80 hover:text-accent rounded-xl hover:bg-accent/5 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}

                <button 
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2.5 my-1 text-sm font-medium text-danger/80 hover:text-danger rounded-xl hover:bg-danger/5 transition-colors border-t border-border/30"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
