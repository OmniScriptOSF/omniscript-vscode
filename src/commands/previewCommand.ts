// File: src/commands/previewCommand.ts
import * as path from 'path';
import * as vscode from 'vscode';
import {
    parse,
    type ChartBlock,
    type ContentBlock,
    type DiagramBlock,
    type DocBlock,
    type MetaBlock,
    type OSFCodeBlock,
    type OSFDocument,
    type SheetBlock,
    type SlideBlock,
    type TableBlock,
    type TextRun,
    type Link as OSFLink,
    type Image as OSFImage
} from 'omniscript-parser';

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
        const resolveIncludes = config.get('preview.resolveIncludes', true);
        const nonce = getNonce();

        try {
            const parseOptions = resolveIncludes
                ? { resolveIncludes: true, basePath: path.dirname(editor.document.uri.fsPath) }
                : {};
            const document = parse(text, parseOptions);
            const html = generateHTML(document, theme, nonce, panel.webview.cspSource);
            panel.webview.html = html;
        } catch (error: any) {
            panel.webview.html = generateErrorHTML(error?.message || 'Preview failed', nonce, panel.webview.cspSource);
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

function getNonce(): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let nonce = '';
    for (let i = 0; i < 32; i++) {
        nonce += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return nonce;
}

/**
 * Generate HTML preview from parsed OSF document.
 */
function generateHTML(document: OSFDocument, theme: string, nonce: string, cspSource: string): string {
    const metaBlock = document.blocks.find((block): block is MetaBlock => block.type === 'meta');

    let content = '';

    // Generate content for each block
    for (const block of document.blocks) {
        switch (block.type) {
            case 'meta':
                break;
            case 'doc':
                content += generateDocHTML(block as DocBlock);
                break;
            case 'slide':
                content += generateSlideHTML(block as SlideBlock);
                break;
            case 'sheet':
                content += generateSheetHTML(block as SheetBlock);
                break;
            case 'table':
                content += generateTableHTML(block as TableBlock);
                break;
            case 'chart':
                content += generateChartHTML(block as ChartBlock);
                break;
            case 'diagram':
                content += generateDiagramHTML(block as DiagramBlock);
                break;
            case 'osfcode':
                content += generateCodeHTML(block as OSFCodeBlock);
                break;
            default: {
                const fallbackType = (block as { type?: string }).type ?? 'unknown';
                content += `<div class="block block-${escapeHtml(fallbackType)}">Block type: ${escapeHtml(fallbackType)}</div>`;
                break;
            }
        }
    }

    const csp = `default-src 'none'; img-src ${cspSource} https: data:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="${csp}">
    <title>${escapeHtml(metaBlock?.props?.title ? String(metaBlock.props.title) : 'OSF Preview')}</title>
    <style>
        ${getThemeCSS(theme)}
    </style>
</head>
<body>
    <div class="header">
        <h1>${escapeHtml(metaBlock?.props?.title ? String(metaBlock.props.title) : 'Untitled Document')}</h1>
        ${metaBlock?.props?.author ? `<p class="author">By ${escapeHtml(String(metaBlock.props.author))}</p>` : ''}
        ${metaBlock?.props?.date ? `<p class="date">${escapeHtml(String(metaBlock.props.date))}</p>` : ''}
    </div>
    <div class="content">
        ${content}
    </div>
    <div class="footer">
        <button nonce="${nonce}" onclick="refresh()">↻ Refresh</button>
    </div>
    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        function refresh() {
            vscode.postMessage({ command: 'refresh' });
        }
    </script>
</body>
</html>
    `;
}

function generateDocHTML(block: DocBlock): string {
    let html = '<div class="block block-doc">';

    if (block.content) {
        html += convertMarkdownToHTML(block.content);
    }

    html += '</div>';
    return html;
}

function generateSlideHTML(block: SlideBlock): string {
    const title = block.title || 'Untitled Slide';
    const layout = block.layout || 'TitleAndContent';

    let html = `<div class="block block-slide layout-${escapeHtml(layout)}">`;
    html += `<h2 class="slide-title">${escapeHtml(title)}</h2>`;

    if (block.content && block.content.length > 0) {
        html += `<div class="slide-content">${renderSlideContentHTML(block.content)}</div>`;
    } else if (block.bullets && block.bullets.length > 0) {
        html += '<ul class="slide-bullets">';
        html += block.bullets.map(item => `<li>${escapeHtml(item)}</li>`).join('');
        html += '</ul>';
    }

    html += '</div>';
    return html;
}

function generateSheetHTML(block: SheetBlock): string {
    const name = block.name || 'Sheet';
    const cols = block.cols || [];

    let html = `<div class="block block-sheet">`;
    html += `<h3 class="sheet-name">${escapeHtml(name)}</h3>`;
    html += '<table class="sheet-table">';

    if (cols.length > 0) {
        html += '<thead><tr>';
        cols.forEach((col) => {
            html += `<th>${escapeHtml(col)}</th>`;
        });
        html += '</tr></thead>';
    }

    html += '<tbody>';
    if (block.data && Object.keys(block.data).length > 0) {
        const coords = Object.keys(block.data).map(k => k.split(',').map(Number));
        const maxRow = Math.max(...coords.map(c => c[0] || 1));
        const maxCol = Math.max(...coords.map(c => c[1] || 1));

        for (let r = 1; r <= maxRow; r++) {
            html += '<tr>';
            for (let c = 1; c <= maxCol; c++) {
                const value = block.data?.[`${r},${c}`];
                html += `<td>${escapeHtml(value === undefined ? '' : String(value))}</td>`;
            }
            html += '</tr>';
        }
    } else {
        html += '<tr><td class="sheet-empty" colspan="' + Math.max(cols.length, 1) + '">No sheet data</td></tr>';
    }

    html += '</tbody></table>';
    html += '</div>';
    return html;
}

function generateTableHTML(block: TableBlock): string {
    let html = `<div class="block block-table">`;

    if (block.caption) {
        html += `<p class="table-caption">${escapeHtml(block.caption)}</p>`;
    }

    html += `<table class="osf-table ${escapeHtml(block.style || 'bordered')}">`;
    html += '<thead><tr>';
    block.headers.forEach((header, index) => {
        const align = block.alignment?.[index] || 'left';
        html += `<th style="text-align: ${align};">${escapeHtml(header)}</th>`;
    });
    html += '</tr></thead><tbody>';

    block.rows.forEach((row) => {
        html += '<tr>';
        row.cells.forEach((cell, index) => {
            const align = block.alignment?.[index] || 'left';
            html += `<td style="text-align: ${align};">${escapeHtml(cell.text)}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table></div>';
    return html;
}

function generateChartHTML(block: ChartBlock): string {
    let html = `<div class="block block-chart">`;
    html += `<h3 class="chart-title">${escapeHtml(block.title)}</h3>`;
    html += `<p class="chart-meta">Chart type: ${escapeHtml(block.chartType)}</p>`;
    html += `<p class="chart-meta">Series: ${block.data.length}</p>`;
    html += '</div>';
    return html;
}

function generateDiagramHTML(block: DiagramBlock): string {
    let html = `<div class="block block-diagram">`;
    if (block.title) {
        html += `<h3 class="diagram-title">${escapeHtml(block.title)}</h3>`;
    }
    html += `<pre class="diagram-code">${escapeHtml(block.code)}</pre>`;
    html += '</div>';
    return html;
}

function generateCodeHTML(block: OSFCodeBlock): string {
    let html = `<div class="block block-code">`;
    if (block.caption) {
        html += `<p class="code-caption">${escapeHtml(block.caption)}</p>`;
    }
    html += `<pre><code class="language-${escapeHtml(block.language)}">${escapeHtml(block.code)}</code></pre>`;
    html += '</div>';
    return html;
}

function convertMarkdownToHTML(text: string): string {
    const lines = text.split(/\r?\n/);
    let html = '';
    let paragraph: string[] = [];
    let listItems: string[] = [];
    let blockquoteLines: string[] = [];

    const flushParagraph = () => {
        if (paragraph.length > 0) {
            html += `<p>${renderInlineMarkdown(paragraph.join(' '))}</p>`;
            paragraph = [];
        }
    };

    const flushList = () => {
        if (listItems.length > 0) {
            html += `<ul>${listItems.map(item => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</ul>`;
            listItems = [];
        }
    };

    const flushBlockquote = () => {
        if (blockquoteLines.length > 0) {
            html += `<blockquote>${blockquoteLines.map(line => `<p>${renderInlineMarkdown(line)}</p>`).join('')}</blockquote>`;
            blockquoteLines = [];
        }
    };

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) {
            flushParagraph();
            flushList();
            flushBlockquote();
            continue;
        }

        const headingMatch = /^(#{1,3})\s+(.+)$/.exec(line);
        if (headingMatch) {
            flushParagraph();
            flushList();
            flushBlockquote();
            const level = headingMatch[1].length;
            html += `<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`;
            continue;
        }

        const listMatch = /^[-*]\s+(.+)$/.exec(line);
        if (listMatch) {
            flushParagraph();
            flushBlockquote();
            listItems.push(listMatch[1]);
            continue;
        }

        const quoteMatch = /^>\s?(.+)$/.exec(line);
        if (quoteMatch) {
            flushParagraph();
            flushList();
            blockquoteLines.push(quoteMatch[1]);
            continue;
        }

        if (listItems.length > 0) {
            flushList();
        }
        if (blockquoteLines.length > 0) {
            flushBlockquote();
        }
        paragraph.push(line);
    }

    flushParagraph();
    flushList();
    flushBlockquote();

    return html;
}

function renderSlideContentHTML(contentBlocks: ContentBlock[]): string {
    let html = '';

    for (const block of contentBlocks) {
        if (block.type === 'unordered_list') {
            html += '<ul class="slide-bullets">';
            for (const item of block.items) {
                html += `<li>${renderRuns(item.content)}</li>`;
            }
            html += '</ul>';
        } else if (block.type === 'ordered_list') {
            html += '<ol class="slide-bullets">';
            for (const item of block.items) {
                html += `<li>${renderRuns(item.content)}</li>`;
            }
            html += '</ol>';
        } else if (block.type === 'blockquote') {
            html += '<blockquote>';
            for (const paragraph of block.content) {
                html += `<p>${renderRuns(paragraph.content)}</p>`;
            }
            html += '</blockquote>';
        } else if (block.type === 'paragraph') {
            const rawText = runsToText(block.content).trim();
            const headingMatch = /^(#{1,3})\s+(.+)$/.exec(rawText);
            if (headingMatch) {
                const level = headingMatch[1].length;
                html += `<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`;
            } else {
                html += `<p>${renderRuns(block.content)}</p>`;
            }
        } else if (block.type === 'code') {
            html += `<pre><code>${escapeHtml(block.content)}</code></pre>`;
        } else if (block.type === 'image') {
            html += `<img src="${escapeHtml(block.url)}" alt="${escapeHtml(block.alt)}" />`;
        }
    }

    return html;
}

function renderRuns(runs: TextRun[]): string {
    return runs
        .map((run) => {
            if (typeof run === 'string') {
                return escapeHtml(run);
            }
            if (isLinkRun(run)) {
                const text = escapeHtml(run.text || '');
                const url = escapeHtml(run.url || '#');
                return `<a class="link" href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
            }
            if (isImageRun(run)) {
                const alt = escapeHtml(run.alt || '');
                const url = escapeHtml(run.url || '');
                return `<img src="${url}" alt="${alt}" />`;
            }
            let content = escapeHtml(run.text || '');
            if (run.bold) {
                content = `<strong>${content}</strong>`;
            }
            if (run.italic) {
                content = `<em>${content}</em>`;
            }
            if (run.underline) {
                content = `<span class="underline">${content}</span>`;
            }
            if (run.strike) {
                content = `<span class="strike">${content}</span>`;
            }
            return content;
        })
        .join('');
}

function runsToText(runs: TextRun[]): string {
    return runs
        .map((run) => {
            if (typeof run === 'string') {
                return run;
            }
            if (isLinkRun(run)) {
                return run.text || '';
            }
            if (isImageRun(run)) {
                return run.alt || '';
            }
            return run.text || '';
        })
        .join('');
}

function isLinkRun(run: TextRun): run is OSFLink {
    return typeof run === 'object' && run !== null && 'type' in run && run.type === 'link';
}

function isImageRun(run: TextRun): run is OSFImage {
    return typeof run === 'object' && run !== null && 'type' in run && run.type === 'image';
}

function renderInlineMarkdown(text: string): string {
    let html = escapeHtml(text);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');
    return html;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function generateErrorHTML(errorMessage: string, nonce: string, cspSource: string): string {
    const csp = `default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';`;
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="${csp}">
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
        <pre>${escapeHtml(errorMessage)}</pre>
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
        .block-table { background: #f8f9fa; }
        .block-chart { background: #f6f2ff; }
        .block-diagram { background: #fff7ed; }
        .block-code { background: #f5f5f5; }
        .slide-title { color: #0366d6; margin-bottom: 15px; }
        .sheet-table,
        .osf-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .sheet-table th, .sheet-table td,
        .osf-table th, .osf-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .sheet-table th { background: #e8f4e8; font-weight: 600; }
        .osf-table.striped tbody tr:nth-child(odd) { background: #f3f4f6; }
        .table-caption { font-style: italic; color: #6b7280; margin-bottom: 8px; }
        h1, h2, h3 { margin: 20px 0 10px; }
        p { margin: 10px 0; }
        ul, ol { margin: 10px 0; padding-left: 30px; }
        blockquote {
            border-left: 4px solid #cbd5f5;
            padding-left: 12px;
            margin: 12px 0;
            color: #4b5563;
            background: #f8fafc;
        }
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
