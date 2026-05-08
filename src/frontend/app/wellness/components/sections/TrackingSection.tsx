'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useWellnessData } from '../../hooks/useWellnessData';
import { toast } from 'sonner';

interface TrackingSectionProps {
  userId: string;
}

export const TrackingSection = ({ userId }: TrackingSectionProps) => {
  const { createEntry, loading } = useWellnessData(userId);

  const [formData, setFormData] = useState({
    milk_score: 50,
    mood: 3,
    sleep_hours: 7,
    water_intake_ml: 2000,
    energy_level: 3,
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSliderChange = (field: string, value: number[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value[0]
    }));
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'water_intake_ml' ? parseInt(value as string) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createEntry(formData);
      toast.success('✅ Entry saved successfully!');

      // Reset form
      setFormData({
        milk_score: 50,
        mood: 3,
        sleep_hours: 7,
        water_intake_ml: 2000,
        energy_level: 3,
        notes: ''
      });
    } catch (error) {
      toast.error('Failed to save entry');
    } finally {
      setSubmitting(false);
    }
  };

  const getMoodEmoji = (mood: number) => {
    switch (mood) {
      case 1:
        return '😢';
      case 2:
        return '😞';
      case 3:
        return '😐';
      case 4:
        return '😊';
      case 5:
        return '😄';
      default:
        return '😐';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Milk Score */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          Milk Score: {formData.milk_score}/100
        </label>
        <Slider
          value={[formData.milk_score]}
          onValueChange={(val) => handleSliderChange('milk_score', val)}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Mood */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          Current Mood {getMoodEmoji(formData.mood)}
        </label>
        <div className="flex gap-2 justify-between">
          {[1, 2, 3, 4, 5].map((mood) => (
            <button
              key={mood}
              type="button"
              onClick={() => handleInputChange('mood', mood)}
              className={`flex-1 py-3 rounded-lg border-2 text-2xl font-semibold transition-all ${
                formData.mood === mood
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {getMoodEmoji(mood)}
            </button>
          ))}
        </div>
      </div>

      {/* Sleep Hours */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          Sleep Hours: {formData.sleep_hours}h
        </label>
        <Slider
          value={[formData.sleep_hours]}
          onValueChange={(val) => handleSliderChange('sleep_hours', val)}
          min={0}
          max={12}
          step={0.5}
          className="w-full"
        />
      </div>

      {/* Water Intake */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          Water Intake (ml)
        </label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={formData.water_intake_ml}
            onChange={(e) => handleInputChange('water_intake_ml', e.target.value)}
            className="flex-1"
            min={0}
            step={100}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => handleInputChange('water_intake_ml', formData.water_intake_ml + 250)}
          >
            +250ml
          </Button>
        </div>
      </div>

      {/* Energy Level */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          Energy Level: {formData.energy_level}/5
        </label>
        <Slider
          value={[formData.energy_level]}
          onValueChange={(val) => handleSliderChange('energy_level', val)}
          min={1}
          max={5}
          step={1}
          className="w-full"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          Notes (optional)
        </label>
        <Textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="How are you feeling? Any notes?"
          rows={4}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={submitting || loading}
      >
        {submitting ? 'Saving...' : '💾 Save Entry'}
      </Button>
    </form>
  );
};
