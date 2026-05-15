// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const PREVIEW_EDITOR_ID = "vscode.markdown.preview.editor";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// 1. 获取启动时所有需要处理的 Markdown 文件的 URI 列表
	// 使用 fsPath 作为唯一键，避免使用不稳定的 Tab 对象
	const markdownUris = vscode.window.tabGroups.all
		.flatMap(g => g.tabs)
		.filter(tab =>
			tab.input instanceof vscode.TabInputText &&
			tab.input.uri.fsPath.toLowerCase().endsWith('.md')
		)
		.map(tab => (tab.input as vscode.TabInputText).uri);

	if (markdownUris.length === 0) { return; } //如果没有处于编辑状态的markdown文件，直接返回

	const originalActiveUri = (vscode.window.tabGroups.activeTabGroup.activeTab?.input as any)?.uri; //记录当前焦点，因为后面我们要操作tab

	// 逐个处理 URI
	for (const uri of markdownUris) {
		// 每次操作前，必须实时重新计算当前的 tab 状态，因为每次关闭 tab 都会导致旧的 tab 引用失效
		const tab = findTextEditorTabForUri(uri);

		if (tab) {
			await vscode.window.tabGroups.close(tab);

			await vscode.commands.executeCommand(
				'vscode.openWith',
				uri,
				PREVIEW_EDITOR_ID
			);
		}
	}

	// 恢复原始焦点
	if (originalActiveUri) {
		await vscode.commands.executeCommand('vscode.open', originalActiveUri, {
			preview: true,
			preserveFocus: false
		});
	}

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
