// File: src/commands/parseCommand.ts
import * as vscode from 'vscode';
import { parse } from 'omniscript-parser';

/**
 * Command to parse the current OSF document and display the AST.
 */
export async function parseCommand(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    
    if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
    }
    
    if (editor.document.languageId !== 'osf') {
        vscode.window.showErrorMessage('Current file is not an OSF document');
        return;
    }
    
    const text = editor.document.getText();
    const outputChannel = vscode.window.createOutputChannel('OSF Parse Results');
    
    try {
        const startTime = Date.now();
        const document = parse(text);
        const endTime = Date.now();
        
        outputChannel.clear();
        outputChannel.appendLine('='.repeat(80));
        outputChannel.appendLine('OSF PARSE RESULTS');
        outputChannel.appendLine('='.repeat(80));
        outputChannel.appendLine('');
        outputChannel.appendLine(`✓ Parse successful (${endTime - startTime}ms)`);
        outputChannel.appendLine('');
        outputChannel.appendLine('Document Structure:');
        outputChannel.appendLine('-'.repeat(80));
        outputChannel.appendLine('');
        
        // Display document metadata
        if (document.metadata) {
            outputChannel.appendLine('Metadata:');
            Object.entries(document.metadata).forEach(([key, value]) => {
                outputChannel.appendLine(`  ${key}: ${JSON.stringify(value)}`);
            });
            outputChannel.appendLine('');
        }
        
        // Display block count
        const blockCounts: { [key: string]: number } = {};
        document.blocks.forEach(block => {
            blockCounts[block.type] = (blockCounts[block.type] || 0) + 1;
        });
        
        outputChannel.appendLine('Blocks:');
        Object.entries(blockCounts).forEach(([type, count]) => {
            outputChannel.appendLine(`  ${type}: ${count}`);
        });
        outputChannel.appendLine('');
        
        // Display full AST
        outputChannel.appendLine('Full AST:');
        outputChannel.appendLine('-'.repeat(80));
        outputChannel.appendLine(JSON.stringify(document, null, 2));
        outputChannel.appendLine('');
        outputChannel.appendLine('='.repeat(80));
        
        outputChannel.show();
        
        vscode.window.showInformationMessage(
            `✓ Parse successful - ${document.blocks.length} blocks found`
        );
        
    } catch (error: any) {
        outputChannel.clear();
        outputChannel.appendLine('='.repeat(80));
        outputChannel.appendLine('OSF PARSE ERROR');
        outputChannel.appendLine('='.repeat(80));
        outputChannel.appendLine('');
        outputChannel.appendLine('✗ Parse failed');
        outputChannel.appendLine('');
        outputChannel.appendLine('Error:');
        outputChannel.appendLine('-'.repeat(80));
        outputChannel.appendLine(error.message);
        outputChannel.appendLine('');
        
        if (error.stack) {
            outputChannel.appendLine('Stack trace:');
            outputChannel.appendLine('-'.repeat(80));
            outputChannel.appendLine(error.stack);
        }
        
        outputChannel.appendLine('');
        outputChannel.appendLine('='.repeat(80));
        outputChannel.show();
        
        vscode.window.showErrorMessage(`Parse error: ${error.message}`);
    }
}
