import * as vscode from 'vscode';

interface CommentConfig {
    lineComment?: string;
    blockComment?: [string, string];
    extraBlockComment?: [string, string];
}

const hiddenEditors = new Set<string>();

let hideDecoration: vscode.TextEditorDecorationType;
let statusBarItem: vscode.StatusBarItem;

function updateStatusBar(editor?: vscode.TextEditor) {
    if (!editor) { statusBarItem.hide(); return; }
    const hidden = hiddenEditors.has(editor.document.uri.toString());
    statusBarItem.text = hidden ? '$(eye-closed) Comments' : '$(eye) Comments';
    statusBarItem.tooltip = hidden ? 'Comments hidden — click to show' : 'Comments visible — click to hide';
    statusBarItem.show();
}

export function activate(context: vscode.ExtensionContext) {
    hideDecoration = vscode.window.createTextEditorDecorationType({
        opacity: '0',
        letterSpacing: '-9999px',
    });

    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'stfu.toggle';
    updateStatusBar(vscode.window.activeTextEditor);

    const toggle = vscode.commands.registerCommand('stfu.toggle', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const key = editor.document.uri.toString();

        if (hiddenEditors.has(key)) {
            editor.setDecorations(hideDecoration, []);
            hiddenEditors.delete(key);
        } else {
            const ranges = findCommentRanges(editor.document);
            editor.setDecorations(hideDecoration, ranges);
            hiddenEditors.add(key);
        }
        updateStatusBar(editor);
    });

    const onEditorChange = vscode.window.onDidChangeActiveTextEditor(editor => {
        updateStatusBar(editor);
        if (!editor) return;
        const key = editor.document.uri.toString();
        if (hiddenEditors.has(key)) {
            const ranges = findCommentRanges(editor.document);
            editor.setDecorations(hideDecoration, ranges);
        }
    });

    const onDocChange = vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== event.document) return;
        const key = editor.document.uri.toString();
        if (hiddenEditors.has(key)) {
            const ranges = findCommentRanges(editor.document);
            editor.setDecorations(hideDecoration, ranges);
        }
    });

    context.subscriptions.push(toggle, onEditorChange, onDocChange, hideDecoration, statusBarItem);
}

function getCommentConfig(langId: string): CommentConfig {
    switch (langId) {
        case 'rust':
        case 'javascript':
        case 'typescript':
        case 'javascriptreact':
        case 'typescriptreact':
        case 'c':
        case 'cpp':
        case 'java':
        case 'go':
        case 'swift':
        case 'kotlin':
        case 'csharp':
        case 'glsl':
        case 'hlsl':
            return { lineComment: '//', blockComment: ['/*', '*/'] };
        case 'python':
        case 'ruby':
        case 'shellscript':
        case 'bash':
        case 'fish':
        case 'yaml':
        case 'toml':
        case 'dockerfile':
        case 'r':
            return { lineComment: '#' };
        case 'html':
        case 'xml':
            return { lineComment: '//', blockComment: ['/*', '*/'], extraBlockComment: ['<!--', '-->'] };
        case 'markdown':
            return { blockComment: ['<!--', '-->'] };
        case 'css':
        case 'scss':
        case 'less':
            return { blockComment: ['/*', '*/'] };
        case 'lua':
            return { lineComment: '--', blockComment: ['--[[', ']]'] };
        case 'haskell':
            return { lineComment: '--', blockComment: ['{-', '-}'] };
        case 'sql':
            return { lineComment: '--', blockComment: ['/*', '*/'] };
        default:
            return { lineComment: '//', blockComment: ['/*', '*/'] };
    }
}

function getStringDelimiters(langId: string): string[] {
    if (langId === 'markdown') return [];
    return ['"', "'", '`'];
}

function findCommentRanges(document: vscode.TextDocument): vscode.Range[] {
    const text = document.getText();
    const config = getCommentConfig(document.languageId);
    const stringDelims = getStringDelimiters(document.languageId);
    const result: Array<[number, number]> = [];
    let i = 0;
    const len = text.length;

    while (i < len) {
        const ch = text[i];

        // Skip string literals so their contents never trigger comment detection
        if (stringDelims.includes(ch)) {
            i++;
            while (i < len && text[i] !== ch) {
                if (text[i] === '\\') i++;
                i++;
            }
            i++;
            continue;
        }

        if (config.blockComment) {
            const [open, close] = config.blockComment;
            if (text.startsWith(open, i)) {
                const start = i;
                i += open.length;
                while (i < len && !text.startsWith(close, i)) i++;
                i += close.length;
                result.push([start, i]);
                continue;
            }
        }

        if (config.extraBlockComment) {
            const [open, close] = config.extraBlockComment;
            if (text.startsWith(open, i)) {
                const start = i;
                i += open.length;
                while (i < len && !text.startsWith(close, i)) i++;
                i += close.length;
                result.push([start, i]);
                continue;
            }
        }

        if (config.lineComment && text.startsWith(config.lineComment, i)) {
            const start = i;
            while (i < len && text[i] !== '\n') i++;
            result.push([start, i]);
            continue;
        }

        i++;
    }

    return result.map(([start, end]) =>
        new vscode.Range(document.positionAt(start), document.positionAt(end))
    );
}

export function deactivate() {
    hiddenEditors.clear();
}
