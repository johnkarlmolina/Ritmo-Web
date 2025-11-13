import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
// @ts-ignore - local JS client without types shipped here
import { supabase } from '../supabaseClient';

type HistoryEntry = {
  id: string;
  weekRange: string;
  startDate: Date;
};

type Props = {
  open: boolean;
  onClose: () => void;
  currentChildName: string;
  onSelectWeek?: (startDate: Date, endDate: Date, weekRange: string) => void;
};

const HistoryModal: React.FC<Props> = ({ open, onClose, currentChildName, onSelectWeek }) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showSort, setShowSort] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const headerRef = useRef<HTMLDivElement | null>(null);

  // Generate weeks since account creation
  useEffect(() => {
    if (!open) return;
    
    const generateWeeks = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const accountCreatedAt = new Date(user.created_at);
        const today = new Date();
        
        // Get Monday of account creation week
        const accountDayOfWeek = accountCreatedAt.getDay();
        const daysToMonday = accountDayOfWeek === 0 ? 6 : accountDayOfWeek - 1;
        const firstMonday = new Date(accountCreatedAt);
        firstMonday.setDate(accountCreatedAt.getDate() - daysToMonday);
        firstMonday.setHours(0, 0, 0, 0);
        
        // Get Monday of current week
        const todayDayOfWeek = today.getDay();
        const todayDaysToMonday = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;
        const currentMonday = new Date(today);
        currentMonday.setDate(today.getDate() - todayDaysToMonday);
        currentMonday.setHours(0, 0, 0, 0);
        
        // Generate all weeks from first Monday to current week
        const weeks: HistoryEntry[] = [];
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const formatDate = (date: Date) => {
          return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
        };
        
        let weekStart = new Date(firstMonday);
        let weekId = 1;
        
        while (weekStart <= currentMonday) {
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          weeks.push({
            id: String(weekId++),
            weekRange: `${formatDate(weekStart)} - ${formatDate(weekEnd)}`,
            startDate: new Date(weekStart)
          });
          
          // Move to next Monday
          weekStart.setDate(weekStart.getDate() + 7);
        }
        
        setHistoryEntries(weeks);
      } catch (error) {
        console.error('Error generating weeks:', error);
      }
    };
    
    generateWeeks();
  }, [open]);

  const sortedEntries = useMemo(() => {
    const items = [...historyEntries];
    items.sort((a, b) => {
      const aTs = a.startDate.getTime();
      const bTs = b.startDate.getTime();
      return sortOrder === 'asc' ? aTs - bTs : bTs - aTs;
    });
    return items;
  }, [historyEntries, sortOrder]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // Close sort menu when clicking outside
  useEffect(() => {
    if (!showSort) return;
    const onDocClick = (e: MouseEvent) => {
      const node = headerRef.current;
      if (node && e.target instanceof Node && !node.contains(e.target)) {
        setShowSort(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [showSort]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#D4E5E5] rounded-3xl shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div ref={headerRef} className="flex items-center justify-between px-6 py-4 border-b border-teal-200 relative">
          <button
            onClick={onClose}
            className="text-[#000000] hover:text-teal-600 underline text-sm font-medium"
          >
            Back
          </button>
          <h2 className="text-xl font-bold text-gray-900">History</h2>
          {/* Sort button with dropdown overlay */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSort((s) => !s)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition outline-none focus:ring-2 focus:ring-teal-300"
              aria-haspopup="menu"
              aria-expanded={showSort}
            >
              <span>Sort</span>
              <span className="text-[10px]">▾</span>
            </button>

            {showSort && (
              <div className="absolute right-0 mt-2 w-16 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-1">
                <button
                  type="button"
                  onClick={() => { setSortOrder('asc'); setShowSort(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium flex items-center justify-between hover:bg-teal-50 ${sortOrder === 'asc' ? 'text-teal-700' : 'text-gray-700'}`}
                >
                  Asc
                  {sortOrder === 'asc' && <span>✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => { setSortOrder('desc'); setShowSort(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium flex items-center justify-between hover:bg-teal-50 ${sortOrder === 'desc' ? 'text-teal-700' : 'text-gray-700'}`}
                >
                  Desc
                  {sortOrder === 'desc' && <span>✓</span>}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {sortedEntries.map((entry) => {
            const weekEnd = new Date(entry.startDate);
            weekEnd.setDate(entry.startDate.getDate() + 6);
            
            return (
              <div
                key={entry.id}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  if (onSelectWeek) {
                    onSelectWeek(entry.startDate, weekEnd, entry.weekRange);
                    onClose();
                  }
                }}
              >
                <p className="font-semibold text-sm text-gray-1000">
                  For: <span className="font-semibold text-gray-800">{currentChildName || '—'}</span>
                </p>
                <p className="font-semibold text-xs text-gray-1000 mt-1">
                  Week of: <span className="font-semibold text-gray-800">{entry.weekRange}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default HistoryModal;
