import React, { useEffect, useState } from "react";
// @ts-ignore - local JS client without types shipped here
import { supabase } from '../supabaseClient'
// @ts-ignore - jsPDF types
import jsPDF from 'jspdf';

const Progress: React.FC = () => {
  const [childNickname, setChildNickname] = useState("");
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);
  
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
    const margin = 20;
    let yPos = margin;

    // Colors (RGB values for jsPDF)
    const tealColor: [number, number, number] = [45, 119, 120]; // #2D7778
    const orangeColor: [number, number, number] = [239, 68, 68]; // #EF4444 (orange-500)

    // Title
    doc.setFontSize(24);
    doc.setTextColor(tealColor[0], tealColor[1], tealColor[2]);
    doc.setFont('helvetica', 'bold');
    const titleText = 'Weekly Performance Summary';
    const titleWidth = doc.getTextWidth(titleText);
    doc.text(titleText, (pageWidth - titleWidth) / 2, yPos);
    yPos += 15;

    // Child name and week
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`For: ${childNickname || '—'}`, margin, yPos);
    yPos += 8;
    doc.text(`Week of: ${weekRange}`, margin, yPos);
    yPos += 15;

    // Summary stats
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const statsX = margin;
    const statsY = yPos;
    const statsSpacing = 50;

    doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
    doc.roundedRect(statsX, statsY, 45, 25, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Tasks', statsX + 22.5, statsY + 8, { align: 'center' });
    doc.text(String(totalTasks), statsX + 22.5, statsY + 18, { align: 'center' });

    doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
    doc.roundedRect(statsX + statsSpacing, statsY, 45, 25, 3, 3, 'F');
    doc.text('Completed', statsX + statsSpacing + 22.5, statsY + 8, { align: 'center' });
    doc.text(String(completedTasks), statsX + statsSpacing + 22.5, statsY + 18, { align: 'center' });

    doc.setFillColor(orangeColor[0], orangeColor[1], orangeColor[2]);
    doc.roundedRect(statsX + statsSpacing * 2, statsY, 45, 25, 3, 3, 'F');
    doc.text('Rate', statsX + statsSpacing * 2 + 22.5, statsY + 8, { align: 'center' });
    doc.text(`${completionRate}%`, statsX + statsSpacing * 2 + 22.5, statsY + 18, { align: 'center' });

    yPos += 35;

    // Ritmo Tracker Table
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Ritmo Tracker', margin, yPos);
    yPos += 10;

    // Table headers
    const colWidths = [60, 15, 15, 15, 15, 15, 15, 15, 20];
    const headers = ['Task', 'M', 'T', 'W', 'Th', 'F', 'St', 'S', 'Done'];
    let xPos = margin;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    headers.forEach((header, i) => {
      doc.text(header, xPos + colWidths[i] / 2, yPos, { align: 'center' });
      xPos += colWidths[i];
    });
    yPos += 8;

    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    tasks.forEach((task) => {
      // Check if we need a new page
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = margin;
      }

      xPos = margin;
      
      // Task name (left aligned)
      doc.setFont('helvetica', 'bold');
      doc.text(task, xPos + 2, yPos);
      xPos += colWidths[0];

      // Day columns (simulate checkmarks - using ✓ for done, ✗ for missed)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      for (let day = 1; day <= 7; day++) {
        const isDone = Math.random() > 0.5; // In real app, use actual data
        if (isDone) {
          doc.setTextColor(tealColor[0], tealColor[1], tealColor[2]);
        } else {
          doc.setTextColor(orangeColor[0], orangeColor[1], orangeColor[2]);
        }
        doc.text(isDone ? '✓' : '✗', xPos + colWidths[day] / 2, yPos, { align: 'center' });
        xPos += colWidths[day];
      }

      // Done count (example: 3)
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('3', xPos + colWidths[8] / 2, yPos, { align: 'center' });
      
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
            <p className="mt-1 text-sm md:text-base">
              Week of:{" "}
              <span className="font-medium bg-gray-100 py-1 px-2 rounded">
                {weekRange}
              </span>
            </p>
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
            onClick={generatePDF}
            className="bg-[#2D7778] hover:bg-teal-600 text-white px-6 py-2 md:px-8 md:py-3 rounded-xl shadow-md text-sm md:text-base transition"
          >
            Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Progress;
