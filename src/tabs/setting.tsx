import React, { useEffect, useState } from "react";
// @ts-ignore - local JS client without types shipped here
import { supabase } from '../supabaseClient'

const Setting: React.FC = () => {
  const [childNickname, setChildNickname] = useState("");
  const [email, setEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        const meta = (user.user_metadata ?? {}) as any;
        setChildNickname(meta?.child_name ?? "");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await supabase.auth.signOut();
    }
  };

  const handleParentalLock = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-teal-100 flex justify-center items-center p-4 md:p-10">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 md:p-10 relative">
        {/* Brand Header */}
        <div className="flex justify-left mb-6">
          <img
            src="/src/assets/Logo-1.png"
            alt="Ritmo Logo"
            className="w-40 md:w-56"
          />
        </div>

        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border-2 border-teal-200 rounded-2xl p-4 shadow-sm">
            <p className="text-gray-700 font-semibold mb-1">Child Nickname</p>
            <p className="text-lg font-bold text-teal-800">
              {childNickname || "—"}
            </p>
          </div>
          <div className="bg-white border-2 border-teal-200 rounded-2xl p-4 shadow-sm">
            <p className="text-gray-700 font-semibold mb-1">Email</p>
            <p className="text-lg font-bold text-teal-800">{email || "—"}</p>
          </div>
        </div>

        {/* Menu Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleParentalLock}
            className="w-full flex justify-between items-center bg-white border-2 border-teal-200 rounded-2xl px-6 py-4 shadow-sm hover:bg-teal-50 transition"
          >
            <span className="font-semibold text-gray-700">Parental Lock</span>
            <span className="text-gray-500">›</span>
          </button>

          <button className="w-full flex justify-between items-center bg-white border-2 border-teal-200 rounded-2xl px-6 py-4 shadow-sm hover:bg-teal-50 transition">
            <span className="font-semibold text-gray-700">Instruction</span>
            <span className="text-gray-500">›</span>
          </button>

          <button className="w-full flex justify-between items-center bg-white border-2 border-teal-200 rounded-2xl px-6 py-4 shadow-sm hover:bg-teal-50 transition">
            <span className="font-semibold text-gray-700">
              Terms and Conditions
            </span>
            <span className="text-gray-500">›</span>
          </button>

          <button className="w-full flex justify-between items-center bg-white border-2 border-teal-200 rounded-2xl px-6 py-4 shadow-sm hover:bg-teal-50 transition">
            <span className="font-semibold text-gray-700">Privacy Policy</span>
            <span className="text-gray-500">›</span>
          </button>
        </div>

        {/* Logout Button */}
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl shadow-md border-2 border-red-600 transition"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-11/12 max-w-md relative">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            {/* Header with Switch */}
            <div className="flex justify-between items-center border border-teal-200 rounded-xl p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Parental Lock
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isLocked}
                  onChange={() => setIsLocked(!isLocked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed">
              <strong>Parental Lock</strong> — Allows parents or guardians to
              restrict access to settings and sensitive content. A passcode is
              required to make changes, ensuring a safe and controlled
              experience for children.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Setting;
