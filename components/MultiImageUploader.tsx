import React, { useState, useCallback } from 'react';
import { Plus, ImagePlus } from './Icons';
import { ProductImage } from '../types';

interface MultiImageUploaderProps {
    onImagesChange: (images: ProductImage[]) => void;
    images: ProductImage[];
    maxImages?: number;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({ onImagesChange, images, maxImages = 50 }) => {
    const [isDragging, setIsDragging] = useState(false);

    const processFiles = useCallback((files: FileList | File[]) => {
        const fileArray = Array.from(files).filter(file => file.type.startsWith('image/'));
        const remainingSlots = maxImages - images.length;
        const filesToProcess = fileArray.slice(0, remainingSlots);

        const promises = filesToProcess.map(file => {
            return new Promise<ProductImage>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve({
                        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name}`,
                        file,
                        preview: reader.result as string,
                    });
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(promises).then(newImages => {
            onImagesChange([...images, ...newImages]);
        });
    }, [images, maxImages, onImagesChange]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if(e.dataTransfer.files) processFiles(e.dataTransfer.files);
    }, [processFiles]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) processFiles(e.target.files);
        e.target.value = '';
    }, [processFiles]);

    if (images.length > 0) {
        return (
            <label className="group relative flex items-center justify-center gap-3 p-4 cursor-pointer rounded-xl border border-dashed border-border/50 hover:border-primary/50 bg-muted/20 hover:bg-primary/5 transition-all duration-300">
                <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Plus className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Adicionar mais produtos</span>
            </label>
        );
    }

    return (
        <label
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={handleDrop}
            className={`
                group relative flex flex-col items-center justify-center w-full py-12 sm:py-20 cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden
                ${isDragging ? 'bg-primary/10 border-primary/50 scale-[1.01]' : 'border-border/50 hover:border-primary/40 hover:bg-muted/30'}
            `}
        >
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                    backgroundSize: '24px 24px'
                }} />
            </div>
            
            <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            
            <div className="relative flex flex-col items-center gap-4 sm:gap-6 px-4">
                <div className="relative">
                    <div className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-300 ${isDragging ? "bg-primary/40" : "bg-primary/20 group-hover:bg-primary/30"}`} />
                    <div className={`relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${isDragging ? "bg-primary/20 border-primary/50" : "bg-muted/50 border-border/50 group-hover:bg-primary/10 group-hover:border-primary/30"}`}>
                        <ImagePlus className={`w-8 h-8 sm:w-10 sm:h-10 transition-all duration-300 ${isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                    </div>
                </div>
                
                <div className="text-center space-y-1.5 sm:space-y-2">
                    <p className={`text-base sm:text-lg font-semibold transition-colors ${isDragging ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                        {isDragging ? 'Solte aqui!' : 'Arraste imagens ou clique para selecionar'}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground/60">
                        Faça upload de até {maxImages} produtos
                    </p>
                </div>
                
                <div className="flex items-center gap-1.5 sm:gap-2">
                    {['JPG', 'PNG', 'WebP'].map(format => (
                        <span key={format} className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-muted-foreground bg-muted/50 border border-border/30 rounded-full">
                            {format}
                        </span>
                    ))}
                </div>
            </div>
        </label>
    );
};