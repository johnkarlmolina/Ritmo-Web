import React, { useEffect, useState } from "react";
// @ts-ignore - local JS client without types shipped here
import { supabase } from '../supabaseClient'
// @ts-ignore - jsPDF types
import jsPDF from 'jspdf';
import HistoryModal from '../components/HistoryModal';
import { showConfirm } from '../utils/alerts';

const Progress: React.FC = () => {
  const [childNickname, setChildNickname] = useState("");
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // Sample data - in a real app, this would come from props or state
  const weekRange = "October 20, 2025 – October 26, 2025";
  const totalTasks = 21;
  const completedTasks = 14;
  const completionRate = 66;
  const tasks = [
    "BRUSH TEETH",
    "EAT FOOD",
    "WASH BODY",
    "CHANGE CLOTHES",
    "GO TO SCHOOL",
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const meta = (user.user_metadata ?? {}) as any;
        setChildNickname(meta?.child_name ?? "");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;

    // Colors (RGB values for jsPDF)
    const tealColor: [number, number, number] = [45, 119, 120]; // #2D7778
    const lightTealColor: [number, number, number] = [210, 240, 240]; // Light teal background
    const redColor: [number, number, number] = [239, 68, 68]; // Red for missed
    const orangeColor = redColor; // Alias for compatibility

    // First Card - Weekly Performance Summary
    doc.setFillColor(245, 250, 250);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 45, 5, 5, 'F');
    doc.setDrawColor(200, 220, 220);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 45, 5, 5, 'S');

    yPos += 8;
    
    // Title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Weekly Performance Summary', margin + 5, yPos);
    yPos += 8;

    // For and Week info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`For: ${childNickname || 'lorem malakas'}`, margin + 5, yPos);
    yPos += 5;
    doc.text(`Week of: ${weekRange}`, margin + 5, yPos);
    yPos += 10;

    // Stats boxes in a row
    const boxWidth = 35;
    const boxHeight = 20;
    const boxSpacing = 5;
    const startX = margin + 10;

    // Total Task box
    doc.setFillColor(lightTealColor[0], lightTealColor[1], lightTealColor[2]);
    doc.roundedRect(startX, yPos, boxWidth, boxHeight, 3, 3, 'F');
    doc.setDrawColor(tealColor[0], tealColor[1], tealColor[2]);
    doc.roundedRect(startX, yPos, boxWidth, boxHeight, 3, 3, 'S');
    
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.text('Total Task', startX + boxWidth / 2, yPos + 7, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(String(totalTasks), startX + boxWidth / 2, yPos + 15, { align: 'center' });

    // Completed box
    const completedX = startX + boxWidth + boxSpacing;
    doc.setFillColor(lightTealColor[0], lightTealColor[1], lightTealColor[2]);
    doc.roundedRect(completedX, yPos, boxWidth, boxHeight, 3, 3, 'F');
    doc.setDrawColor(tealColor[0], tealColor[1], tealColor[2]);
    doc.roundedRect(completedX, yPos, boxWidth, boxHeight, 3, 3, 'S');
    
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.text('Completed', completedX + boxWidth / 2, yPos + 7, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(String(completedTasks), completedX + boxWidth / 2, yPos + 15, { align: 'center' });

    // Rate box
    const rateX = completedX + boxWidth + boxSpacing;
    doc.setFillColor(lightTealColor[0], lightTealColor[1], lightTealColor[2]);
    doc.roundedRect(rateX, yPos, boxWidth, boxHeight, 3, 3, 'F');
    doc.setDrawColor(tealColor[0], tealColor[1], tealColor[2]);
    doc.roundedRect(rateX, yPos, boxWidth, boxHeight, 3, 3, 'S');
    
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.text('Rate', rateX + boxWidth / 2, yPos + 7, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`${completionRate}%`, rateX + boxWidth / 2, yPos + 15, { align: 'center' });

    yPos += 30;

    // Second Card - Ritmo Tracker
    doc.setFillColor(245, 250, 250);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 120, 5, 5, 'F');
    doc.setDrawColor(200, 220, 220);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 120, 5, 5, 'S');

    yPos += 8;
    
    // Title
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Ritmo Tracker', margin + 5, yPos);
    yPos += 8;

    // Table headers
    const colWidths = [35, 9, 9, 9, 9, 9, 9, 9, 12];
    const headers = ['Task', 'M', 'T', 'W', 'Th', 'F', 'St', 'S', 'Done'];
    let xPos = margin + 5;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    headers.forEach((header, i) => {
      if (i === 0) {
        doc.text(header, xPos, yPos);
      } else {
        doc.text(header, xPos + colWidths[i] / 2, yPos, { align: 'center' });
      }
      xPos += colWidths[i];
    });
    yPos += 6;

    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    tasks.forEach((task) => {
      xPos = margin + 5;
      
      // Task name (left aligned)
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(task, xPos, yPos);
      xPos += colWidths[0];

      // Day columns with colored squares
      const squareSize = 4;
      for (let day = 1; day <= 7; day++) {
        const isDone = Math.random() > 0.5; // In real app, use actual data
        const centerX = xPos + colWidths[day] / 2 - squareSize / 2;
        const centerY = yPos - squareSize + 1;
        
        if (isDone) {
          doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
        } else {
          doc.setFillColor(redColor[0], redColor[1], redColor[2]);
        }
        doc.roundedRect(centerX, centerY, squareSize, squareSize, 1, 1, 'F');
        xPos += colWidths[day];
      }

      // Done count
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      const doneCount = Math.floor(Math.random() * 5) + 3; // Random 3-7
      doc.text(String(doneCount), xPos + colWidths[8] / 2, yPos, { align: 'center' });
      
      yPos += 8;
    });

    // Legend
    yPos += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    
    doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
    doc.rect(margin, yPos - 3, 4, 4, 'F');
    doc.text('Done', margin + 7, yPos);
    
    doc.setFillColor(orangeColor[0], orangeColor[1], orangeColor[2]);
    doc.rect(margin + 25, yPos - 3, 4, 4, 'F');
    doc.text('Missed', margin + 32, yPos);

    // Footer
    const footerY = pageHeight - 10;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY, { align: 'center' });

    // Save the PDF
    const fileName = `Progress_Report_${childNickname || 'Child'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const onStatHover = (name: string | null) => {
    setHoveredStat(name);
    if (name) {
      // You can replace this with analytics, tooltip, etc.
      console.debug('[progress] hover stat:', name);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 w-full">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6 md:mb-8">
          Weekly Performance Summary
        </h1>

        {/* Info Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 md:mb-10 gap-4">
          <div className="text-gray-700">
            <p className="text-lg font-semibold">
              For: <span className="font-normal">{childNickname || "—"}</span>
            </p>
            {/* Week of (clickable text + inline icon) */}
            <button 
              onClick={() => setShowHistory(true)}
              className="mt-1 text-sm md:text-base flex items-center gap-2 hover:bg-gray-50 rounded px-2 py-1 -ml-2 transition-colors"
            >
              <span>Week of:</span>
              <span className="font-medium bg-gray-100 py-1 px-2 rounded">
                {weekRange}
              </span>
              <img 
                src="/assets/images/history.png" 
                alt="History" 
                className="w-4 h-4 inline-block"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  e.currentTarget.style.display = 'none';
                }}
              />
            </button>
          </div>

          <div className="flex justify-around md:justify-end gap-3 md:gap-6">
            <div
              className={`text-gray-800 p-3 md:p-4 rounded-xl shadow text-center w-24 md:w-32 border transition transform duration-200 ${
                hoveredStat === 'Total Task' ? 'border-teal-500 shadow-lg scale-[1.03] bg-teal-50' : 'border-teal-200 bg-transparent'
              }`}
              onMouseEnter={() => onStatHover('Total Task')}
              onMouseLeave={() => onStatHover(null)}
            >
              <p className="text-xs md:text-sm font-medium">Total Task</p>
              <p className="text-xl md:text-2xl font-bold">{totalTasks}</p>
            </div>
            <div
              className={`text-gray-800 p-3 md:p-4 rounded-xl shadow text-center w-24 md:w-32 border transition transform duration-200 ${
                hoveredStat === 'Completed' ? 'border-teal-500 shadow-lg scale-[1.03] bg-teal-50' : 'border-teal-200 bg-transparent'
              }`}
              onMouseEnter={() => onStatHover('Completed')}
              onMouseLeave={() => onStatHover(null)}
            >
              <p className="text-xs md:text-sm font-medium">Completed</p>
              <p className="text-xl md:text-2xl font-bold">{completedTasks}</p>
            </div>
            <div
              className={`text-gray-800 p-3 md:p-4 rounded-xl shadow text-center w-24 md:w-32 border transition transform duration-200 ${
                hoveredStat === 'Rate' ? 'border-teal-500 shadow-lg scale-[1.03] bg-teal-50' : 'border-teal-200 bg-transparent'
              }`}
              onMouseEnter={() => onStatHover('Rate')}
              onMouseLeave={() => onStatHover(null)}
            >
              <p className="text-xs md:text-sm font-medium">Rate</p>
              <p className="text-xl md:text-2xl font-bold text-orange-500">
                {completionRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Ritmo Tracker Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 md:p-6 overflow-x-auto">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
            Ritmo Tracker
          </h2>

          <table className="w-full text-center border-collapse text-sm md:text-base">
            <thead>
              <tr className="text-gray-600">
                <th className="py-2 text-left pl-3 md:pl-4">Task</th>
                <th>M</th>
                <th>T</th>
                <th>W</th>
                <th>Th</th>
                <th>F</th>
                <th>St</th>
                <th>S</th>
                <th>Done</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {tasks.map((task, i) => (
                <tr
                  key={i}
                  className="odd:bg-teal-50 even:bg-white border-t border-gray-200"
                >
                  <td className="py-3 text-left pl-3 md:pl-4 font-medium whitespace-nowrap">
                    {task}
                  </td>
                  {Array.from({ length: 7 }).map((_, day) => (
                    <td key={day} className="py-2">
                      <div
                        className={`mx-auto w-4 h-4 md:w-5 md:h-5 rounded-md ${
                          Math.random() > 0.5 ? "bg-teal-500" : "bg-red-400"
                        }`}
                      ></div>
                    </td>
                  ))}
                  <td className="font-semibold">3</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-6 text-gray-600 text-xs md:text-sm flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-teal-500 rounded-sm"></div> Done
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-400 rounded-sm"></div> Missed
            </div>
          </div>
        </div>

        {/* Save as PDF */}
        <div className="flex justify-center mt-8 md:mt-10">
          <button 
            onClick={async () => {
              const result = await showConfirm(
                'This will download your progress report as a PDF file.',
                'Save Progress Report?',
                'Yes, Save PDF',
                'Cancel'
              );
              if (result.isConfirmed) {
                generatePDF();
              }
            }}
            className="bg-[#2D7778] hover:bg-teal-600 text-white px-6 py-2 md:px-8 md:py-3 rounded-xl shadow-md text-sm md:text-base transition"
          >
            Save as PDF
          </button>
        </div>
      </div>

      {/* History Modal */}
      <HistoryModal
        open={showHistory}
        onClose={() => setShowHistory(false)}
        currentChildName={childNickname}
      />
    </div>
  );
};

export default Progress;
