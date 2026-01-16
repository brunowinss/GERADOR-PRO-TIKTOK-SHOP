import React from 'react';
import { Zap, ChevronDown } from './Icons';

export const HeroSection: React.FC = () => (
    <div className="text-center">
        <div className="flex justify-center mb-6 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-primary/15 border border-primary/30 rounded-full">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-primary">Gerador de Prompts para Vídeo IA</span>
            </div>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-2 font-display">
            <span className="text-white">Crie vídeos de produto</span>
            <br />
            <span className="text-primary">que vendem no </span>
            <span className="text-[#f5d742]">TikTok</span>
        </h1>
        
        <p className="text-[#888] text-sm sm:text-lg max-w-2xl mx-auto mb-6 sm:mb-10 px-4">
            Envie a foto do seu produto e receba um prompt otimizado para{' '}
            <span className="text-white font-medium">Sora 2</span>
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            + script de vendas pronto para usar.
        </p>

        <div className="flex justify-center items-center gap-6 sm:gap-12 mb-6 sm:mb-10">
            <div className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-[#4ecdc4]">10s</div>
                <div className="text-xs sm:text-sm text-[#666] mt-1">Vídeo Sora</div>
            </div>
            <div className="h-6 sm:h-8 w-px bg-[#222]" />
            <div className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-[#f5d742]">16s</div> {/* Updated from 8s to 16s */}
                <div className="text-xs sm:text-sm text-[#666] mt-1">Vídeo Veo3</div>
            </div>
            <div className="h-6 sm:h-8 w-px bg-[#222]" />
            <div className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-primary">JSON</div>
                <div className="text-xs sm:text-sm text-[#666] mt-1">Pronto p/ API</div>
            </div>
        </div>

        <div className="flex justify-center mb-6 sm:mb-10">
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#444]" />
        </div>
    </div>
);