import React from "react";
// @ts-ignore
import { supabase } from "../supabaseClient";

const Home: React.FC = () => {
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // reload to let the main auth listener update UI
      window.location.href = "/";
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  return (
    <div className="text-white">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 shadow-xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 right-1/2 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/2 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        </div>
        <div className="relative px-6 sm:px-12 py-14 sm:py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
              Track your rhythm with
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-300">
                a clean, modern dashboard
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-white/70 max-w-2xl">
              Organize media, monitor progress, and tweak settings—all in one place. Built fast with React and Tailwind.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#media" className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500">Explore Media</a>
              <a href="#progress" className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20">View Progress</a>
              <button onClick={handleSignOut} className="ml-auto inline-flex items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm font-medium hover:bg-white/5">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Media Library",
            desc: "Collect and preview your tracks, videos, and more.",
          },
          {
            title: "Progress Tracking",
            desc: "Stay on top of your goals with simple insights.",
          },
          { title: "Customization", desc: "Adjust preferences to suit your flow." },
        ].map((card) => (
          <div key={card.title} className="rounded-xl border border-white/10 bg-slate-900/60 p-6 shadow">
            <h3 className="text-lg font-semibold">{card.title}</h3>
            <p className="mt-2 text-sm text-white/70">{card.desc}</p>
            <div className="mt-4 h-24 rounded-lg bg-gradient-to-br from-white/5 to-transparent" />
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;
