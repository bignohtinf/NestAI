'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useWellnessData } from '../hooks/useWellnessData';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface PersonalizationDialogProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const HEALTH_FOCUS_OPTIONS = ['Sleep', 'Nutrition', 'Energy', 'Mood', 'Fitness', 'Hydration'];
const MOOD_LABELS = ['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];

export const PersonalizationDialog = ({
  userId,
  isOpen,
  onClose
}: PersonalizationDialogProps) => {
  const { updateProfile } = useWellnessData(userId);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [answers, setAnswers] = useState({
    health_focus: [] as string[],
    last_sleep_hours: 7,
    current_mood: 3,
    health_concerns: '',
    reminder_time: '09:00'
  });

  const toggleHealthFocus = (option: string) => {
    setAnswers((prev) => {
      const focuses = prev.health_focus.includes(option)
        ? prev.health_focus.filter((f) => f !== option)
        : [...prev.health_focus, option];
      return { ...prev, health_focus: focuses };
    });
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      await updateProfile({
        ...answers,
        personalization_completed: true
      });

      toast.success('✅ Personalization complete! Let\'s get started.');
      onClose();
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setSubmitting(false);
    }
  };

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😞', '😐', '😊', '😄'];
    return emojis[mood - 1] || '😐';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Let's Personalize Your Wellness</DialogTitle>
          <DialogDescription>
            Help us understand your health priorities (Step {step + 1} of 5)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 0: Health Focus */}
          {step === 0 && (
            <div className="space-y-3">
              <p className="font-semibold text-slate-700">What's your health focus? (Select 2-3)</p>
              <div className="grid grid-cols-2 gap-3">
                {HEALTH_FOCUS_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleHealthFocus(option)}
                    className={`p-3 rounded-lg border-2 font-medium transition-all ${
                      answers.health_focus.includes(option)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Sleep */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="font-semibold text-slate-700">How many hours did you sleep last night?</p>
              <div className="space-y-2">
                <Input
                  type="number"
                  value={answers.last_sleep_hours}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      last_sleep_hours: parseFloat(e.target.value)
                    }))
                  }
                  min={0}
                  max={12}
                  step={0.5}
                  className="text-lg"
                />
                <p className="text-sm text-slate-600">
                  Aim for 7-8 hours of quality sleep for optimal health
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Mood */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="font-semibold text-slate-700">How's your mood right now?</p>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setAnswers((prev) => ({ ...prev, current_mood: mood }))}
                    className={`w-full p-4 rounded-lg border-2 flex items-center justify-between font-medium transition-all ${
                      answers.current_mood === mood
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{MOOD_LABELS[mood - 1]}</span>
                    <span className="text-3xl">{getMoodEmoji(mood)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Health Concerns */}
          {step === 3 && (
            <div className="space-y-3">
              <p className="font-semibold text-slate-700">
                Any specific health concerns? (Optional)
              </p>
              <Textarea
                value={answers.health_concerns}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    health_concerns: e.target.value
                  }))
                }
                placeholder="e.g., fatigue, digestive issues, pain, etc."
                rows={4}
              />
            </div>
          )}

          {/* Step 4: Reminder Time */}
          {step === 4 && (
            <div className="space-y-3">
              <p className="font-semibold text-slate-700">Preferred reminder time</p>
              <div className="space-y-2">
                <Input
                  type="time"
                  value={answers.reminder_time}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      reminder_time: e.target.value
                    }))
                  }
                  className="text-lg"
                />
                <p className="text-sm text-slate-600">
                  We'll remind you daily at this time to log your wellness
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${((step + 1) / 5) * 100}%` }}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 0 || submitting}
          >
            ← Back
          </Button>

          {step < 4 ? (
            <Button onClick={handleNext} className="flex-1">
              Next →
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting || answers.health_focus.length === 0}
              className="flex-1"
            >
              {submitting ? 'Getting started...' : '🎉 Get Started'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
