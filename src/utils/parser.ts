// File: src/utils/parser.ts
/**
 * Utility wrapper around omniscript-parser for use in the extension.
 */

import { parse as osfParse } from 'omniscript-parser';

export interface ParseResult {
    success: boolean;
    document?: any;
    error?: {
        message: string;
        line?: number;
        column?: number;
    };
}

/**
 * Safe parse wrapper that catches errors and returns structured result.
 */
export function safeParse(text: string): ParseResult {
    try {
        const document = osfParse(text);
        return {
            success: true,
            document
        };
    } catch (error: any) {
        // Try to extract line/column information from error
        const lineMatch = error.message?.match(/line (\d+)/i);
        const columnMatch = error.message?.match(/column (\d+)/i);
        
        return {
            success: false,
            error: {
                message: error.message || 'Unknown parse error',
                line: lineMatch ? parseInt(lineMatch[1], 10) : undefined,
                column: columnMatch ? parseInt(columnMatch[1], 10) : undefined
            }
        };
    }
}

/**
 * Validate OSF document structure without throwing errors.
 */
export function validate(text: string): string[] {
    const errors: string[] = [];
    
    // Basic validation checks
    if (!text.trim()) {
        errors.push('Document is empty');
        return errors;
    }
    
    // Check for balanced braces
    let braceCount = 0;
    for (const char of text) {
        if (char === '{') {
            braceCount++;
        }
        if (char === '}') {
            braceCount--;
        }
        if (braceCount < 0) {
            errors.push('Unmatched closing brace');
            break;
        }
    }
    if (braceCount > 0) {
        errors.push('Unclosed block - missing closing brace');
    }
    
    // Try parsing
    const result = safeParse(text);
    if (!result.success && result.error) {
        errors.push(result.error.message);
    }
    
    return errors;
}
