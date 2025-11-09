import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type HistoryEntry = {
  id: string;
  weekRange: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  currentChildName: string;
};

const HistoryModal: React.FC<Props> = ({ open, onClose, currentChildName }) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showSort, setShowSort] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);
  // Sample history data - in real app this would come from database
  const historyEntries: HistoryEntry[] = [
    { id: '1', weekRange: 'October 20, 2025 – October 26, 2025' },
    { id: '2', weekRange: 'October 13, 2025 – October 19, 2025' },
    { id: '3', weekRange: 'October 06, 2025 – October 12, 2025' },
    { id: '4', weekRange: 'September 29, 2025 – October 05, 2025' },
    { id: '5', weekRange: 'September 22, 2025 – September 28, 2025' },
    { id: '6', weekRange: 'September 15, 2025 – September 21, 2025' },
    { id: '7', weekRange: 'September 08, 2025 – September 14, 2025' },
    { id: '8', weekRange: 'September 01, 2025 – September 07, 2025' },
  ];

  // Parse the start date (left side of the range) into a sortable timestamp
  const parseWeekStart = (range: string): number => {
    // Split on en-dash or hyphen
    const parts = range.split('–');
    const left = (parts[0] ?? range).replace(/\u2013|\u2014/g, '-').split('-')[0].trim();
    // Example left: "October 20, 2025"
    const d = new Date(left);
    const ts = d.getTime();
    return Number.isFinite(ts) ? ts : 0;
  };

  const sortedEntries = useMemo(() => {
    const items = [...historyEntries];
    items.sort((a, b) => {
      const aTs = parseWeekStart(a.weekRange);
      const bTs = parseWeekStart(b.weekRange);
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
          {sortedEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <p className="font-semibold text-sm text-gray-1000">
                For: <span className="font-semibold text-gray-800">{currentChildName || '—'}</span>
              </p>
              <p className="font-semibold text-xs text-gray-1000 mt-1">
                Week of: <span className="font-semibold text-gray-800">{entry.weekRange}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default HistoryModal;
