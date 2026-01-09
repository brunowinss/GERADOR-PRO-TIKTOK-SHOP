import React, { useState, useMemo } from 'react';
import { ProductImage, ScriptPart } from '../types';
import { parseVeo3Script } from '../services/geminiService';
import { useToast } from './ui/Toast';
import { Check, Copy, Trash2, CheckCircle2, Loader2, FileJson, ChevronDown } from './Icons';

interface ProductCardProps {
    image: ProductImage;
    prompt: string | null;
    isGenerating: boolean;
    onRemove: () => void;
    isVeo3?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ image, prompt, isGenerating, onRemove, isVeo3 = false }) => {
    const [copied, setCopied] = useState(false);
    const [copiedPart, setCopiedPart] = useState<number | null>(null);
    const [copiedIntro, setCopiedIntro] = useState(false);
    const [showJson, setShowJson] = useState(false);
    const { success, error } = useToast();

    const countWords = (text: string) => {
        const normalized = text.replace(/\s+/g, ' ').trim();
        if (!normalized) return 0;
        return normalized.split(' ').filter(Boolean).length;
    };

    const parsedScript = useMemo(() => {
        if (!prompt || !isVeo3) return null;
        return parseVeo3Script(prompt);
    }, [prompt, isVeo3]);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!prompt) return;
        try {
            await navigator.clipboard.writeText(prompt);
            setCopied(true);
            success('Prompt completo copiado!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            error('Erro ao copiar');
        }
    };

    const handleCopyPart = async (index: number, part: ScriptPart, e: React.MouseEvent) => {
        e.stopPropagation();
        let fullPart = `CENA: ${part.scene}\n\nFALA EM PT-BR: ${part.speech}`;
        
        // Append warning to the last part (Part 3) for Veo3
        if (isVeo3 && parsedScript && index === parsedScript.parts.length - 1) {
            fullPart += "\n\nIMPORTANT: No text overlays, no captions, no visual elements on screen. Only the presenter and the product.";
        }

        try {
            await navigator.clipboard.writeText(fullPart);
            setCopiedPart(index);
            success('Parte copiada!');
            setTimeout(() => setCopiedPart(null), 2000);
        } catch (err) {
            error('Erro ao copiar');
        }
    };

    const handleCopyIntro = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!parsedScript?.intro) return;
        try {
            await navigator.clipboard.writeText(parsedScript.intro);
            setCopiedIntro(true);
            success('Introdução copiada!');
            setTimeout(() => setCopiedIntro(false), 2000);
        } catch (err) {
            error('Erro ao copiar');
        }
    };

    const productTitle = image.file.name.replace(/\.[^/.]+$/, "").substring(0, 40);

    return (
        <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden hover:border-primary/30 transition-colors">
            <div className="p-4">
                <div className="flex gap-4">
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted/30 border border-border/30">
                        <img 
                            src={image.preview} 
                            alt={productTitle}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-foreground truncate" title={productTitle}>
                                {productTitle}...
                            </h3>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                    onClick={handleCopy}
                                    disabled={!prompt}
                                    className={`
                                        p-2 rounded-lg transition-all duration-200
                                        ${copied ? "text-primary bg-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}
                                        disabled:opacity-30 disabled:cursor-not-allowed
                                    `}
                                    title={copied ? "Copiado!" : "Copiar prompt"}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={onRemove}
                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                    title="Remover"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {isGenerating ? (
                            <div className="flex items-center gap-1.5 mt-1">
                                <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                                <span className="text-sm text-primary">Gerando...</span>
                            </div>
                        ) : prompt ? (
                            <div className="flex items-center gap-1.5 mt-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                                <span className="text-sm text-primary font-medium">Pronto</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-sm text-muted-foreground">Aguardando...</span>
                            </div>
                        )}

                        {prompt && !isVeo3 && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2 font-mono">
                                "{prompt.substring(0, 100)}..."
                            </p>
                        )}
                    </div>
                </div>

                {prompt && isVeo3 && parsedScript && (
                    <div className="mt-4 space-y-3">
                        {parsedScript.intro && (
                            <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Instruções Técnicas
                                    </span>
                                    <button
                                        onClick={handleCopyIntro}
                                        className={`
                                            p-1.5 rounded-md transition-all duration-200
                                            ${copiedIntro ? "text-primary bg-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}
                                        `}
                                        title="Copiar introdução"
                                    >
                                        {copiedIntro ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {parsedScript.intro.substring(0, 150)}...
                                </p>
                            </div>
                        )}

                        {parsedScript.parts.map((part, index) => (
                            <div 
                                key={index} 
                                className={`
                                    p-4 rounded-xl border
                                    ${index === 0 ? "bg-amber-500/10 border-amber-500/30" : ""}
                                    ${index === 1 ? "bg-blue-500/10 border-blue-500/30" : ""}
                                    ${index === 2 ? "bg-green-500/10 border-green-500/30" : ""}
                                `}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`
                                            px-2.5 py-1 rounded-lg text-xs font-bold uppercase
                                            ${index === 0 ? "bg-amber-500/20 text-amber-600" : ""}
                                            ${index === 1 ? "bg-blue-500/20 text-blue-600" : ""}
                                            ${index === 2 ? "bg-green-500/20 text-green-600" : ""}
                                        `}>
                                            {part.title}
                                        </span>
                                        <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                                            {part.timing}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 rounded bg-muted/40 text-muted-foreground border border-border/40">
                                            {countWords(part.speech)} pal.
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => handleCopyPart(index, part, e)}
                                        className={`
                                            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                                            ${copiedPart === index 
                                                ? "text-primary bg-primary/20 border border-primary/30" 
                                                : "text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted border border-border/50"
                                            }
                                        `}
                                        title="Copiar esta parte"
                                    >
                                        {copiedPart === index ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedPart === index ? 'Copiado!' : 'Copiar'}</span>
                                    </button>
                                </div>

                                {part.scene && (
                                    <div className="mb-3 p-2.5 bg-muted/30 rounded-lg border border-border/30">
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Cena</span>
                                        <p className="text-xs text-foreground/80 mt-1 leading-relaxed">{part.scene}</p>
                                    </div>
                                )}

                                <div className="p-2.5 bg-background/50 rounded-lg border border-border/30">
                                    <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">Fala em PT-BR</span>
                                    <p className="text-sm text-foreground/90 mt-1 leading-relaxed">{part.speech}</p>
                                </div>

                                {isVeo3 && index === parsedScript.parts.length - 1 && (
                                    <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400 font-medium font-mono">
                                        IMPORTANT: No text overlays, no captions, no visual elements on screen. Only the presenter and the product.
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {prompt && (
                <div className="border-t border-border/30">
                    <button
                        onClick={() => setShowJson(!showJson)}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <FileJson className="w-4 h-4" />
                            <span>Ver Prompt Raw</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showJson ? "rotate-180" : ""}`} />
                    </button>
                    {showJson && (
                        <div className="px-4 pb-4">
                            <pre className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap break-words max-h-64 font-mono">
                                {prompt}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};