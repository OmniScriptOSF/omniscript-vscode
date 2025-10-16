// File: src/providers/formattingProvider.ts
import * as vscode from 'vscode';

/**
 * Provides document formatting capabilities for OSF files.
 */
export class FormattingProvider implements vscode.DocumentFormattingEditProvider {
    
    provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.TextEdit[]> {
        
        const edits: vscode.TextEdit[] = [];
        const text = document.getText();
        const lines = text.split('\n');
        
        let indentLevel = 0;
        const indentChar = options.insertSpaces ? ' '.repeat(options.tabSize) : '\t';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            // Skip empty lines and comments
            if (trimmed === '' || trimmed.startsWith('//')) {
                continue;
            }
            
            // Decrease indent for closing braces
            if (trimmed.startsWith('}')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            // Calculate expected indentation
            const expectedIndent = indentChar.repeat(indentLevel);
            const currentIndent = line.match(/^(\s*)/)?.[1] || '';
            
            // Create edit if indentation doesn't match
            if (currentIndent !== expectedIndent) {
                const range = new vscode.Range(
                    new vscode.Position(i, 0),
                    new vscode.Position(i, currentIndent.length)
                );
                edits.push(vscode.TextEdit.replace(range, expectedIndent));
            }
            
            // Increase indent for opening braces
            if (trimmed.endsWith('{')) {
                indentLevel++;
            }
        }
        
        return edits;
    }
}
