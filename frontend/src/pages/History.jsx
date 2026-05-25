import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { History as HistoryIcon, Search, Eye, Filter, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/interview/history?company=${search}&type=${typeFilter}`);
      if (res.data.success) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.error('Failed to load history list:', err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
        <div className="w-12 h-12 rounded-full border-4 border-t-primary border-r-transparent border-l-transparent border-b-secondary animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Interview History & Evaluations</h2>
        <p className="text-sm font-semibold text-foreground/50 mt-1">
          Access diagnostic reports, technical grades, and communication audits from all your mock rounds.
        </p>
      </div>

      {/* Filter and Search Box */}
      <div className="p-4 rounded-3xl glass-card border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by target company..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card/60 border border-border focus:border-primary focus:outline-none text-xs font-semibold"
          />
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40">
            <Search className="w-4 h-4" />
          </span>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground/50">
            <Filter className="w-4 h-4" /> Filter Category:
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-card/60 border border-border text-xs font-bold focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="HR">HR</option>
            <option value="Behavioral">Behavioral</option>
            <option value="Coding">Coding</option>
            <option value="Aptitude">Aptitude</option>
          </select>
        </div>
      </div>

      {/* List content */}
      {history.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-3xl glass-card glass-card-hover flex flex-col gap-4 relative"
            >
              <div className="flex justify-between items-start border-b border-border/40 pb-3">
                <div>
                  <span className="text-[9px] font-black bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {item.roundType} Round
                  </span>
                  <h3 className="text-base font-extrabold text-foreground mt-1.5">{item.targetRole}</h3>
                  <span className="text-xs font-semibold text-foreground/50">Targeting {item.targetCompany}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block">Grade</span>
                  <span className="text-xl font-black text-secondary">{item.overallScore}%</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-bold text-foreground/50 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-foreground/45" />
                  {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                
                {item.reportId ? (
                  <Link
                    to={`/report/${item.reportId}`}
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Eye className="w-4 h-4 text-primary" /> View Report
                  </Link>
                ) : (
                  <span className="text-foreground/30 italic">No report available</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-3xl glass-card border border-border/80 text-center flex flex-col items-center gap-3">
          <HistoryIcon className="w-10 h-10 text-foreground/20" />
          <h3 className="text-lg font-bold">No Completed Records</h3>
          <p className="text-sm font-semibold text-foreground/50 max-w-sm">
            There are no finalized mock evaluations matching your filter selection. Start an interview to see metrics here.
          </p>
        </div>
      )}
    </div>
  );
};

export default History;
