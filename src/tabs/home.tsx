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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="p-8 bg-white/5 rounded-lg shadow-lg max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Ritmo</h1>
        <p className="mb-6">This is a simple home page shown after signing in.</p>
        <button
          onClick={handleSignOut}
          className="py-2 px-4 rounded bg-red-600 hover:bg-red-500 text-white"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Home;
