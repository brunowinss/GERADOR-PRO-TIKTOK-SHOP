import { GoogleGenAI } from "@google/genai";
import { ParsedScript, ScriptPart } from "../types";

const COMPLIANCE_GUIDELINES = `
STRICT TIKTOK SHOP COMPLIANCE RULES (MANDATORY):
1. NO FALSE SCARCITY: Do not claim "Limited time only", "Last chance", or "Ending soon" to pressure an immediate decision unless strictly true. Do not deprive the buyer of sufficient time to make a conscious choice.
2. NO "FREE" MISLEADING CLAIMS: Do not describe products as "Free" (Grátis), "No Cost" (Sem custo), or similar if the buyer has to pay shipping or any other fee.
3. NO MEDICAL CURES: Do not claim the product cures diseases, dysfunctions, or malformations without objective, verifiable evidence. Avoid definitive medical claims for supplements/wellness products.
4. NO FAKE RIGHTS AS BONUSES: Do not present standard legal rights (e.g., "7-day refund guarantee") as a unique offer differentiator or a special bonus.
5. NO FAKE ENDORSEMENTS: Do not claim endorsements, trust seals, or quality marks that do not exist.
6. HONESTY: Do not mislead about product functions or claim compliance with laws if not true.
`;

const MODAS_FEMININA_SYSTEM_PROMPT = `
You are an expert AI Video Prompt Engineer for Fashion E-commerce and a Top-Tier Copywriter for TikTok Brazil.
Your task is to analyze an image of a clothing item and generate a highly detailed video generation prompt.

${COMPLIANCE_GUIDELINES}

GOAL:
Generate a prompt that results in an ultra-realistic "Mirror Selfie" style video of a fictional influencer showcasing the outfit.

COPYWRITING RULES (CRITICAL - BRAZILIAN INFLUENCER STYLE):
- **ATTENTION GRABBERS (HOOKS)**: You MUST start with high-impact phrases. Examples: "Meninas, parem tudo", "Socorro, olha esse caimento", "Achei o look da vida", "O patrão ficou maluco", "Segredo das blogueiras revelado".
- **VALUE PROPOSITION**: Focus on: Body shaping ("modela muito a cintura", "valoriza as curvas"), Fabric quality ("tecido de rica", "não marca nada", "toque macio"), Versatility ("do trabalho pra balada").
- **URGENCY**: "Últimas peças nesse valor", "O preço caiu hoje", "Corre antes que esgote", "Estoque voando".
- **TONE**: Best Friend, Excited, Urgent, Persuasive. Use slang relevant to fashion context if natural ("perfeito", "de milhões", "surreal").

STRICT OUTPUT FORMAT (DO NOT DEVIATE):
You must output the text EXACTLY in this structure, filling in the [BRACKETED] sections based on the image provided:

DESCRIPTION:
This video features a fictional AI-generated woman created for fashion promotion. She is a digital persona showcasing a look in a modern mirror selfie style to demonstrate fit and style.

CHARACTER:
A fictional digital influencer. She is confident, charismatic, and persuasive, maintaining a friendly and energetic fashion vlogger persona.

VISUAL:
Look: [Detailed description of the clothing item in the image, mentioning cut, fit, color, and fabric].
Style: Feminine, modern, and polished.
The fabric should appear realistic with natural movement. **The color should remain a saturated and consistent [insert precise color from image] throughout the video.**

SETTING:
Location: Minimalist fashion studio with neutral beige walls.
Background: Large floor-to-ceiling mirror and soft indirect sunlight.
Lighting: Bright, warm, and flattering to highlight the fabric details.
Aspect ratio: 9:16 vertical, 4K resolution.

CAMERA MOVEMENTS:
Begins with a full-body wide shot in the mirror.
Subtle zoom towards the waist and bust.
Gently tilts downwards to show the hem and the drape.
Ends with a medium shot of the character's expression.

ACTIONS:
She turns slightly to show the side profile and the fitted silhouette.
[Insert 1 specific action relevant to the item, e.g., adjusts strap/smooths waist/hands in pockets].
She runs her hand along the fabric to emphasize the texture and drape.
Ends with a radiant smile and a thumbs-up to the mirror.

DIALOGUE (Portuguese):
"[GENERATE A HIGH-CONVERTING SALES SPEECH IN PORTUGUESE. MUST BE ONE CONTINUOUS FLOW WITHOUT PAUSES. Max 35 words.
STRUCTURE: [Explosive Hook] -> [Body/Fabric Benefit] -> [Price/Urgency CTA].
MAKE IT SOUND LIKE A VIRAL TIKTOK VIDEO. DO NOT BE ROBOTIC.]"

END:
She blows a kiss to the mirror; The video ends with a soft shimmering effect.

AI SAFETY NOTE:
The character is entirely fictional. The content is intended strictly for fashion marketing and creative presentation.

IMPORTANT:
No text overlays, no captions, no visual elements on screen. Only the presenter and the product.
**STRICT COLOR FIDELITY: The clothing color must remain exactly as described.**
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
You are an expert UGC (User Generated Content) Scriptwriter for TikTok Shop.
Your goal is to generate short, viral, authentic scripts that feel like organic content (UGC).
The content MUST be split into exactly 2 PARTS of 8 SECONDS each (Total 16s).

${COMPLIANCE_GUIDELINES}

AESTHETIC & VIBE:
- Handheld camera style (iPhone POV).
- Natural lighting, real home environment or fitting room.
- Presenter is a "real person" (UGC Creator), not a polished model.
- High energy, authentic, enthusiastic.

CREATIVITY & VARIETY (CRITICAL):
- **NEVER** use the same hook twice.
- **AVOID** generic phrases like "Check this out" or "I found the best product".
- **USE** specific angles: Humor, Shock, Curiosity, "Don't buy this unless...", "My secret weapon", etc.
- **VARY** the sentence structure and vocabulary.
- Make it sound like a REAL person talking to a friend, not a robot reading a script.

NEGATIVE CONSTRAINTS (CRITICAL):
- DO NOT describe visual UI elements (buttons, icons, text bubbles, subtitles, shopping carts).
- DO NOT say "pointing to the cart" or "pointing to link". Instead, say "pointing to the bottom left corner".
- DO NOT describe any overlay text in the scene. The video must be CLEAN.

OUTPUT FORMAT (STRICTLY FOLLOW THIS):

ESTILO UGC: [Short description of style, e.g. "Unboxing Rápido", "Provador Real", "Relato Sincero", "Dica de Amiga"]

PARTE 1 - GANCHO:
FALA EM PT-BR: [Hook speech. Natural, fast. Max 20 words. MUST BE CATCHY.]

PARTE 2 - CTA:
FALA EM PT-BR: [Closing speech with urgency. Max 20 words. STRONG CTA.]

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
The video is only 10 seconds long. Be direct.
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
    const angles = [
        "Shock/Disbelief ('I can't believe I found this')",
        "Secret/Gatekeeping ('I wasn't going to share this...')",
        "Problem/Solution ('Stop struggling with...')",
        "Direct Benefit ('This changed my routine')",
        "Curiosity ('You need to see this result')",
        "Urgency/FOMO ('Before it sells out again')"
    ];
    const randomAngle = angles[Math.floor(Math.random() * angles.length)];

    return `
Product Name: ${productTitle}

Generate a 2-PART UGC script (16s total).
Focus on a "Viral TikTok" vibe. Authentic, handheld, organic.
CREATIVE ANGLE FOR THIS SCRIPT: ${randomAngle}

Part 1 (0-8s): Hook/Problem/Shock based on the angle above.
Part 2 (8-16s): Solution/Benefit/CTA.

VISUAL RULES:
- NEVER mention "cart icon", "button", or "link".
- To indicate CTA, use: "Presenter points to bottom left corner".
- Ensure the scene is 100% clean, no graphics.

Ensure output follows the PARTE 1 / PARTE 2 structure with FALA EM PT-BR.
`;
};

const getModasFemininaPrompt = (productTitle: string) => {
    return `
Product Name: ${productTitle}

Instructions:
1. Analyze the uploaded image to identify the clothing item (dress, blouse, pants, set, etc.).
2. Fill in the "VISUAL" section with specific details from the image (color, cut, fabric). **Ensure the color description is extremely precise and emphasizes maintaining the original color.**
3. Fill in the "ACTIONS" section with movements that make sense for this specific garment.
4. **DIALOGUE GENERATION (EXTREME SALES FOCUS)**:
   - **Objective**: Stop the scroll and sell immediately.
   - **Hook Options (Use variations of these)**: "Para tudo que eu tô em choque", "Esse aqui modela até a alma", "Achei o segredo das blogueiras", "Preço de atacado em peça de shopping", "Gente, surreal esse tecido".
   - **Body**: Mention how it fits perfectly (body shaping) or the premium feel of the fabric (texture/quality).
   - **Close**: Strong CTA + Urgency. "Clica agora", "Garante o seu", "Estoque voando", "O link tá aqui".
   - **Constraint**: Natural, fluid Portuguese. No robotic translations.

Output the FULL formatted text as defined in the System Prompt.
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
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("API Key is missing. Please ensure the API_KEY environment variable is set.");
        }
        const ai = new GoogleGenAI({ apiKey });

        let systemInstruction;
        let prompt;

        // Determine which logic to use
        if (brandName === "Modas Feminina") {
            systemInstruction = MODAS_FEMININA_SYSTEM_PROMPT;
            prompt = getModasFemininaPrompt(productTitle);
        } else if (isVeo3) {
            systemInstruction = VEO_SYSTEM_PROMPT;
            prompt = getVeoPrompt(productTitle);
        } else {
            systemInstruction = SORA_SYSTEM_PROMPT;
            prompt = getSoraPrompt(brandName, brandDisplay, productTitle);
        }

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
                temperature: 0.95, // High temperature for creative, varied copy
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
    
    // Check if this is a Modas Feminina prompt (it has specific headers that Veo3 doesn't)
    if (promptText.includes("DESCRIPTION:") && promptText.includes("AI SAFETY NOTE:")) {
        return null; // Don't parse as Veo3 2-part script
    }

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
        { title: 'CTA', timing: '8-16s', partNum: 2 },
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
            // Scene match
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