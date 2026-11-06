import React, { useEffect, useState } from 'react';
import { CortexLogo } from '../common/CortexLogo';

interface MobileSplashScreenProps {
  onFinish?: () => void;
  durationMs?: number;
}

export const MobileSplashScreen: React.FC<MobileSplashScreenProps> = ({
  onFinish,
  durationMs = 2500, // 2.5 seconds as requested
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, durationMs - 400);

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  return (
    <div
      onClick={() => onFinish && onFinish()}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#452267] transition-opacity duration-400 cursor-pointer select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 
        Tela de Abertura (Splash Screen):
        Ao abrir, tem animação de entrada suave (Fade-In com leve Zoom-In de 0.95 para 1.0 em 600ms) 
        sobre o fundo roxo #452267 por 2 a 3 segundos antes de liberar o acesso.
      */}
      <div className="flex flex-col items-center justify-center p-6 animate-splash-in">
        <div className="w-64 sm:w-80 max-w-[85vw] flex items-center justify-center drop-shadow-2xl">
          <img
            src="/cortex_splash_transparent.png"
            alt="Cortex Psicologia em Equilíbrio"
            className="w-auto max-h-56 sm:max-h-64 object-contain"
          />
        </div>
      </div>
    </div>
  );
};
