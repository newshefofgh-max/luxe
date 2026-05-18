'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Shield } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface OTPModalProps {
  isOpen: boolean;
  phone: string;
  onVerified: () => void;
  onClose: () => void;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 120; // seconds

export default function OTPModal({ isOpen, phone, onVerified, onClose }: OTPModalProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [method, setMethod] = useState<'whatsapp' | 'sms'>('whatsapp');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Send OTP on mount
  useEffect(() => {
    if (isOpen) {
      setDigits(Array(OTP_LENGTH).fill(''));
      sendOTP();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;
    setCountdown(RESEND_COOLDOWN);
    const interval = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isSending]);

  const sendOTP = useCallback(async () => {
    setIsSending(true);
    try {
      const { data } = await axios.post('/api/otp/send', { phone });
      if (data.data?.bypass) {
        onVerified();
        return;
      }
      setMethod(data.data?.method ?? 'whatsapp');
      toast.success(
        data.data?.method === 'sms'
          ? 'تم إرسال الرمز عبر SMS'
          : 'تم إرسال الرمز عبر WhatsApp',
        { icon: '📱' }
      );
    } catch {
      toast.error('فشل إرسال رمز التحقق');
    } finally {
      setIsSending(false);
    }
  }, [phone, onVerified]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];

    if (value.length > 1) {
      // Handle paste
      const pasted = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
      const updated = Array(OTP_LENGTH).fill('');
      for (let i = 0; i < pasted.length; i++) {
        updated[i] = pasted[i];
      }
      setDigits(updated);
      inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
      return;
    }

    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length !== OTP_LENGTH) {
      toast.error('أدخل الرمز المكون من 6 أرقام');
      return;
    }

    setIsVerifying(true);
    try {
      await axios.post('/api/otp/verify', { phone, otp });
      toast.success('تم التحقق بنجاح! ✅');
      onVerified();
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) ? err.response?.data?.error : 'رمز خاطئ أو منتهي الصلاحية';
      toast.error(msg ?? 'فشل التحقق');
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const maskedPhone = phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 **** $3');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-surface-alt border border-[#2a2a4a] rounded-sm p-8 text-center"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#E91E8C]/10 flex items-center justify-center">
              <Shield className="text-[#E91E8C]" size={32} />
            </div>

            <h2 className="text-2xl font-display text-white mb-2">التحقق من الهاتف</h2>
            <p className="text-gray-400 text-sm mb-1">
              تم إرسال رمز مكون من 6 أرقام عبر{' '}
              <span className="text-[#E91E8C]">
                {method === 'whatsapp' ? 'WhatsApp' : 'SMS'}
              </span>
            </p>
            <p className="text-white font-medium mb-6" dir="ltr">
              {maskedPhone}
            </p>

            {/* OTP inputs */}
            <div className="flex justify-center gap-3 mb-6" dir="ltr">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-12 h-14 text-center text-xl font-bold bg-page border-2 rounded-sm text-white focus:outline-none transition-colors ${
                    digit
                      ? 'border-[#E91E8C]'
                      : 'border-[#2a2a4a] focus:border-[#E91E8C]'
                  }`}
                />
              ))}
            </div>

            {/* Verify button */}
            <button
              onClick={handleVerify}
              disabled={isVerifying || digits.join('').length !== OTP_LENGTH}
              className="btn-primary w-full mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin" />
                  جاري التحقق...
                </span>
              ) : (
                'تأكيد الرمز'
              )}
            </button>

            {/* Resend */}
            <div className="text-sm text-gray-400">
              {countdown > 0 ? (
                <span>
                  إعادة الإرسال بعد{' '}
                  <span className="text-[#E91E8C] font-mono">{formatTime(countdown)}</span>
                </span>
              ) : (
                <button
                  onClick={sendOTP}
                  disabled={isSending}
                  className="text-[#E91E8C] hover:underline disabled:opacity-50"
                >
                  {isSending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
