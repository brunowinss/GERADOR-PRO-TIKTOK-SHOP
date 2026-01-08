import React, { useState } from 'react';
import { MultiImageUploader } from './MultiImageUploader';
import { ProductCard } from './ProductCard';
import { ProductImage } from '../types';
import { generateScript } from '../services/geminiService';
import { useToast } from './ui/Toast';
import { Package, CheckCircle2, Loader2 } from './Icons';

interface BrandTabProps {
    brandName: string;
    brandDisplay: string;
    isVeo3?: boolean;
}

export const BrandTab: React.FC<BrandTabProps> = ({ brandName, brandDisplay, isVeo3 = false }) => {
    const [images, setImages] = useState<ProductImage[]>([]);
    const [generatedPrompts, setGeneratedPrompts] = useState<Record<string, string>>({});
    const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
    const [isGenerating, setIsGenerating] = useState(false);
    const { success, error } = useToast();

    const handleImagesChange = (newImages: ProductImage[]) => {
        setImages(newImages);
        const newPrompts: Record<string, string> = {};
        newImages.forEach(img => {
            if (generatedPrompts[img.id]) {
                newPrompts[img.id] = generatedPrompts[img.id];
            }
        });
        setGeneratedPrompts(newPrompts);
    };

    const handleGenerate = async () => {
        if (images.length === 0) {
            error('Adicione imagens primeiro');
            return;
        }

        setIsGenerating(true);
        const idsToGenerate = images.filter(img => !generatedPrompts[img.id]).map(img => img.id);
        setGeneratingIds(new Set(idsToGenerate));
        
        try {
            // Process sequentially to respect rate limits roughly, though parallel is often fine for small batches.
            // Using Promise.all for better UX.
            const generatePromises = images.map(async (image) => {
                if (generatedPrompts[image.id]) return; // Skip already generated
                
                try {
                    const prompt = await generateScript(
                        image.preview, 
                        brandName, 
                        brandDisplay, 
                        isVeo3, 
                        image.file.name.split('.')[0]
                    );

                    setGeneratedPrompts(prev => ({ ...prev, [image.id]: prompt }));
                } catch (e) {
                    console.error(`Failed to generate for ${image.id}`, e);
                    error(`Erro ao gerar para ${image.file.name}`);
                } finally {
                    setGeneratingIds(prev => {
                        const next = new Set(prev);
                        next.delete(image.id);
                        return next;
                    });
                }
            });

            await Promise.all(generatePromises);
            success('Processamento concluído!');
        } catch (err) {
            console.error('Error:', err);
            error('Erro geral ao gerar scripts.');
        } finally {
            setIsGenerating(false);
            setGeneratingIds(new Set());
        }
    };

    const completedCount = images.filter(img => generatedPrompts[img.id]).length;
    const allCompleted = images.length > 0 && completedCount === images.length;

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MultiImageUploader onImagesChange={handleImagesChange} images={images} maxImages={50} />

            {images.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-card/60 backdrop-blur-sm rounded-xl border border-border/50">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 bg-muted/50 rounded-lg">
                                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <span className="text-xl sm:text-2xl font-bold text-foreground">{images.length}</span>
                                    <span className="text-xs sm:text-sm text-muted-foreground ml-1">produtos</span>
                                </div>
                            </div>
                            
                            {allCompleted && (
                                <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-primary/10 border border-primary/30 rounded-full">
                                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                                    <span className="text-xs sm:text-sm font-medium text-primary">Concluído</span>
                                </div>
                            )}
                        </div>
                        
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || allCompleted}
                            className={`
                                flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base w-full sm:w-auto justify-center
                                ${allCompleted
                                    ? "bg-primary/20 text-primary border border-primary/30"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        >
                            {allCompleted ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span>Tudo Pronto!</span>
                                </>
                            ) : isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                    <span>Gerando...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span>Gerar Scripts</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                        {images.map((image) => (
                            <ProductCard
                                key={image.id}
                                image={image}
                                prompt={generatedPrompts[image.id] || null}
                                isGenerating={generatingIds.has(image.id)}
                                onRemove={() => handleImagesChange(images.filter(img => img.id !== image.id))}
                                isVeo3={isVeo3}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};