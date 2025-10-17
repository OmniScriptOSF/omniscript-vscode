# Changelog

All notable changes to the OmniScript Format VSCode extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-10-17

### Added
- Support for OmniScript Format v1.2 features
- @table block syntax highlighting and auto-completion
- @include directive syntax highlighting and auto-completion
- Table property completions (caption, style, alignment)
- Include path auto-completion
- Enhanced security validation for includes

### Changed
- Updated parser dependency to omniscript-parser@^1.2.0
- Improved error messages for table validation
- Enhanced diagnostics for include path validation

### Fixed
- Path traversal detection in @include directives
- Table column count validation
- Alignment value validation

## [0.1.0] - 2025-10-15

### Added
- Initial release of OmniScript Format VSCode extension
- Syntax highlighting for `.osf` files with TextMate grammar
- Auto-completion for:
  - Block types (@meta, @doc, @slide, @sheet, @chart, @diagram, @code)
  - Property names (title, author, layout, theme, etc.)
  - Property values (themes, layouts, chart types, etc.)
- Hover documentation for blocks and properties
- Real-time diagnostics and error checking
- Document formatting support
- Code snippets for common patterns (15+ snippets)
- Commands:
  - `OSF: Parse Document` - Parse and display AST
  - `OSF: Open Preview` - Live HTML preview with auto-refresh
  - `OSF: Export to PDF` - Export to PDF format
  - `OSF: Export to DOCX` - Export to Word document
  - `OSF: Export to PPTX` - Export to PowerPoint presentation
  - `OSF: Export to XLSX` - Export to Excel spreadsheet
- Configuration options:
  - Enable/disable linting
  - Choose preview theme
  - Enable/disable auto-refresh
  - Enable/disable completion
- Language features:
  - Auto-closing pairs for braces, brackets, quotes
  - Code folding for blocks
  - Smart indentation
  - Comment toggling (// and /* */)

### Known Issues
- Export commands require `omniscript-converters` package to be installed globally
- Preview is basic HTML rendering (full theme support coming in future release)
- Spreadsheet preview not yet fully implemented
- Chart and diagram blocks parsing only (rendering in preview coming soon)

### Future Enhancements
- Language Server Protocol (LSP) implementation for better performance
- Full theme support in preview
- Interactive chart/diagram preview
- Real-time collaboration hints
- Snippet customization
- Custom theme creation tool
