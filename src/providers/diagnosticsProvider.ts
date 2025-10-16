// File: src/providers/diagnosticsProvider.ts
import * as vscode from 'vscode';
import { parse } from 'omniscript-parser';

/**
 * Provides real-time diagnostics (error checking) for OSF documents.
 */
export class DiagnosticsProvider {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private disposables: vscode.Disposable[] = [];
    
    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('osf');
        
        // Listen to document changes
        this.disposables.push(
            vscode.workspace.onDidOpenTextDocument(doc => this.updateDiagnostics(doc))
        );
        
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument(event => {
                this.updateDiagnostics(event.document);
            })
        );
        
        this.disposables.push(
            vscode.workspace.onDidCloseTextDocument(doc => {
                this.diagnosticCollection.delete(doc.uri);
            })
        );
        
        // Check all open OSF documents
        vscode.workspace.textDocuments.forEach(doc => {
            if (doc.languageId === 'osf') {
                this.updateDiagnostics(doc);
            }
        });
    }
    
    private updateDiagnostics(document: vscode.TextDocument): void {
        if (document.languageId !== 'osf') {
            return;
        }
        
        const config = vscode.workspace.getConfiguration('osf');
        if (!config.get('linting.enabled', true)) {
            return;
        }
        
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        
        try {
            // Try to parse the document
            parse(text);
            
            // If parsing succeeds, perform additional checks
            this.checkBlockStructure(document, diagnostics);
            this.checkPropertySyntax(document, diagnostics);
            
        } catch (error: any) {
            // Parsing failed, create diagnostic from error
            const diagnostic = this.createDiagnosticFromError(document, error);
            if (diagnostic) {
                diagnostics.push(diagnostic);
            }
        }
        
        this.diagnosticCollection.set(document.uri, diagnostics);
    }
    
    private createDiagnosticFromError(
        document: vscode.TextDocument,
        error: any
    ): vscode.Diagnostic | null {
        
        // Try to extract line number from error message
        const lineMatch = error.message?.match(/line (\d+)/i);
        const line = lineMatch ? parseInt(lineMatch[1], 10) - 1 : 0;
        
        const range = new vscode.Range(
            new vscode.Position(line, 0),
            new vscode.Position(line, document.lineAt(Math.min(line, document.lineCount - 1)).text.length)
        );
        
        const diagnostic = new vscode.Diagnostic(
            range,
            error.message || 'Parse error',
            vscode.DiagnosticSeverity.Error
        );
        
        diagnostic.source = 'osf';
        return diagnostic;
    }
    
    private checkBlockStructure(document: vscode.TextDocument, diagnostics: vscode.Diagnostic[]): void {
        const text = document.getText();
        const lines = text.split('\n');
        
        let braceStack: number[] = [];
        let inString = false;
        let inComment = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Check for unclosed blocks
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                const nextChar = line[j + 1];
                
                // Handle comments
                if (char === '/' && nextChar === '/') {
                    break; // Rest of line is comment
                }
                if (char === '/' && nextChar === '*') {
                    inComment = true;
                    j++;
                    continue;
                }
                if (inComment && char === '*' && nextChar === '/') {
                    inComment = false;
                    j++;
                    continue;
                }
                if (inComment) continue;
                
                // Handle strings
                if (char === '"' && (j === 0 || line[j - 1] !== '\\')) {
                    inString = !inString;
                    continue;
                }
                if (inString) continue;
                
                // Track braces
                if (char === '{') {
                    braceStack.push(i);
                } else if (char === '}') {
                    if (braceStack.length === 0) {
                        // Unmatched closing brace
                        diagnostics.push(new vscode.Diagnostic(
                            new vscode.Range(i, j, i, j + 1),
                            'Unmatched closing brace',
                            vscode.DiagnosticSeverity.Error
                        ));
                    } else {
                        braceStack.pop();
                    }
                }
            }
        }
        
        // Check for unclosed braces
        if (braceStack.length > 0) {
            const line = braceStack[braceStack.length - 1];
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(line, 0, line, document.lineAt(line).text.length),
                'Unclosed block - missing closing brace',
                vscode.DiagnosticSeverity.Error
            ));
        }
    }
    
    private checkPropertySyntax(document: vscode.TextDocument, diagnostics: vscode.Diagnostic[]): void {
        const text = document.getText();
        const lines = text.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check for property syntax (key: value;)
            if (line.includes(':') && !line.startsWith('//') && !line.startsWith('#')) {
                // Property should end with semicolon
                if (!line.endsWith(';') && !line.endsWith('{') && line !== '') {
                    const colonIndex = line.indexOf(':');
                    if (colonIndex > 0) {
                        diagnostics.push(new vscode.Diagnostic(
                            new vscode.Range(i, 0, i, line.length),
                            'Property declaration should end with semicolon (;)',
                            vscode.DiagnosticSeverity.Warning
                        ));
                    }
                }
            }
        }
    }
    
    dispose(): void {
        this.diagnosticCollection.dispose();
        this.disposables.forEach(d => d.dispose());
    }
}
