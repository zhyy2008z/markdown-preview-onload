// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const PREVIEW_EDITOR_ID = "vscode.markdown.preview.editor";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let editModeFiles = new Set(
		context.workspaceState.get<string[]>("editModeFiles", [])
	);

	const currentEditor = vscode.window.activeTextEditor;
	if (currentEditor) {
		autoPreview(currentEditor, editModeFiles);
	}
}

/**
 * 自动重新打开处于编辑状态的文档为预览状态
 */
async function autoPreview(editor: vscode.TextEditor, editModeFiles: Set<string>) {
	if (editor.document.languageId !== "markdown") { return; }
	if (editor.document.uri.scheme !== "file") { return; }
	if (editModeFiles.has(editor.document.uri.toString())) { return; }

	const uri = editor.document.uri;
	const viewColumn = editor.viewColumn ?? vscode.ViewColumn.Active;
	const tab = findTextEditorTabForUri(uri);
	if (tab) {
		await vscode.window.tabGroups.close(tab);
	}
	await vscode.commands.executeCommand(
		"vscode.openWith",
		uri,
		PREVIEW_EDITOR_ID,
		viewColumn
	);
}

/**
 * 通过 uri 查找 TextEditorTab
 */
function findTextEditorTabForUri(uri: vscode.Uri): vscode.Tab | undefined {
	const uriStr = uri.toString();
	for (const group of vscode.window.tabGroups.all) {
		for (const tab of group.tabs) {
			if (tab.input instanceof vscode.TabInputText) {
				if (tab.input.uri.toString() === uriStr) {
					return tab;
				}
			}
		}
	}
	return undefined;
}

// This method is called when your extension is deactivated
export function deactivate() { }
