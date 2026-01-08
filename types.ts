export interface ProductImage {
    id: string;
    file: File;
    preview: string;
}

export interface Brand {
    id: string;
    name: string;
    display: string;
    icon: string;
    model: string;
    duration: string;
    hook: string;
    description: string;
}

export interface ScriptPart {
    title: string;
    timing: string;
    scene: string;
    speech: string;
}

export interface ParsedScript {
    intro: string;
    parts: ScriptPart[];
}