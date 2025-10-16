// File: src/commands/previewCommand.ts
import * as vscode from 'vscode';
import { parse } from 'omniscript-parser';

/**
 * Command to open a live preview of the OSF document.
 */
export async function previewCommand(context: vscode.ExtensionContext): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    
    if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
    }
    
    if (editor.document.languageId !== 'osf') {
        vscode.window.showErrorMessage('Current file is not an OSF document');
        return;
    }
    
    // Create or show preview panel
    const panel = vscode.window.createWebviewPanel(
        'osfPreview',
        `Preview: ${editor.document.fileName.split('/').pop()}`,
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [context.extensionUri]
        }
    );
    
    // Function to update preview
    const updatePreview = async () => {
        const text = editor.document.getText();
        const config = vscode.workspace.getConfiguration('osf');
        const theme = config.get('preview.theme', 'default');
        
        try {
            const document = parse(text);
            const html = generateHTML(document, theme);
            panel.webview.html = html;
        } catch (error: any) {
            panel.webview.html = generateErrorHTML(error.message);
        }
    };
    
    // Initial preview
    updatePreview();
    
    // Auto-refresh on document change
    const changeDisposable = vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document === editor.document) {
            const config = vscode.workspace.getConfiguration('osf');
            if (config.get('preview.autoRefresh', true)) {
                updatePreview();
            }
        }
    });
    
    // Clean up when panel is closed
    panel.onDidDispose(() => {
        changeDisposable.dispose();
    });
    
    // Add refresh button
    panel.webview.onDidReceiveMessage(
        message => {
            if (message.command === 'refresh') {
                updatePreview();
            }
        },
        undefined,
        context.subscriptions
    );
}

/**
 * Generate HTML preview from parsed OSF document.
 */
function generateHTML(document: any, theme: string): string {
    const metadata = document.metadata || {};
    const blocks = document.blocks || [];
    
    let content = '';
    
    // Generate content for each block
    for (const block of blocks) {
        switch (block.type) {
            case 'doc':
                content += generateDocHTML(block);
                break;
            case 'slide':
                content += generateSlideHTML(block);
                break;
            case 'sheet':
                content += generateSheetHTML(block);
                break;
            default:
                content += `<div class="block block-${block.type}">Block type: ${block.type}</div>`;
        }
    }
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metadata.title || 'OSF Preview'}</title>
    <style>
        ${getThemeCSS(theme)}
    </style>
</head>
<body>
    <div class="header">
        <h1>${metadata.title || 'Untitled Document'}</h1>
        ${metadata.author ? `<p class="author">By ${metadata.author}</p>` : ''}
        ${metadata.date ? `<p class="date">${metadata.date}</p>` : ''}
    </div>
    <div class="content">
        ${content}
    </div>
    <div class="footer">
        <button onclick="refresh()">↻ Refresh</button>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        function refresh() {
            vscode.postMessage({ command: 'refresh' });
        }
    </script>
</body>
</html>
    `;
}

function generateDocHTML(block: any): string {
    let html = '<div class="block block-doc">';
    
    if (block.content) {
        // Convert markdown-like content to HTML
        html += convertMarkdownToHTML(block.content);
    }
    
    html += '</div>';
    return html;
}

function generateSlideHTML(block: any): string {
    const title = block.properties?.title || 'Untitled Slide';
    const layout = block.properties?.layout || 'TitleAndContent';
    
    let html = `<div class="block block-slide layout-${layout}">`;
    html += `<h2 class="slide-title">${title}</h2>`;
    
    if (block.content) {
        html += `<div class="slide-content">${convertMarkdownToHTML(block.content)}</div>`;
    }
    
    html += '</div>';
    return html;
}

function generateSheetHTML(block: any): string {
    const name = block.properties?.name || 'Sheet';
    const cols = block.properties?.cols || [];
    
    let html = `<div class="block block-sheet">`;
    html += `<h3 class="sheet-name">${name}</h3>`;
    html += '<table class="sheet-table">';
    
    // Header row
    if (cols.length > 0) {
        html += '<thead><tr>';
        cols.forEach((col: string) => {
            html += `<th>${col}</th>`;
        });
        html += '</tr></thead>';
    }
    
    // Data rows (simplified - actual implementation would parse cell data)
    html += '<tbody>';
    html += '<tr><td colspan="' + cols.length + '">Data preview not yet implemented</td></tr>';
    html += '</tbody>';
    
    html += '</table>';
    html += '</div>';
    return html;
}

function convertMarkdownToHTML(text: string): string {
    let html = text;
    
    // Headings
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Code
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');
    
    // Lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Paragraphs
    html = html.split('\n\n').map(para => 
        para.trim() && !para.startsWith('<') ? `<p>${para}</p>` : para
    ).join('\n');
    
    return html;
}

function generateErrorHTML(errorMessage: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parse Error</title>
    <style>
        body { font-family: sans-serif; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
        .error { background: #5a1d1d; border-left: 4px solid #f14c4c; padding: 15px; border-radius: 4px; }
        h1 { color: #f14c4c; margin-top: 0; }
        pre { background: #252526; padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="error">
        <h1>Parse Error</h1>
        <pre>${errorMessage}</pre>
    </div>
</body>
</html>
    `;
}

function getThemeCSS(theme: string): string {
    // Base styles + theme-specific styles
    return `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
            padding: 20px;
        }
        .header {
            border-bottom: 2px solid #e1e4e8;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .author, .date { color: #666; font-size: 0.9em; }
        .block { margin: 30px 0; padding: 20px; border-radius: 4px; }
        .block-doc { background: #f8f9fa; }
        .block-slide { background: #e8f4f8; border-left: 4px solid #0366d6; }
        .block-sheet { background: #f0f7f0; }
        .slide-title { color: #0366d6; margin-bottom: 15px; }
        .sheet-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .sheet-table th, .sheet-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .sheet-table th { background: #e8f4e8; font-weight: 600; }
        h1, h2, h3 { margin: 20px 0 10px; }
        p { margin: 10px 0; }
        ul, ol { margin: 10px 0; padding-left: 30px; }
        code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e1e4e8;
            text-align: center;
        }
        button {
            padding: 8px 16px;
            font-size: 14px;
            border: 1px solid #0366d6;
            background: #0366d6;
            color: white;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover { background: #0256c5; }
    `;
}
