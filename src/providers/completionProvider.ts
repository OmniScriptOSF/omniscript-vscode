// File: src/providers/completionProvider.ts
import * as vscode from 'vscode';

/**
 * Provides auto-completion suggestions for OSF blocks, properties, and values.
 */
export class CompletionProvider implements vscode.CompletionItemProvider {
    
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        
        // Block completions (triggered by @)
        if (linePrefix.endsWith('@') || context.triggerCharacter === '@') {
            return this.getBlockCompletions();
        }
        
        // Property completions (check if we're inside a block)
        if (this.isInsideBlock(document, position)) {
            // Check if we're typing a property name
            const wordRange = document.getWordRangeAtPosition(position);
            const word = wordRange ? document.getText(wordRange) : '';
            
            if (linePrefix.includes(':')) {
                // We're after a colon, provide value completions
                return this.getValueCompletions(linePrefix);
            } else {
                // Provide property name completions
                return this.getPropertyCompletions(document, position);
            }
        }
        
        return [];
    }
    
    private getBlockCompletions(): vscode.CompletionItem[] {
        const blocks = [
            { name: 'meta', description: 'Document metadata block' },
            { name: 'doc', description: 'Document content block with markdown' },
            { name: 'slide', description: 'Presentation slide block' },
            { name: 'sheet', description: 'Spreadsheet data block' },
            { name: 'chart', description: 'Chart/graph visualization block' },
            { name: 'diagram', description: 'Diagram block (flowchart, sequence, etc.)' },
            { name: 'code', description: 'Code block with syntax highlighting' }
        ];
        
        return blocks.map(block => {
            const item = new vscode.CompletionItem(block.name, vscode.CompletionItemKind.Class);
            item.detail = block.description;
            item.insertText = new vscode.SnippetString(`${block.name} {\n\t$0\n}`);
            item.documentation = new vscode.MarkdownString(`Create a \`@${block.name}\` block`);
            return item;
        });
    }
    
    private getPropertyCompletions(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] {
        const blockType = this.getCurrentBlockType(document, position);
        
        const commonProperties = [
            { name: 'title', type: 'string', description: 'Block title' },
            { name: 'theme', type: 'string', description: 'Visual theme' }
        ];
        
        const metaProperties = [
            { name: 'author', type: 'string', description: 'Document author' },
            { name: 'date', type: 'string', description: 'Document date' },
            { name: 'version', type: 'string', description: 'Document version' }
        ];
        
        const slideProperties = [
            { name: 'layout', type: 'enum', description: 'Slide layout type' }
        ];
        
        const sheetProperties = [
            { name: 'name', type: 'string', description: 'Sheet name' },
            { name: 'cols', type: 'array', description: 'Column definitions' }
        ];
        
        const chartProperties = [
            { name: 'type', type: 'enum', description: 'Chart type (bar, line, pie, etc.)' },
            { name: 'data', type: 'array', description: 'Chart data series' },
            { name: 'options', type: 'object', description: 'Chart options' },
            { name: 'xAxis', type: 'string', description: 'X-axis label' },
            { name: 'yAxis', type: 'string', description: 'Y-axis label' },
            { name: 'legend', type: 'boolean', description: 'Show legend' }
        ];
        
        const diagramProperties = [
            { name: 'type', type: 'enum', description: 'Diagram type (flowchart, sequence, etc.)' },
            { name: 'engine', type: 'enum', description: 'Rendering engine (mermaid, graphviz)' },
            { name: 'code', type: 'string', description: 'Diagram definition code' }
        ];
        
        const codeProperties = [
            { name: 'language', type: 'string', description: 'Programming language' },
            { name: 'caption', type: 'string', description: 'Code block caption' },
            { name: 'lineNumbers', type: 'boolean', description: 'Show line numbers' },
            { name: 'highlight', type: 'array', description: 'Lines to highlight' },
            { name: 'code', type: 'string', description: 'Code content' }
        ];
        
        let properties = commonProperties;
        
        switch (blockType) {
            case 'meta':
                properties = [...commonProperties, ...metaProperties];
                break;
            case 'slide':
                properties = [...commonProperties, ...slideProperties];
                break;
            case 'sheet':
                properties = [...commonProperties, ...sheetProperties];
                break;
            case 'chart':
                properties = [...commonProperties, ...chartProperties];
                break;
            case 'diagram':
                properties = [...commonProperties, ...diagramProperties];
                break;
            case 'code':
                properties = [...commonProperties, ...codeProperties];
                break;
        }
        
        return properties.map(prop => {
            const item = new vscode.CompletionItem(prop.name, vscode.CompletionItemKind.Property);
            item.detail = `(${prop.type}) ${prop.description}`;
            item.insertText = new vscode.SnippetString(`${prop.name}: $0;`);
            return item;
        });
    }
    
    private getValueCompletions(linePrefix: string): vscode.CompletionItem[] {
        // Detect property name before colon
        const propertyMatch = linePrefix.match(/(\w+)\s*:\s*$/);
        if (!propertyMatch) return [];
        
        const propertyName = propertyMatch[1];
        
        // Theme values
        if (propertyName === 'theme') {
            const themes = ['default', 'minimal', 'corporate', 'academic', 'creative', 
                          'technical', 'retro', 'modern', 'elegant', 'bold'];
            return themes.map(theme => {
                const item = new vscode.CompletionItem(theme, vscode.CompletionItemKind.EnumMember);
                item.insertText = theme;
                return item;
            });
        }
        
        // Layout values
        if (propertyName === 'layout') {
            const layouts = ['TitleOnly', 'TitleAndContent', 'TwoColumn', 'ThreeColumn'];
            return layouts.map(layout => {
                const item = new vscode.CompletionItem(layout, vscode.CompletionItemKind.EnumMember);
                item.insertText = layout;
                return item;
            });
        }
        
        // Chart type values
        if (propertyName === 'type') {
            const types = ['bar', 'line', 'pie', 'scatter', 'area'];
            return types.map(type => {
                const item = new vscode.CompletionItem(type, vscode.CompletionItemKind.EnumMember);
                item.insertText = `"${type}"`;
                return item;
            });
        }
        
        // Diagram engine values
        if (propertyName === 'engine') {
            const engines = ['mermaid', 'graphviz'];
            return engines.map(engine => {
                const item = new vscode.CompletionItem(engine, vscode.CompletionItemKind.EnumMember);
                item.insertText = `"${engine}"`;
                return item;
            });
        }
        
        // Boolean values
        if (propertyName === 'legend' || propertyName === 'lineNumbers') {
            return ['true', 'false'].map(value => {
                const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.EnumMember);
                item.insertText = value;
                return item;
            });
        }
        
        return [];
    }
    
    private isInsideBlock(document: vscode.TextDocument, position: vscode.Position): boolean {
        let openBraces = 0;
        let foundBlock = false;
        
        for (let i = position.line; i >= 0; i--) {
            const line = document.lineAt(i).text;
            
            if (line.match(/@(meta|doc|slide|sheet|chart|diagram|code)\s*\{/)) {
                foundBlock = true;
            }
            
            openBraces += (line.match(/\{/g) || []).length;
            openBraces -= (line.match(/\}/g) || []).length;
            
            if (openBraces < 0) break;
        }
        
        return foundBlock && openBraces > 0;
    }
    
    private getCurrentBlockType(document: vscode.TextDocument, position: vscode.Position): string | null {
        for (let i = position.line; i >= 0; i--) {
            const line = document.lineAt(i).text;
            const blockMatch = line.match(/@(meta|doc|slide|sheet|chart|diagram|code)\s*\{/);
            if (blockMatch) {
                return blockMatch[1];
            }
            
            // Stop if we hit a closing brace
            if (line.match(/^\s*\}/)) break;
        }
        return null;
    }
}
