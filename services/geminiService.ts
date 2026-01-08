import { GoogleGenAI } from "@google/genai";
import { ParsedScript, ScriptPart } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SORA_SYSTEM_PROMPT = `
You are an expert copywriter for TikTok Shop video ads.
Your task is to analyze product images and generate a short, high-conversion video script formatted specifically for a video generation AI called "Sora 2".

Output Format Requirements:
1.  Presenter description line.
2.  Text on chest line: "... com texto centralizado no meio do peito escrito [Brand Display]"
3.  Series of "FALA:" lines which are the spoken audio by the presenter.
4.  Ends with "IMPORTANT: No text overlays..."

The tone should be energetic, persuasive, and authentic to Brazilian Portuguese trends on TikTok.
`;

const VEO_SYSTEM_PROMPT = `
You are an expert UGC (User Generated Content) creator scriptwriter for TikTok Shop.
Your task is to analyze product images and generate a structured UGC script formatted specifically for "Veo 3".

Output Format Requirements:
1.  Header: "ESTILO UGC (User Generated Content): [Description]"
2.  PARTE 1 (0-8s) - GANCHO: [Scene description] and [Spoken text in PT-BR]
3.  PARTE 2 (8-16s) - CONTEÚDO: [Scene description] and [Spoken text in PT-BR]
4.  PARTE 3 (16-24s) - CTA: [Scene description] and [Spoken text in PT-BR]
5.  Ends with "IMPORTANT: No text overlays..."

The spoken text must be in natural, conversational Brazilian Portuguese.
`;

const getSoraPrompt = (brandName: string, brandDisplay: string, productTitle: string) => {
    const presenter = brandName === "Bruno.wins"
        ? 'Apresentador homem e apresentadora mulher juntos'
        : (brandName === 'Shop.bruno' ? 'Apresentadora mulher jovem e carismática' : 'Apresentador usando camiseta preta');

    return `
Product Name: ${productTitle}
Brand Name: ${brandName}
Brand Display Text: ${brandDisplay}

Generate a 10s video script.
1. Presenter: ${presenter}.
2. The presenter must have the text "${brandDisplay}" centered on their chest.
3. Include 4-5 short, punchy spoken lines (FALA) in Portuguese (PT-BR).
4. The last line must be a CTA like "clica no carrinho laranja".
`;
};

const getVeoPrompt = (productTitle: string) => {
    return `
Product Name: ${productTitle}

Generate a 3-part UGC script (24s total).
Part 1 (Hook): Surprise/Attention grabber.
Part 2 (Content): Showing product details/benefits.
Part 3 (CTA): Urgency to buy from the orange cart.
`;
};

export const generateScript = async (
    base64Image: string,
    brandName: string,
    brandDisplay: string,
    isVeo3: boolean,
    productTitle: string
): Promise<string> => {
    try {
        const systemInstruction = isVeo3 ? VEO_SYSTEM_PROMPT : SORA_SYSTEM_PROMPT;
        const prompt = isVeo3 
            ? getVeoPrompt(productTitle) 
            : getSoraPrompt(brandName, brandDisplay, productTitle);

        // Extract mimeType and clean base64 data
        const mimeMatch = base64Image.match(/^data:(.*);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const cleanBase64 = base64Image.replace(/^data:(.*);base64,/, '');

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: cleanBase64
                        }
                    },
                    {
                        text: prompt
                    }
                ]
            },
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7, // Creativity balanced with format adherence
            }
        });

        const text = response.text;
        if (!text) {
            throw new Error("No text generated from Gemini");
        }
        return text;

    } catch (error) {
        console.error("Error generating script with Gemini:", error);
        throw error;
    }
};

// Parser utility for Veo3 scripts
export const parseVeo3Script = (promptText: string): ParsedScript | null => {
    if (!promptText) return null;
    
    const parts: ScriptPart[] = [];
    let intro = '';

    const parte1Index = promptText.indexOf('PARTE 1');
    if (parte1Index > 0) {
        intro = promptText.substring(0, parte1Index).trim();
    }

    const partConfigs = [
        { title: 'GANCHO', timing: '0-8s', partNum: 1 },
        { title: 'CONTEÚDO', timing: '8-16s', partNum: 2 },
        { title: 'CTA', timing: '16-24s', partNum: 3 },
    ];

    for (const config of partConfigs) {
        // Regex to capture content between parts
        const nextPart = config.partNum + 1;
        const partRegex = new RegExp(`PARTE ${config.partNum}[^]*?${config.title}[:\\s]*([\\s\\S]*?)(?=PARTE ${nextPart}|IMPORTANT:|$)`, 'i');
        const partMatch = promptText.match(partRegex);
        
        if (partMatch && partMatch[1]) {
            const partContent = partMatch[1];
            
            const sceneMatch = partContent.match(/CENA:\s*([\s\S]*?)(?=FALA EM PT-BR:|$)/i);
            const scene = sceneMatch ? sceneMatch[1].trim() : '';
            
            const speechMatch = partContent.match(/FALA EM PT-BR:\s*([\s\S]*?)$/i);
            const speech = speechMatch ? speechMatch[1].trim().replace(/\n.*IMPORTANT.*/gi, '').trim() : '';
            
            parts.push({
                title: config.title,
                timing: config.timing,
                scene,
                speech,
            });
        }
    }

    // Fallback if regex fails (simple split)
    if (parts.length === 0 && promptText.includes('PARTE 1')) {
         // Basic parsing logic if rigorous regex fails
         return { intro: promptText, parts: [] };
    }

    return { intro, parts };
};