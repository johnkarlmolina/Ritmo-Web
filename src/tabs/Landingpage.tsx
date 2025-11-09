import React, { useState } from 'react'
// @ts-ignore - Vite will provide URLs for these
import hero1 from '../asset-gif/eating.gif'
import hero2 from '../asset-gif/going home.gif'
import hero3 from '../asset-step-gif/Bath-bath.gif'

type Props = {
  onGoToWebsite?: () => void
}

const Landingpage: React.FC<Props> = ({ onGoToWebsite }) => {
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center py-10 select-none">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="px-6">
          <h2 className="text-3xl sm:text-4xl font-medium text-slate-900 mb-4">Our Goal</h2>
          <p className="text-slate-700 leading-relaxed mb-6 text-justify">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
          <div className="flex items-center gap-4">
            <button
              className={`relative bg-white text-[#2D7778] px-6 py-2.5 rounded-lg border border-[#2D7778] shadow-sm font-semibold tracking-wide transition-all duration-300 ${hovered === 'button' ? 'shadow-md scale-[1.03]' : 'hover:shadow-md'} `}
              onMouseEnter={() => setHovered('button')}
              onMouseLeave={() => setHovered(h => (h === 'button' ? null : h))}
              onClick={onGoToWebsite}
            >
              <span className="flex items-center gap-1">Go to website<span className="text-sm">→</span></span>
            </button>
            <button className="bg-white text-[#2D7778] px-6 py-2.5 rounded-lg border border-[#2D7778] shadow-sm font-semibold tracking-wide hover:shadow-md transition-all">Download Mobile App</button>
          </div>
        </div>

        <div className="px-6 flex flex-col gap-6 items-center">
          {/* Top hero card */}
          <div className="w-full flex justify-center">
            <div
              onMouseEnter={() => setHovered('card-main')}
              onMouseLeave={() => setHovered(h => (h === 'card-main' ? null : h))}
              className={`relative rounded-2xl border border-[#2D7778] p-10 bg-white shadow-sm transition-all duration-500 cursor-pointer ${hovered === 'card-main' ? 'scale-110 -translate-y-1.5 shadow-xl' : 'hover:scale-[1.05] hover:-translate-y-1'}`}
            >
              <img src={hero1} alt="hero1" className="h-40 w-40 sm:h-56 sm:w-56 object-contain transition-transform duration-500" />
              <div className={`absolute inset-0 rounded-2xl bg-white/90 backdrop-blur-[1px] flex items-center justify-center text-[#2D7778] text-xl font-bold tracking-wide transition-opacity duration-300 ${hovered === 'card-main' ? 'opacity-100' : 'opacity-0'}`}>Explore</div>
            </div>
          </div>

          {/* Lower pair */}
            <div className="w-full flex items-center justify-between gap-6">
              <div className="flex-1 flex justify-center">
                <div
                  onMouseEnter={() => setHovered('card-bath')}
                  onMouseLeave={() => setHovered(h => (h === 'card-bath' ? null : h))}
                  className={`relative rounded-2xl border border-[#2D7778] p-6 bg-white shadow-sm w-52 h-40 sm:w-64 sm:h-48 flex items-center justify-center transition-all duration-500 cursor-pointer ${hovered === 'card-bath' ? 'scale-110 shadow-xl rotate-1' : 'hover:scale-105'}`}
                >
                  <img src={hero3} alt="hero3" className="h-24 sm:h-28 object-contain" />
                  <div className={`absolute inset-0 rounded-2xl bg-white/90 flex items-center justify-center text-[#2D7778] text-base font-semibold transition-opacity duration-300 ${hovered === 'card-bath' ? 'opacity-100' : 'opacity-0'}`}>Bath Time</div>
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <div
                  onMouseEnter={() => setHovered('card-home')}
                  onMouseLeave={() => setHovered(h => (h === 'card-home' ? null : h))}
                  className={`relative rounded-2xl border border-[#2D7778] p-6 bg-white shadow-sm w-52 h-40 sm:w-64 sm:h-48 flex items-center justify-center transition-all duration-500 cursor-pointer ${hovered === 'card-home' ? 'scale-110 shadow-xl -rotate-1' : 'hover:scale-105'}`}
                >
                  <img src={hero2} alt="hero2" className="h-24 sm:h-28 object-contain" />
                  <div className={`absolute inset-0 rounded-2xl bg-white/90 flex items-center justify-center text-[#2D7778] text-base font-semibold transition-opacity duration-300 ${hovered === 'card-home' ? 'opacity-100' : 'opacity-0'}`}>Daily Routines</div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Landingpage
