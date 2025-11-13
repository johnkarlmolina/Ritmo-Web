import React, { useEffect, useState } from "react";
// @ts-ignore - local JS client without types shipped here
import { supabase } from '../supabaseClient'
import PinCodeModal from '../components/PinCodeModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { showError, showSuccess } from '../utils/alerts';

const Setting: React.FC = () => {
  const [childNickname, setChildNickname] = useState("");
  const [email, setEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [savedPin, setSavedPin] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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
        
        // Load PIN and lock status from user metadata
        const storedPin = meta?.parental_pin ?? null;
        const lockEnabled = meta?.parental_lock_enabled ?? false;
        if (storedPin && lockEnabled) {
          setSavedPin(storedPin);
          setIsLocked(true);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Removed logout button; function no longer needed

  const handleParentalLock = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const onMenuHover = (name: string | null) => {
    setHovered(name);
    if (name) {
      // Hook for analytics/tooltip/etc.
      console.debug('[setting] hover:', name);
    }
  };

  const handleNicknameEdit = async () => {
    if (isEditingNickname) {
      // Save the nickname
      const newNickname = nicknameInput.trim();
      if (!newNickname) {
        showError('Nickname cannot be empty');
        return;
      }
      
      try {
        const { error } = await supabase.auth.updateUser({
          data: { child_name: newNickname }
        });
        
        if (error) {
          console.error('Error updating nickname:', error);
          showError('Failed to update nickname. Please try again.');
          return;
        }
        
        setChildNickname(newNickname);
        setIsEditingNickname(false);
      } catch (err) {
        console.error('Unexpected error updating nickname:', err);
        showError('Failed to update nickname. Please try again.');
      }
    } else {
      // Enter edit mode
      setNicknameInput(childNickname);
      setIsEditingNickname(true);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-10 relative">
        {/* Brand Header */}
        <div className="flex justify-left mb-6">
          <img
            src="/src/assets/Logo-1.png"
            alt="Ritmo Logo"
            className="w-40 md:w-40"
          />
        </div>

        {/* Menu Buttons */}
        <div className="space-y-7">

          <div className="bg-white border-2 border-[#2D7778] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-700 font-semibold">Child Nickname:</span>
              {isEditingNickname ? (
                <input
                  type="text"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2D7778]"
                  maxLength={40}
                  autoFocus
                />
              ) : (
                <span className="text-gray-900 font-bold">{childNickname || "—"}</span>
              )}
              <button
                type="button"
                onClick={handleNicknameEdit}
                className="text-gray-600 hover:text-[#2D7778] transition-colors"
                aria-label={isEditingNickname ? 'Save nickname' : 'Edit nickname'}
              >
                {/* Pencil icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>
          </div>
          <div className="bg-white border-2 border-[#2D7778] rounded-2xl p-4 shadow-sm">
            <p className="text-gray-700 font-semibold mb-1">Email: {email || "—"}</p>
          </div>

          <button
            onClick={() => setShowPasswordModal(true)}
            onMouseEnter={() => onMenuHover('Password')}
            onMouseLeave={() => onMenuHover(null)}
            className={`w-full flex justify-between items-center bg-white border-2 border-[#2D7778] rounded-2xl px-6 py-4 shadow-sm transition transform ${
              hovered === 'Password' ? 'bg-teal-50 shadow-md scale-[1.01]' : 'hover:bg-teal-50'
            }`}
          >
            <span className="font-semibold text-gray-700">Password</span>
            <span className={`text-gray-500 transition-transform ${hovered === 'Password' ? 'translate-x-1' : ''}`}>
              {/* Pencil icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 inline-block">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </span>
          </button>

          <button
            onClick={handleParentalLock}
            onMouseEnter={() => onMenuHover('Parental Lock')}
            onMouseLeave={() => onMenuHover(null)}
            className={`w-full flex justify-between items-center bg-white border-2 border-[#2D7778] rounded-2xl px-6 py-4 shadow-sm transition transform ${
              hovered === 'Parental Lock' ? 'bg-teal-50 shadow-md scale-[1.01]' : 'hover:bg-teal-50'
            }`}
          >
            <span className="font-semibold text-gray-700">Parental Lock</span>
            <span className={`text-gray-500 transition-transform ${hovered === 'Parental Lock' ? 'translate-x-1' : ''}`}>›</span>
          </button>

          <button
            onMouseEnter={() => onMenuHover('Instruction')}
            onMouseLeave={() => onMenuHover(null)}
            className={`w-full flex justify-between items-center bg-white border-2 border-[#2D7778] rounded-2xl px-6 py-4 shadow-sm transition transform ${
              hovered === 'Instruction' ? 'bg-teal-50 shadow-md scale-[1.01]' : 'hover:bg-teal-50'
            }`}
          >
            <span className="font-semibold text-gray-700">Instruction</span>
            <span className={`text-gray-500 transition-transform ${hovered === 'Instruction' ? 'translate-x-1' : ''}`}>›</span>
          </button>

          <button
            onMouseEnter={() => onMenuHover('Terms and Conditions')}
            onMouseLeave={() => onMenuHover(null)}
            className={`w-full flex justify-between items-center bg-white border-2 border-[#2D7778] rounded-2xl px-6 py-4 shadow-sm transition transform ${
              hovered === 'Terms and Conditions' ? 'bg-teal-50 shadow-md scale-[1.01]' : 'hover:bg-teal-50'
            }`}
          >
            <span className="font-semibold text-gray-700">Terms and Conditions</span>
            <span className={`text-gray-500 transition-transform ${hovered === 'Terms and Conditions' ? 'translate-x-1' : ''}`}>›</span>
          </button>

          <button
            onMouseEnter={() => onMenuHover('Privacy Policy')}
            onMouseLeave={() => onMenuHover(null)}
            className={`w-full flex justify-between items-center bg-white border-2 border-[#2D7778] rounded-2xl px-6 py-4 shadow-sm transition transform ${
              hovered === 'Privacy Policy' ? 'bg-teal-50 shadow-md scale-[1.01]' : 'hover:bg-teal-50'
            }`}
          >
            <span className="font-semibold text-gray-700">Privacy Policy</span>
            <span className={`text-gray-500 transition-transform ${hovered === 'Privacy Policy' ? 'translate-x-1' : ''}`}>›</span>
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
                  onChange={async (e) => {
                    const newValue = e.target.checked;
                    if (newValue) {
                      // Show PIN modal when turning ON
                      setShowPinModal(true);
                    } else {
                      // Turn OFF and clear lock status from database
                      try {
                        const { error } = await supabase.auth.updateUser({
                          data: { parental_lock_enabled: false }
                        });

                        if (error) {
                          console.error('Error disabling parental lock:', error);
                          showError('Failed to disable parental lock. Please try again.');
                          return;
                        }

                        setIsLocked(false);
                        setSavedPin(null);
                      } catch (err) {
                        console.error('Unexpected error disabling parental lock:', err);
                        showError('Failed to disable parental lock. Please try again.');
                      }
                    }
                  }}
                />
                <div className="w-11 h-6 bg-red-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            {/* PIN Display - Only show when lock is enabled */}
            {isLocked && savedPin && (
              <div className="border border-gray-200 rounded-xl p-4 mb-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">PIN:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900 tracking-widest">
                      {showPin ? savedPin : '••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                      aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                    >
                      {showPin ? (
                        // Eye slash icon (hide)
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        // Eye icon (show)
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

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

      {/* PIN Code Modal */}
      <PinCodeModal
        open={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          // Don't change isLocked state if user cancels
        }}
        onSave={async (pin) => {
          try {
            // Save PIN and enable parental lock in Supabase user metadata
            const { error } = await supabase.auth.updateUser({
              data: { 
                parental_pin: pin,
                parental_lock_enabled: true
              }
            });

            if (error) {
              console.error('Error saving PIN:', error);
              showError('Failed to save PIN. Please try again.');
              return;
            }

            setSavedPin(pin);
            setIsLocked(true);
            setShowPinModal(false);
          } catch (err) {
            console.error('Unexpected error saving PIN:', err);
            showError('Failed to save PIN. Please try again.');
          }
        }}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSave={async (newPassword) => {
          try {
            const { error } = await supabase.auth.updateUser({
              password: newPassword
            });

            if (error) {
              console.error('Error updating password:', error);
              showError('Failed to update password. Please try again.');
              return;
            }

            showSuccess('Password updated successfully!');
            setShowPasswordModal(false);
          } catch (err) {
            console.error('Unexpected error updating password:', err);
            showError('Failed to update password. Please try again.');
          }
        }}
      />
    </div>
  );
};

export default Setting;
