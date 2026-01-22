// File: src/providers/hoverProvider.ts
import * as vscode from 'vscode';

/**
 * Provides hover tooltips with documentation for OSF syntax elements.
 */
export class HoverProvider implements vscode.HoverProvider {
    
    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        
        const wordRange = document.getWordRangeAtPosition(position, /@?\w+/);
        if (!wordRange) {
            return null;
        }
        
        const word = document.getText(wordRange);
        
        // Block documentation
        const blockDocs = this.getBlockDocumentation(word);
        if (blockDocs) {
            return new vscode.Hover(blockDocs);
        }
        
        // Property documentation
        const propertyDocs = this.getPropertyDocumentation(word, document, position);
        if (propertyDocs) {
            return new vscode.Hover(propertyDocs);
        }
        
        return null;
    }
    
    private getBlockDocumentation(word: string): vscode.MarkdownString | null {
        /* eslint-disable @typescript-eslint/naming-convention */
        const docs: { [key: string]: string } = {
            '@meta': `
**@meta Block**

Contains document-level metadata and configuration.

**Properties:**
- \`title\`: Document title
- \`author\`: Document author
- \`date\`: Creation/modification date
- \`version\`: Document version
- \`theme\`: Visual theme name

**Example:**
\`\`\`osf
@meta {
  title: "My Document";
  author: "John Doe";
  theme: corporate;
}
\`\`\`
            `,
            '@doc': `
**@doc Block**

Contains document content with markdown formatting.

**Features:**
- Markdown syntax (headings, lists, bold, italic)
- Code blocks with syntax highlighting
- Tables and images
- Links and citations

**Example:**
\`\`\`osf
@doc {
  # Introduction
  
  This is **bold** and this is *italic*.
  
  - Bullet point 1
  - Bullet point 2
}
\`\`\`
            `,
            '@slide': `
**@slide Block**

Creates a presentation slide.

**Properties:**
- \`title\`: Slide title
- \`layout\`: Layout type (TitleOnly, TitleAndContent, TwoColumn, ThreeColumn)

**Example:**
\`\`\`osf
@slide {
  title: "Introduction";
  layout: TitleAndContent;
  
  - Key point 1
  - Key point 2
}
\`\`\`
            `,
            '@sheet': `
**@sheet Block**

Creates a spreadsheet with data and formulas.

**Properties:**
- \`name\`: Sheet name
- \`cols\`: Column definitions

**Features:**
- Cell references (A1, B2, etc.)
- Formulas (=SUM(A1:A10))
- Data types (strings, numbers, booleans)

**Example:**
\`\`\`osf
@sheet {
  name: "Budget";
  cols: [Item, Cost, Quantity, Total];
  
  A2 = "Product A";
  B2 = 100;
  C2 = 5;
  D2 = =B2*C2;
}
\`\`\`
            `,
            '@chart': `
**@chart Block** (v1.0)

Creates data visualizations and charts.

**Properties:**
- \`type\`: Chart type (bar, line, pie, scatter, area)
- \`title\`: Chart title
- \`data\`: Data series array
- \`options\`: Chart configuration

**Example:**
\`\`\`osf
@chart {
  type: "bar";
  title: "Sales by Quarter";
  data: [
    { label: "Q1"; values: [100, 150, 200]; }
  ];
}
\`\`\`
            `,
            '@diagram': `
**@diagram Block** (v1.0)

Creates diagrams using Mermaid or Graphviz syntax.

**Properties:**
- \`type\`: Diagram type (flowchart, sequence, gantt, mindmap)
- \`engine\`: Rendering engine (mermaid, graphviz)
- \`code\`: Diagram definition code

**Example:**
\`\`\`osf
@diagram {
  type: "flowchart";
  engine: "mermaid";
  code: "
    graph TD
      A[Start] --> B[Process]
      B --> C[End]
  ";
}
\`\`\`
            `,
            '@code': `
**@code Block** (v1.0)

Displays code with syntax highlighting.

**Properties:**
- \`language\`: Programming language
- \`caption\`: Optional caption
- \`lineNumbers\`: Show line numbers (boolean)
- \`highlight\`: Array of line numbers to highlight
- \`code\`: Code content

**Example:**
\`\`\`osf
@code {
  language: "typescript";
  caption: "Hello World";
  lineNumbers: true;
  code: "
    function hello() {
      console.log('Hello, World!');
    }
  ";
}
\`\`\`
            `
        };
        /* eslint-enable @typescript-eslint/naming-convention */
        
        const doc = docs[word];
        if (doc) {
            const md = new vscode.MarkdownString(doc.trim());
            md.isTrusted = true;
            return md;
        }
        
        return null;
    }
    
    private getPropertyDocumentation(
        word: string,
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.MarkdownString | null {
        
        const propertyDocs: { [key: string]: string } = {
            'title': 'Document or block title (string)',
            'author': 'Document author name (string)',
            'date': 'Document date (string)',
            'version': 'Document version (string)',
            'theme': 'Visual theme: default, minimal, corporate, academic, creative, technical, retro, modern, elegant, bold',
            'layout': 'Slide layout: TitleOnly, TitleAndContent, TwoColumn, ThreeColumn',
            'name': 'Sheet or element name (string)',
            'cols': 'Column definitions (array)',
            'type': 'Chart or diagram type (enum)',
            'data': 'Chart data series (array)',
            'options': 'Configuration options (object)',
            'xAxis': 'X-axis label (string)',
            'yAxis': 'Y-axis label (string)',
            'legend': 'Show legend (boolean)',
            'engine': 'Rendering engine: mermaid, graphviz',
            'code': 'Code or diagram definition (string)',
            'language': 'Programming language (string)',
            'caption': 'Optional caption (string)',
            'lineNumbers': 'Show line numbers (boolean)',
            'highlight': 'Lines to highlight (array of numbers)'
        };
        
        const doc = propertyDocs[word];
        if (doc) {
            return new vscode.MarkdownString(`**${word}:** ${doc}`);
        }
        
        return null;
    }
}
