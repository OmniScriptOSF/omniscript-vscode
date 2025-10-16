// File: src/utils/logger.ts
import * as vscode from 'vscode';

/**
 * Simple logger for the extension with output channel.
 */
class Logger {
    private outputChannel: vscode.OutputChannel;
    
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('OmniScript Format');
    }
    
    info(message: string): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] INFO: ${message}`);
    }
    
    warn(message: string): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] WARN: ${message}`);
    }
    
    error(message: string, error?: Error): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] ERROR: ${message}`);
        if (error) {
            this.outputChannel.appendLine(`  ${error.message}`);
            if (error.stack) {
                this.outputChannel.appendLine(`  Stack: ${error.stack}`);
            }
        }
    }
    
    show(): void {
        this.outputChannel.show();
    }
    
    dispose(): void {
        this.outputChannel.dispose();
    }
}

export const logger = new Logger();
