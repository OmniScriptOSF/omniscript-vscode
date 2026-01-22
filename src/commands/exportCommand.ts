// File: src/commands/exportCommand.ts
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Command to export OSF document to various formats.
 * Note: This requires omniscript-converters to be available.
 */
export async function exportCommand(format: 'pdf' | 'docx' | 'pptx' | 'xlsx'): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    
    if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
    }
    
    if (editor.document.languageId !== 'osf') {
        vscode.window.showErrorMessage('Current file is not an OSF document');
        return;
    }
    
    // Get save location
    const currentFilePath = editor.document.uri.fsPath;
    const currentFileName = path.basename(currentFilePath, '.osf');
    const currentDir = path.dirname(currentFilePath);
    const defaultFileName = `${currentFileName}.${format}`;
    
    const saveUri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file(path.join(currentDir, defaultFileName)),
        filters: {
            [format.toUpperCase()]: [format]
        }
    });
    
    if (!saveUri) {
        return; // User cancelled
    }
    
    // Show progress
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Exporting to ${format.toUpperCase()}...`,
        cancellable: false
    }, async (progress) => {
        try {
            // Save document first if modified
            if (editor.document.isDirty) {
                await editor.document.save();
            }
            
            // Import parser and converters
            const { parse } = await import('omniscript-parser');
            const text = editor.document.getText();
            const document = parse(text);
            
            // Get theme from config
            const config = vscode.workspace.getConfiguration('osf');
            const theme = config.get('preview.theme', 'default');
            
            let result: Buffer | null = null;
            
            // Import appropriate converter
            switch (format) {
                case 'pdf': {
                    const { PDFConverter: pdfConverterClass } = await import('omniscript-converters');
                    const pdfConverter = new pdfConverterClass();
                    const output = await pdfConverter.convert(document, { theme });
                    result = output.buffer;
                    break;
                }
                case 'docx': {
                    const { DOCXConverter: docxConverterClass } = await import('omniscript-converters');
                    const docxConverter = new docxConverterClass();
                    const output = await docxConverter.convert(document, { theme });
                    result = output.buffer;
                    break;
                }
                case 'pptx': {
                    const { PPTXConverter: pptxConverterClass } = await import('omniscript-converters');
                    const pptxConverter = new pptxConverterClass();
                    const output = await pptxConverter.convert(document, { theme });
                    result = output.buffer;
                    break;
                }
                case 'xlsx': {
                    const { XLSXConverter: xlsxConverterClass } = await import('omniscript-converters');
                    const xlsxConverter = new xlsxConverterClass();
                    const output = await xlsxConverter.convert(document, { theme });
                    result = output.buffer;
                    break;
                }
            }
            
            if (result) {
                // Write file
                fs.writeFileSync(saveUri.fsPath, result);
                
                const openFile = await vscode.window.showInformationMessage(
                    `✓ Exported to ${format.toUpperCase()} successfully`,
                    'Open File',
                    'Show in Folder'
                );
                
                if (openFile === 'Open File') {
                    await vscode.env.openExternal(saveUri);
                } else if (openFile === 'Show in Folder') {
                    await vscode.commands.executeCommand('revealFileInOS', saveUri);
                }
            }
            
        } catch (error: any) {
            if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('omniscript-converters')) {
                vscode.window.showErrorMessage(
                    'Export requires omniscript-converters package. Install it with: npm install -g omniscript-converters'
                );
            } else {
                vscode.window.showErrorMessage(`Export failed: ${error.message}`);
            }
        }
    });
}
