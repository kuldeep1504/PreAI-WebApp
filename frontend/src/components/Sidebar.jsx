import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Map, 
  Video, 
  Code2, 
  FileText, 
  History, 
  ShieldAlert,
  GraduationCap
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Career Roadmap', path: '/roadmap', icon: Map },
    { name: 'Mock Interview Room', path: '/interview', icon: Video },
    { name: 'Coding practice', path: '/code-practice', icon: Code2 },
    { name: 'ATS Resume Analyzer', path: '/resume-analyzer', icon: FileText },
    { name: 'History & Evaluations', path: '/history', icon: History },
  ];

  const activeStyle = "flex items-center gap-3.5 px-4 py-3 bg-gradient-to-r from-primary/20 to-secondary/5 border-l-4 border-primary text-primary font-bold shadow-[0_0_15px_rgba(99,102,241,0.06)] rounded-r-2xl transition-all";
  const inactiveStyle = "flex items-center gap-3.5 px-4 py-3 text-foreground/75 hover:text-primary border-l-4 border-transparent hover:border-primary/20 rounded-r-2xl hover:bg-card/25 transition-all font-medium";

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-30 w-64 glass-card border-r border-border/60 pt-20
      transform lg:translate-x-0 lg:static lg:h-[calc(100vh-65px)] transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex flex-col h-full justify-between pb-6">
        <div className="px-2 py-4 flex flex-col gap-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink 
                key={link.path} 
                to={link.path}
                onClick={onClose}
                className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}

          {user && user.role === 'admin' && (
            <NavLink 
              to="/admin" 
              onClick={onClose}
              className={({ isActive }) => isActive ? `${activeStyle} border-accent text-accent` : `${inactiveStyle} hover:text-accent`}
            >
              <ShieldAlert className="w-5 h-5 text-accent" />
              <span>Admin Panel</span>
            </NavLink>
          )}
        </div>

        {/* User Target Card in Sidebar */}
        {user && user.profile && user.profile.targetRole && (
          <div className="mx-4 p-4 rounded-2xl glass-card border border-border/80 flex flex-col gap-2.5 bg-gradient-to-b from-card/30 to-background/50">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-secondary" />
              <span className="text-xs font-bold text-secondary uppercase tracking-widest">Active Target</span>
            </div>
            <div>
              <h4 className="text-sm font-extrabold truncate text-foreground">{user.profile.targetRole}</h4>
              <p className="text-xs font-medium text-foreground/50 truncate">at {user.profile.targetCompany}</p>
            </div>
            <div className="w-full bg-border/40 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-secondary h-full rounded-full" 
                style={{ width: `${user.profile.roadmap ? '100%' : '20%'}` }}
              ></div>
            </div>
            <span className="text-[10px] font-semibold text-foreground/40 self-end">
              {user.profile.roadmap ? 'Roadmap Active' : 'Setup Roadmap'}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
