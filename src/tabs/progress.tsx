import React from "react";

const Progress: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-teal-100 p-4 md:p-10 flex justify-center items-start">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 w-full max-w-5xl">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6 md:mb-8">
          Weekly Performance Summary
        </h1>

        {/* Info Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 md:mb-10 gap-4">
          <div className="text-gray-700">
            <p className="text-lg font-semibold">
              For: <span className="font-normal">Sai</span>
            </p>
            <p className="mt-1 text-sm md:text-base">
              Week of:{" "}
              <span className="font-medium bg-gray-100 py-1 px-2 rounded">
                October 20, 2025 – October 26, 2025
              </span>
            </p>
          </div>

          <div className="flex justify-around md:justify-end gap-3 md:gap-6">
            <div className="bg-teal-200 text-gray-800 p-3 md:p-4 rounded-xl shadow text-center w-24 md:w-32">
              <p className="text-xs md:text-sm font-medium">Total Task</p>
              <p className="text-xl md:text-2xl font-bold">21</p>
            </div>
            <div className="bg-teal-200 text-gray-800 p-3 md:p-4 rounded-xl shadow text-center w-24 md:w-32">
              <p className="text-xs md:text-sm font-medium">Completed</p>
              <p className="text-xl md:text-2xl font-bold">14</p>
            </div>
            <div className="bg-teal-200 text-gray-800 p-3 md:p-4 rounded-xl shadow text-center w-24 md:w-32">
              <p className="text-xs md:text-sm font-medium">Rate</p>
              <p className="text-xl md:text-2xl font-bold text-orange-500">
                66%
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
              {[
                "BRUSH TEETH",
                "EAT FOOD",
                "WASH BODY",
                "CHANGE CLOTHES",
                "GO TO SCHOOL",
              ].map((task, i) => (
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
          <button className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 md:px-8 md:py-3 rounded-xl shadow-md text-sm md:text-base transition">
            Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Progress;
