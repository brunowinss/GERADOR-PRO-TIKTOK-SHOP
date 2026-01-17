import { GoogleGenAI } from "@google/genai";
import { ParsedScript, ScriptPart } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const COMPLIANCE_GUIDELINES = `
STRICT TIKTOK SHOP COMPLIANCE RULES (MANDATORY):
1. NO FALSE SCARCITY: Do not claim "Limited time only", "Last chance", or "Ending soon" to pressure an immediate decision unless strictly true. Do not deprive the buyer of sufficient time to make a conscious choice.
2. NO "FREE" MISLEADING CLAIMS: Do not describe products as "Free" (Grátis), "No Cost" (Sem custo), or similar if the buyer has to pay shipping or any other fee.
3. NO MEDICAL CURES: Do not claim the product cures diseases, dysfunctions, or malformations without objective, verifiable evidence. Avoid definitive medical claims for supplements/wellness products.
4. NO FAKE RIGHTS AS BONUSES: Do not present standard legal rights (e.g., "7-day refund guarantee") as a unique offer differentiator or a special bonus.
5. NO FAKE ENDORSEMENTS: Do not claim endorsements, trust seals, or quality marks that do not exist.
6. HONESTY: Do not mislead about product functions or claim compliance with laws if not true.
`;

const SORA_SYSTEM_PROMPT = `
You are a specialized script generator for AI video ads.
Your goal is to generate a script following a STRICT format.

${COMPLIANCE_GUIDELINES}

VISUAL DESCRIPTION RULES (CRITICAL):
- You MUST NOT describe the background, environment, lighting, furniture, or setting.
- You MUST NOT describe the presenter's age ("jovem"), emotion ("sorridente", "carismática"), or attractiveness.
- The visual description line must ONLY contain the presenter type and the t-shirt description.
- STRICT TEMPLATE: "[Presenter Type] usando camiseta preta com texto centralizado no meio do peito escrito [Brand Display]"

BAD VISUAL EXAMPLE (NEVER DO THIS):
"Apresentadora mulher jovem e carismática, sorridente, em um ambiente doméstico moderno e bem iluminado..."

GOOD VISUAL EXAMPLE (DO THIS):
"Apresentadora mulher usando camiseta preta com texto centralizado no meio do peito escrito Shop.Bruno"

AUDIO RULES:
- The "FALA" lines must form a continuous, natural, high-energy sales pitch.
- TOTAL SPEECH LENGTH STRICT LIMIT: MAXIMUM 40 WORDS TOTAL (Sum of all lines).
- The video is only 10 seconds long. The speech must be extremely concise and direct.
- Do not use disconnected sentences. It should read like one cohesive speech split into lines.

COPY VARIATION (IMPORTANT):
- Ensure each generated script is unique. Avoid repetitive phrasing or identical sentence structures across different requests, while still adhering to all other rules, especially length limits.

OUTPUT FORMAT:
1. Visual Line (Strict Template)
2. FALA: [Speech Line 1]
3. FALA: [Speech Line 2]
...
4. FALA: clica no carrinho laranja
5. IMPORTANT: No text overlays, no captions, no visual elements on screen. Only the presenter and the product.
`;

const VEO_SYSTEM_PROMPT = `
You are an expert UGC (User Generated Content) creator scriptwriter for TikTok Shop.
Your task is to analyze product images and generate a structured 3-PART UGC script formatted specifically for "Veo 3".

${COMPLIANCE_GUIDELINES}

TARGET AESTHETIC & CONTEXT (INTERNAL GUIDE):
- STYLE: Minimalist fashion, clean lines, neutral colors, sophisticated.
- CHARACTER: Fictional woman, calm, elegant, and confident. Fashion influencer vibe. NO explicit facial expressions.
- SETTING: Modern and elegant fitting room. Large mirror, soft indirect lighting.
- ACTIONS: Mirror selfie POV. Holding phone, adjusting outfit, subtle movements (zoom/tilt).
- TONE KEYPHRASE: "Olha isso... simplesmente perfeito."

VISUAL STYLE (OUTPUT RULES):
- The video is a SINGLE CONTINUOUS TAKE based on the "Target Aesthetic" above.
- DO NOT generate "CENA:" lines in the output. The visual is implied to be the specific mirror selfie setting described.
- CRITICAL: The final video MUST NOT have any text overlays, captions, graphics, cards, or any textual elements on screen. Only the presenter and the product.

COPYWRITING STRATEGY (CRITICAL):
- USE PRICE ANCHORING: Compare the product value to physical stores. Example: "In physical stores this costs X, but here it's Y".
- TONE: Informal but POLISHED and ELEGANT. Matches the "Clean Fashion" visual.
- SPEECH FLOW: The "FALA EM PT-BR" must be a CONTINUOUS paragraph. NO pauses, NO line breaks within a speech section.

LENGTH CONSTRAINTS:
- Each "FALA EM PT-BR" section must be PUNCHY. MAX 25 WORDS per part.

COPY VARIATION (IMPORTANT):
- Ensure each generated script is unique. Avoid repetitive phrasing or identical sentence structures across different requests, especially for the GANCHO, VALOR, and CTA sections. Strive for fresh, diverse linguistic expression while adhering to all other rules.

Output Format Requirements (STRICTLY FOLLOW THIS STRUCTURE AND TITLES):

ESTILO UGC: [Short Strategy Description]

PARTE 1 - GANCHO:
FALA EM PT-BR: [Continuous text. Hook the viewer instantly. No line breaks.]

PARTE 2 - VALOR:
FALA EM PT-BR: [Continuous text. Price comparison logic. No line breaks.]

PARTE 3 - CTA:
FALA EM PT-BR: [Continuous text. Strong urgency. No line breaks.]

IMPORTANT: No text overlays, no captions, no visual elements on screen. Only the presenter and the product.
`;

const getSoraPrompt = (brandName: string, brandDisplay: string, productTitle: string) => {
    // Define base presenter and t-shirt text
    let presenterBase = 'Apresentador homem';
    let tShirtText = brandDisplay;

    // Specific logic per brand
    if (brandName === "Bruno.wins") {
        presenterBase = 'Apresentador homem e apresentadora mulher juntos';
        tShirtText = 'wins.creator'; // Force 'wins.creator' for this specific brand
    } else if (brandName === 'Shop.bruno') {
        presenterBase = 'Apresentadora mulher';
    } else if (brandName === 'Bruno.shopp') {
        // Randomly select between Male and Female for Bruno.shopp variety
        presenterBase = Math.random() < 0.5 ? 'Apresentador homem' : 'Apresentadora mulher';
    }

    return `
Product Name: ${productTitle}
Brand Display: ${brandDisplay}

Generate a 10s video script.

STRICT VISUAL INSTRUCTION:
The first line MUST be exactly:
"${presenterBase} usando camiseta preta com texto centralizado no meio do peito escrito "${tShirtText}""
(Do not add any other visual details, no background, no emotions).

SCRIPT CONTENT:
Generate a short, punchy sales pitch in Portuguese.
CRITICAL: The total word count of all "FALA" lines combined MUST NOT EXCEED 40 WORDS.
The video is short (10s). Be direct.
End with "clica no carrinho laranja".

REQUIRED OUTPUT FORMAT (Ensure the IMPORTANT line is included at the end):
${presenterBase} usando camiseta preta com texto centralizado no meio do peito escrito "${tShirtText}"

FALA: [Line 1]
FALA: [Line 2]
FALA: [Line 3]
FALA: [Line 4]
FALA: clica no carrinho laranja

IMPORTANT: No text overlays, no captions, no visual elements on screen. Only the presenter and the product.
`;
};

const getVeoPrompt = (productTitle: string) => {
    return `
Product Name: ${productTitle}

Generate a high-converting 3-PART UGC script (24s total) for a TikTok Shop ad.
Focus on creative, viral copy with price comparisons (Anchor Pricing).

Structure:
Part 1 (Hook): Stop the scroll.
Part 2 (Value/Comparison): The "Logic". Physical Store vs TikTok Shop comparison.
Part 3 (Call to Action): Close the deal.

Ensure the output exactly matches the requested format with "PARTE X - [TITLE]:" and "FALA EM PT-BR:".
DO NOT output "CENA:" lines. The visual is a static mirror selfie (Clean/Minimalist/Fashion style).
The "FALA" in each part must be a single, continuous sentence/paragraph without line breaks.

TONE REMINDER: "Olha isso... simplesmente perfeito." - Elegant, calm, confident.
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
                temperature: 0.85, // Higher temperature for more creativity/boldness in copy
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

    // Robust intro extraction
    const firstPartMatch = promptText.match(/PARTE 1/i);
    if (firstPartMatch && firstPartMatch.index !== undefined && firstPartMatch.index > 0) {
        intro = promptText.substring(0, firstPartMatch.index).trim();
    } else if (!firstPartMatch) {
        return { intro: promptText, parts: [] };
    }

    const partConfigs = [
        { title: 'GANCHO', timing: '0-8s', partNum: 1 },
        { title: 'VALOR', timing: '8-16s', partNum: 2 },
        { title: 'CTA', timing: '16-24s', partNum: 3 },
    ];

    for (const config of partConfigs) {
        const nextPartNum = config.partNum + 1;
        // Regex to find "PARTE X - TITLE" or just "PARTE X" loosely to be safe, but targeting the prompt format
        const sectionHeaderRegex = `PARTE ${config.partNum}[^\\n]*`;
        const lookahead = `(?=PARTE ${nextPartNum}|IMPORTANT:|$)`;
        const partRegex = new RegExp(`(${sectionHeaderRegex})([\\s\\S]*?)${lookahead}`, 'i');
        
        const partMatch = promptText.match(partRegex);
        
        if (partMatch && partMatch[2]) {
            const rawContent = partMatch[2].trim();
            // Scene match is now optional or will be empty since we requested NO SCENES
            const sceneMatch = rawContent.match(/CENA:\s*([\s\S]*?)(?=FALA EM PT-BR:|$)/i);
            const scene = sceneMatch ? sceneMatch[1].trim() : '';
            
            const speechMatch = rawContent.match(/FALA EM PT-BR:\s*([\s\S]*?)$/i);
            let speech = speechMatch ? speechMatch[1].trim() : '';
            speech = speech.replace(/\n*IMPORTANT:.*$/i, '').trim();
            // Clean up any stray newlines within speech to ensure continuity
            speech = speech.replace(/\s+/g, ' ');
            
            parts.push({
                title: config.title,
                timing: config.timing,
                scene,
                speech,
            });
        }
    }

    return { intro, parts };
};