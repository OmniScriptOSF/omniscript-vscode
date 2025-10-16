# OmniScript Format - VSCode Extension

**Syntax highlighting, IntelliSense, and live preview for OmniScript Format (OSF) files.**

Transform plain-text `.osf` files into professional documents, presentations, and spreadsheets with full IDE support in Visual Studio Code.

---

## 🚀 Features

### Syntax Highlighting
Beautiful syntax highlighting for all OSF elements:
- **Block types**: `@meta`, `@doc`, `@slide`, `@sheet`, `@table` (NEW), `@include` (NEW)
- **Properties**: `title`, `author`, `theme`, `layout`, `caption`, `style`, `alignment`
- **Markdown formatting**: headings, bold, italic, code, lists
- **Table syntax**: Markdown pipe syntax `| A | B |`
- **Formulas**: Excel-style spreadsheet formulas
- **Comments**: Line (`//`) and block (`/* */`) comments

### IntelliSense & Auto-Completion
Smart auto-completion as you type:
- **Block suggestions** when typing `@`
- **Property names** inside blocks
- **Property values** for enums (themes, layouts, chart types)
- **Contextual suggestions** based on block type

### Real-Time Diagnostics
Instant error detection and validation:
- Syntax errors highlighted in red
- Missing semicolons and braces
- Unmatched braces
- Invalid property names
- Parse errors with line numbers

### Live Preview
See your document rendered in real-time:
- **HTML preview** with auto-refresh
- **Theme support** - choose from 10 professional themes
- **Side-by-side editing** - write and preview simultaneously
- **Instant updates** as you type

### Code Snippets
20+ built-in snippets for rapid development:
- `meta` - Create metadata block
- `doc` - Create document block
- `slide-content` - Create slide with content
- `sheet` - Create spreadsheet block
- `chart-bar` - Create bar chart
- `diagram-flowchart` - Create flowchart
- And many more...

### Export Commands
Export to multiple formats with one click:
- **PDF** - Print-ready documents
- **DOCX** - Microsoft Word format
- **PPTX** - PowerPoint presentations
- **XLSX** - Excel spreadsheets

---

## 📦 Installation

### From VSCode Marketplace
1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "OmniScript Format"
4. Click Install

### From VSIX File
```bash
code --install-extension omniscript-vscode-0.1.0.vsix
```

---

## 🎬 Quick Start

1. **Create a new file** with `.osf` extension
2. **Type `@meta`** and press Tab to insert a metadata block snippet
3. **Add content blocks** using `@doc`, `@slide`, or `@sheet`
4. **Open preview** with `Ctrl+Shift+P` → "OSF: Open Preview"
5. **Export** using `Ctrl+Shift+P` → "OSF: Export to PDF"

### Example OSF Document
```osf
@meta {
  title: "My First Document";
  author: "John Doe";
  theme: corporate;
}

@doc {
  # Welcome to OmniScript
  
  This is a **simple** example document.
  
  - Feature 1
  - Feature 2
  - Feature 3
}

@slide {
  title: "Introduction";
  layout: TitleAndContent;
  
  ## Key Points
  - Easy to write
  - Git-friendly
  - Multi-format export
}
```

---

## ⚙️ Configuration

Access settings via `File > Preferences > Settings` and search for "OSF":

| Setting | Description | Default |
|---------|-------------|---------|
| `osf.linting.enabled` | Enable real-time error checking | `true` |
| `osf.preview.theme` | Theme for preview and exports | `default` |
| `osf.preview.autoRefresh` | Auto-refresh preview on changes | `true` |
| `osf.completion.enabled` | Enable auto-completion | `true` |

### Available Themes
- `default` - Clean and simple
- `minimal` - Ultra-minimal design
- `corporate` - Professional business theme
- `academic` - Academic paper style
- `creative` - Bold and colorful
- `technical` - Technical documentation style
- `retro` - Vintage typewriter look
- `modern` - Contemporary design
- `elegant` - Refined typography
- `bold` - High-contrast and impactful

---

## 🎯 Commands

Access via Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

| Command | Description | Keybinding |
|---------|-------------|------------|
| `OSF: Parse Document` | Parse and display AST | - |
| `OSF: Open Preview` | Open live HTML preview | - |
| `OSF: Export to PDF` | Export to PDF format | - |
| `OSF: Export to DOCX` | Export to Word document | - |
| `OSF: Export to PPTX` | Export to PowerPoint | - |
| `OSF: Export to XLSX` | Export to Excel spreadsheet | - |

---

## 📚 Documentation

- **Official Website**: https://omniscriptosf.github.io
- **Specification**: [OSF Spec v0.5](https://github.com/OmniScriptOSF/omniscript-core/blob/main/spec/v0.5/osf-spec.md)
- **Examples**: [Example Library](https://github.com/OmniScriptOSF/omniscript-examples)
- **GitHub**: [omniscript-vscode](https://github.com/OmniScriptOSF/omniscript-vscode)

---

## 🔧 Requirements

- **VSCode**: Version 1.80.0 or higher
- **Node.js**: Version 22+ (for export features)
- **omniscript-cli v1.2.1+** (recommended): For full v1.2 features
  ```bash
  npm install -g omniscript-cli@1.2.1
  ```
- **omniscript-converters v1.2.0+** (optional): For export functionality
  ```bash
  npm install -g omniscript-converters@1.2.0
  ```

## 🆕 v1.2 Features

The extension now supports:
- ✅ **@table blocks** - Markdown-style tables with captions, styles, alignment
- ✅ **@include directives** - Modular document composition
- ✅ **Enhanced security** - Grade A+ validation and protection
- ✅ **Better diagnostics** - More helpful error messages

---

## 🐛 Known Issues

- Export commands require `omniscript-converters` package
- Preview is basic HTML (full theme rendering coming soon)
- Spreadsheet preview not fully implemented yet
- Chart/diagram blocks parse but don't render in preview yet

See [CHANGELOG.md](CHANGELOG.md) for details on upcoming features.

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](https://github.com/OmniScriptOSF/omniscript-vscode/blob/main/CONTRIBUTING.md) for guidelines.

### Development Setup
```bash
# Clone repository
git clone https://github.com/OmniScriptOSF/omniscript-vscode.git
cd omniscript-vscode

# Install dependencies
npm install

# Open in VSCode
code .

# Press F5 to launch Extension Development Host
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🌟 Support

- **Issues**: [GitHub Issues](https://github.com/OmniScriptOSF/omniscript-vscode/issues)
- **Discussions**: [GitHub Discussions](https://github.com/OmniScriptOSF/omniscript-core/discussions)
- **Email**: alpha912@github.com

---

**Enjoy writing with OmniScript Format! 🎉**
