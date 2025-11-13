import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  onClose: () => void;
  onVerify: (pin: string) => boolean; // Returns true if PIN is correct
  title?: string;
};

const PinVerificationModal: React.FC<Props> = ({ open, onClose, onVerify, title = "Enter PIN to access" }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
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
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8">
        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          {title}
        </h2>
        <p className="text-sm text-gray-600 text-center mb-8">
          Parental lock is enabled
        </p>

        {/* PIN Input Boxes */}
        <div className="flex justify-center gap-3 mb-4">
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
              className={`w-16 h-16 sm:w-20 sm:h-20 text-center text-2xl font-bold border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2D7778] focus:border-[#2D7778] bg-gray-100 transition ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-label={`PIN digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 text-sm text-center mb-6 font-medium">
            {error}
          </p>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleVerify}
            className="w-full py-3 px-6 rounded-full bg-[#2D7778] hover:bg-teal-700 text-white font-semibold shadow-md transition"
          >
            Verify
          </button>
          <button
            onClick={handleCancel}
            className="w-full py-3 px-6 rounded-full bg-[#4FB89F] hover:bg-[#61CCB2] text-white font-semibold shadow-md transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PinVerificationModal;
