'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export function BotAnimation() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const frames = ['/bot_1.png', '/bot_2.png', '/bot_3.png'];
  const frameDuration = 500; // 500ms per frame

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, frameDuration);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center items-center">
      <div className="relative w-32 h-32">
        <Image
          src={frames[currentFrame]}
          alt="Nori Bot Animation"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
