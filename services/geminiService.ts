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
- Do not use disconnected sentences. It should read like one cohesive speech split into lines.

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
Your task is to analyze product images and generate a structured UGC script formatted specifically for "Veo 3".

${COMPLIANCE_GUIDELINES}

LENGTH CONSTRAINTS (CRITICAL):
- Each "FALA EM PT-BR" section must be SHORT, PUNCHY and FAST.
- MAXIMUM 20 WORDS PER PART. Do not exceed 20 words per spoken section.
- Be direct. Eliminate fluff.

Output Format Requirements (STRICTLY FOLLOW THIS STRUCTURE):

ESTILO UGC (User Generated Content): [Short Strategy Description]

PARTE 1 - GANCHO:
CENA: [Visual description of the scene]
FALA EM PT-BR: [Spoken text in natural Brazilian Portuguese - MAX 20 WORDS]

PARTE 2 - CONTEÚDO:
CENA: [Visual description of the scene]
FALA EM PT-BR: [Spoken text in natural Brazilian Portuguese - MAX 20 WORDS]

PARTE 3 - CTA:
CENA: [Visual description of the scene]
FALA EM PT-BR: [Spoken text in natural Brazilian Portuguese - MAX 20 WORDS]

IMPORTANT: No text overlays, no captions, no visual elements on screen. Only the presenter and the product.
`;

const getSoraPrompt = (brandName: string, brandDisplay: string, productTitle: string) => {
    // Explicitly define the exact string to be used for the presenter to avoid any AI variation
    let presenterBase = 'Apresentador homem';

    if (brandName === "Bruno.wins") {
        presenterBase = 'Apresentador homem e apresentadora mulher juntos';
    } else if (brandName === 'Shop.bruno') {
        presenterBase = 'Apresentadora mulher';
    } else if (brandName === 'Bruno.shopp') {
        // Randomly select between Male and Female for Bruno.shopp to ensure variety
        presenterBase = Math.random() < 0.5 ? 'Apresentador homem' : 'Apresentadora mulher';
    }

    return `
Product Name: ${productTitle}
Brand Display: ${brandDisplay}

Generate a 10s video script.

STRICT VISUAL INSTRUCTION:
The first line MUST be exactly:
"${presenterBase} usando camiseta preta com texto centralizado no meio do peito escrito "${brandDisplay}""
(Do not add any other visual details, no background, no emotions).

SCRIPT CONTENT:
Generate 4-5 lines of continuous, punchy sales copy in Portuguese ending with "clica no carrinho laranja".

REQUIRED OUTPUT FORMAT (Ensure the IMPORTANT line is included at the end):
${presenterBase} usando camiseta preta com texto centralizado no meio do peito escrito "${brandDisplay}"

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

Generate a high-converting 3-part UGC script (24s total).

Structure:
Part 1 (Hook): Grab attention immediately. (MAX 20 WORDS)
Part 2 (Content): Explain why this product is amazing. (MAX 20 WORDS)
Part 3 (CTA): Strong call to action for the "carrinho laranja". (MAX 20 WORDS)

Ensure the output exactly matches the requested format with "PARTE X - [TITLE]:", "CENA:", and "FALA EM PT-BR:".
Keep sentences short and dynamic.
End with the IMPORTANT line.
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

    // More robust intro extraction
    const firstPartMatch = promptText.match(/PARTE 1/i);
    if (firstPartMatch && firstPartMatch.index !== undefined && firstPartMatch.index > 0) {
        intro = promptText.substring(0, firstPartMatch.index).trim();
    } else if (!firstPartMatch) {
        // Only valid if we can't find parts at all, return raw
        return { intro: promptText, parts: [] };
    }

    const partConfigs = [
        { title: 'GANCHO', timing: '0-8s', partNum: 1 },
        { title: 'CONTEÚDO', timing: '8-16s', partNum: 2 },
        { title: 'CTA', timing: '16-24s', partNum: 3 },
    ];

    for (const config of partConfigs) {
        // Regex logic:
        // Find "PARTE X" ...
        // Capture everything until the next "PARTE Y" OR "IMPORTANT:" OR End of string.
        // We handle slight variations in separators ( - , :, space).
        const nextPartNum = config.partNum + 1;
        
        // Flexible regex for the section header, e.g., "PARTE 1 - GANCHO" or "PARTE 1: GANCHO"
        const sectionHeaderRegex = `PARTE ${config.partNum}[^\\n]*?${config.title}`;
        
        // Lookahead for next section or footer
        const lookahead = `(?=PARTE ${nextPartNum}|IMPORTANT:|$)`;
        
        // Full regex with case insensitivity
        const partRegex = new RegExp(`(${sectionHeaderRegex})([\\s\\S]*?)${lookahead}`, 'i');
        
        const partMatch = promptText.match(partRegex);
        
        if (partMatch && partMatch[2]) {
            const rawContent = partMatch[2].trim();
            
            // Extract Scene
            const sceneMatch = rawContent.match(/CENA:\s*([\s\S]*?)(?=FALA EM PT-BR:|$)/i);
            const scene = sceneMatch ? sceneMatch[1].trim() : '';
            
            // Extract Speech
            // Remove "IMPORTANT: ..." if it got caught in the speech group (unlikely with lookahead but safe to do)
            const speechMatch = rawContent.match(/FALA EM PT-BR:\s*([\s\S]*?)$/i);
            let speech = speechMatch ? speechMatch[1].trim() : '';
            
            // Cleanup speech if it captured trailing text
            speech = speech.replace(/\n*IMPORTANT:.*$/i, '').trim();
            
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