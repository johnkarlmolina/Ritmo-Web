import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import NewPinSetupModal from './NewPinSetupModal';
import PinCodeModal from './PinCodeModal';
// @ts-ignore - local JS client without types shipped here
import { supabase } from '../supabaseClient'
import { showSuccess, showError } from '../utils/alerts';

type Props = {
  open: boolean;
  onClose: () => void;
  onVerify: (pin: string) => boolean; // Returns true if PIN is correct
};

const PinVerificationModal: React.FC<Props> = ({ open, onClose, onVerify }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [showNewPinSetup, setShowNewPinSetup] = useState(false);
  const [showPinCodeModal, setShowPinCodeModal] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    
    // Focus first input when modal opens
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
    
    // Clear PIN and error when modal opens
    setPin(['', '', '', '']);
    setError('');
    
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(''); // Clear error on input

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    const digits = pastedData.split('').filter(char => /^\d$/.test(char));
    
    const newPin = [...pin];
    digits.forEach((digit, i) => {
      if (i < 4) {
        newPin[i] = digit;
      }
    });
    setPin(newPin);

    // Focus the next empty input or the last one
    const nextEmptyIndex = newPin.findIndex(d => !d);
    const focusIndex = nextEmptyIndex === -1 ? 3 : nextEmptyIndex;
    inputRefs[focusIndex].current?.focus();
  };

  const handleVerify = () => {
    const pinCode = pin.join('');
    if (pinCode.length !== 4 || pin.some(digit => digit === '')) {
      setError('Please enter all 4 digits');
      return;
    }
    
    const isCorrect = onVerify(pinCode);
    if (!isCorrect) {
      setError('Incorrect PIN. Please try again.');
      setPin(['', '', '', '']);
      inputRefs[0].current?.focus();
    }
  };

  const handleCancel = () => {
    setPin(['', '', '', '']);
    setError('');
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={handleCancel} />
      
      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 pb-6">
        {/* Lock Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gray-400 rounded-2xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8">
              <path d="M12 1a5 5 0 0 0-5 5v4H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V12a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm0 2a3 3 0 0 1 3 3v4H9V6a3 3 0 0 1 3-3z"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center text-gray-900 mb-1">
          Parental Lock
        </h2>
        <p className="text-xs text-center text-gray-500 mb-4">
          Access restricted to parents<br/>or guardians only
        </p>
        <p className="text-sm text-center text-gray-700 font-medium mb-6">
          Please enter your 4-digit PIN to continue
        </p>

        {/* PIN Input Boxes */}
        <div className="flex justify-center gap-2 mb-4">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4FB89F] focus:border-[#4FB89F] bg-gray-50 transition ${
                error ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              aria-label={`PIN digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Forgot PIN Link */}
        <div className="text-center mb-6">
          <button
            type="button"
            className="text-sm text-[#0000FF] hover:text-[#3da688] font-medium underline transition"
            onClick={() => {
              setShowNewPinSetup(true);
            }}
          >
            Forgot PIN?
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 text-sm text-center mb-4 font-medium">
            {error}
          </p>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleVerify}
            className="w-full py-3.5 px-6 rounded-full bg-[#32CD32] hover:bg-[#3da688] text-white font-semibold shadow-lg transition"
          >
            Unlock Access
          </button>
          <button
            onClick={handleCancel}
            className="w-full py-2.5 px-6 text-gray-700 hover:text-gray-900 font-medium transition"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* New Pin Setup Modal */}
      <NewPinSetupModal
        open={showNewPinSetup}
        onClose={() => setShowNewPinSetup(false)}
        onSuccess={() => {
          setShowNewPinSetup(false);
          setShowPinCodeModal(true);
        }}
      />

      {/* Pin Code Modal for setting new PIN */}
      <PinCodeModal
        open={showPinCodeModal}
        onClose={() => {
          setShowPinCodeModal(false);
          onClose(); // Close the verification modal too
        }}
        onSave={async (newPin: string) => {
          try {
            // Save the new PIN to Supabase
            const { error } = await supabase.auth.updateUser({
              data: { parental_pin: newPin }
            });

            if (error) {
              showError('Failed to update PIN. Please try again.');
              return;
            }

            showSuccess('PIN updated successfully!');
            setShowPinCodeModal(false);
            onClose(); // Close the verification modal
            
            // Dispatch event to notify other components that user data was updated
            window.dispatchEvent(new Event('USER_UPDATED'));
          } catch (error) {
            console.error('Error updating PIN:', error);
            showError('An error occurred. Please try again.');
          }
        }}
      />
    </div>,
    document.body
  );
};

export default PinVerificationModal;
