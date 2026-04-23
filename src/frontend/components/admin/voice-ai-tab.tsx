'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mic, Play, Save } from 'lucide-react';

export function VoiceAITab() {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceModel, setVoiceModel] = useState('openai-tts-1');
  const [voiceGender, setVoiceGender] = useState('female');
  const [testText, setTestText] = useState('Welcome to nestai. How can I help you today?');

  return (
    <div className="space-y-6">
      {/* Voice AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Voice AI Configuration</CardTitle>
          <CardDescription>Configure voice assistance and audio feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div>
            <Label>Voice Assistance</Label>
            <div className="mt-2 flex items-center gap-4">
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full ${voiceEnabled ? 'bg-primary' : 'bg-muted'
                  }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-background transition ${voiceEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                />
              </button>
              <span className="text-sm">
                {voiceEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Voice Model */}
          <div>
            <Label htmlFor="model">Voice Model</Label>
            <select
              id="model"
              value={voiceModel}
              onChange={(e) => setVoiceModel(e.target.value)}
              className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="openai-tts-1">OpenAI TTS-1</option>
              <option value="openai-tts-1-hd">OpenAI TTS-1-HD</option>
              <option value="google-wavenet">Google WaveNet</option>
              <option value="aws-polly">AWS Polly</option>
            </select>
          </div>

          {/* Voice Gender */}
          <div>
            <Label htmlFor="gender">Voice Gender</Label>
            <div className="mt-2 flex gap-4">
              {['female', 'male', 'neutral'].map((gender) => (
                <button
                  key={gender}
                  onClick={() => setVoiceGender(gender)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${voiceGender === gender
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                >
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Test Voice */}
          <div>
            <Label htmlFor="test">Test Voice</Label>
            <div className="mt-2 space-y-2">
              <Input
                id="test"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter text to test voice..."
              />
              <Button className="gap-2">
                <Play className="h-4 w-4" />
                Test Voice
              </Button>
            </div>
          </div>

          <Button className="w-full bg-primary">
            <Save className="mr-2 h-4 w-4" />
            Save Configuration
          </Button>
        </CardContent>
      </Card>

      {/* Voice Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Voice Commands</CardTitle>
          <CardDescription>Available voice commands for users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="rounded-lg border p-3">
              <div className="flex items-start gap-2">
                <span className="text-xl">🎤</span>
                <div>
                  <p className="font-semibold">&quot;Log my meal&quot;</p>
                  <p className="text-xs text-muted-foreground">Add food to diary by voice</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-start gap-2">
                <span className="text-xl">🎤</span>
                <div>
                  <p className="font-semibold">&quot;What's my milk score&quot;</p>
                  <p className="text-xs text-muted-foreground">Get current milk score</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-start gap-2">
                <span className="text-xl">🎤</span>
                <div>
                  <p className="font-semibold">&quot;Show me recipes&quot;</p>
                  <p className="text-xs text-muted-foreground">Browse available recipes</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-start gap-2">
                <span className="text-xl">🎤</span>
                <div>
                  <p className="font-semibold">&quot;What can I eat&quot;</p>
                  <p className="text-xs text-muted-foreground">Check safe foods for breastfeeding</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Model Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Model Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-semibold">Food Recognition (Demo)</p>
            <p className="text-muted-foreground mt-1">
              Current: Mock analysis returning random food from database
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              In production: Would use Google Vision API or AWS Rekognition
            </p>
          </div>
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-semibold">Natural Language Processing</p>
            <p className="text-muted-foreground mt-1">
              Current: Simple text matching for voice commands
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              In production: Would use OpenAI GPT or similar LLM
            </p>
          </div>
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-semibold">Nutrition Analysis</p>
            <p className="text-muted-foreground mt-1">
              Current: Static nutrition database from mock data
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              In production: Would integrate with USDA FoodData Central
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
