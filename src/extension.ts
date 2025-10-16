// File: src/extension.ts
import * as vscode from 'vscode';
import { CompletionProvider } from './providers/completionProvider';
import { HoverProvider } from './providers/hoverProvider';
import { DiagnosticsProvider } from './providers/diagnosticsProvider';
import { FormattingProvider } from './providers/formattingProvider';
import { parseCommand } from './commands/parseCommand';
import { previewCommand } from './commands/previewCommand';
import { exportCommand } from './commands/exportCommand';

/**
 * Extension activation entry point.
 * Called when a .osf file is opened or an OSF command is triggered.
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('OmniScript Format extension is now active');

    // Get configuration
    const config = vscode.workspace.getConfiguration('osf');

    // Register language providers
    const osfSelector: vscode.DocumentSelector = { language: 'osf', scheme: 'file' };

    // Completion provider for auto-complete
    if (config.get('completion.enabled', true)) {
        const completionProvider = new CompletionProvider();
        context.subscriptions.push(
            vscode.languages.registerCompletionItemProvider(
                osfSelector,
                completionProvider,
                '@', // Trigger on @ for blocks
                ':', // Trigger on : for properties
                ' '  // Trigger on space for values
            )
        );
    }

    // Hover provider for documentation
    const hoverProvider = new HoverProvider();
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(osfSelector, hoverProvider)
    );

    // Diagnostics provider for real-time error checking
    if (config.get('linting.enabled', true)) {
        const diagnosticsProvider = new DiagnosticsProvider();
        context.subscriptions.push(diagnosticsProvider);
    }

    // Formatting provider for document formatting
    const formattingProvider = new FormattingProvider();
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            osfSelector,
            formattingProvider
        )
    );

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('osf.parse', () => parseCommand())
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('osf.preview', () => previewCommand(context))
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('osf.exportPDF', () => exportCommand('pdf'))
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('osf.exportDOCX', () => exportCommand('docx'))
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('osf.exportPPTX', () => exportCommand('pptx'))
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('osf.exportXLSX', () => exportCommand('xlsx'))
    );

    // Show welcome message on first activation
    const hasShownWelcome = context.globalState.get('osf.hasShownWelcome', false);
    if (!hasShownWelcome) {
        vscode.window.showInformationMessage(
            'OmniScript Format extension activated! Try opening a .osf file to get started.',
            'View Documentation'
        ).then(selection => {
            if (selection === 'View Documentation') {
                vscode.env.openExternal(vscode.Uri.parse('https://omniscriptosf.github.io'));
            }
        });
        context.globalState.update('osf.hasShownWelcome', true);
    }
}

/**
 * Extension deactivation cleanup.
 */
export function deactivate() {
    console.log('OmniScript Format extension deactivated');
}
