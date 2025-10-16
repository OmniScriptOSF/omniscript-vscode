# Contributing to OmniScript VSCode Extension

Thank you for your interest in contributing to the **OmniScript Format (OSF) VSCode Extension**! This extension provides syntax highlighting, IntelliSense, and live preview for OSF files.

---

## 🚀 Getting Started

### 1️⃣ Fork the repository

Click the **Fork** button at the top right of the [omniscript-vscode](https://github.com/OmniScriptOSF/omniscript-vscode) repository page.

### 2️⃣ Clone your fork locally

```bash
git clone https://github.com/your-username/omniscript-vscode.git
cd omniscript-vscode
git checkout -b my-feature-branch
```

### 3️⃣ Install dependencies

```bash
npm install
```

### 4️⃣ Open in VSCode

```bash
code .
```

### 5️⃣ Development

Press **F5** to launch the Extension Development Host with your changes loaded.

### 6️⃣ Make your changes

- Edit extension code in `src/`
- Update syntax grammar in `syntaxes/osf.tmLanguage.json`
- Add snippets in `snippets/osf.json`
- Test in Extension Development Host

### 7️⃣ Run quality checks

```bash
# Compile TypeScript
npm run compile

# Lint code
npm run lint
```

### 8️⃣ Commit and push

```bash
git add .
git commit -m "feat: describe your change concisely"
git push origin my-feature-branch
```

### 9️⃣ Open a Pull Request

Go to your fork on GitHub and click **Compare & pull request**.

---

## 💡 Contribution Types

✅ Improve syntax highlighting  
✅ Add IntelliSense completions  
✅ Enhance preview functionality  
✅ Add new snippets  
✅ Fix bugs  
✅ Improve documentation  

---

## ✨ Guidelines

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Formatting changes
- `refactor:` - Code refactoring
- `test:` - Adding tests

**Examples:**
```
feat: add auto-completion for @table properties
fix: syntax highlighting for nested blocks
docs: update extension README
```

### Extension Development

- **Syntax**: Edit `syntaxes/osf.tmLanguage.json` for TextMate grammar
- **Snippets**: Add to `snippets/osf.json`
- **Commands**: Implement in `src/commands/`
- **Providers**: Implement in `src/providers/`

### Testing

- Test in Extension Development Host (F5)
- Test with various OSF files
- Verify syntax highlighting
- Test auto-completions
- Test commands

### Pull Request Process

1. Target the `main` branch
2. Test thoroughly in Extension Development Host
3. Request review from maintainers
4. Address any review feedback

### All contributors must follow our [Code of Conduct](CODE_OF_CONDUCT.md)

---

## 🤝 Community

Join our discussions on [GitHub Discussions](https://github.com/OmniScriptOSF/omniscript-core/discussions).

---

## 📚 Key Technologies

- **Language**: TypeScript
- **Framework**: VSCode Extension API
- **Syntax**: TextMate Grammar (JSON)
- **Build**: TSC

### Useful Links

- [VSCode Extension API](https://code.visualstudio.com/api)
- [Extension Guides](https://code.visualstudio.com/api/extension-guides/overview)
- [TextMate Grammar](https://macromates.com/manual/en/language_grammars)

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
