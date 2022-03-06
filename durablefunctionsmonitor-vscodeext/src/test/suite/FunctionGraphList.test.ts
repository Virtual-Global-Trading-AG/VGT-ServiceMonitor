// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as path from 'path';
import * as assert from 'assert';
import * as vscode from 'vscode';

import { FunctionGraphList } from '../../FunctionGraphList';

suite('FunctionGraphList Test Suite', () => {

	const testTimeoutInMs = 60000;

	test('Traverses functions', async () => {

		// Arrange

		const context: any = {};

		const funcGraphList = new FunctionGraphList(context);

		const functionProjectPath = path.join(__dirname, '..', '..', '..', '..', 'durablefunctionsmonitor.dotnetbackend');

		Object.defineProperty(vscode.workspace, 'rootPath', { get: () => functionProjectPath });

		// Act

		const traversalResult1 = await funcGraphList.traverseFunctions(functionProjectPath);
		const traversalResult2 = await funcGraphList.traverseFunctions(functionProjectPath);

		// Assert

		assert.strictEqual(traversalResult1.functions, traversalResult2.functions);
		assert.strictEqual(traversalResult1.proxies, traversalResult2.proxies);

		assert.strictEqual(Object.keys(traversalResult1.functions).length > 14, true);
		assert.strictEqual(Object.keys(traversalResult1.proxies).length > 0, true);

		assert.strictEqual(traversalResult1.functions.DfmAboutFunction.filePath, path.join(functionProjectPath, 'Functions', 'About.cs'));
		assert.strictEqual(traversalResult1.functions.DfmAboutFunction.lineNr! > 1, true);
		assert.strictEqual(traversalResult1.functions.DfmAboutFunction.pos! > 1, true);
		assert.strictEqual(traversalResult1.functions.DfmAboutFunction.bindings.length, 1);

		assert.deepStrictEqual(traversalResult1.functions.DfmAboutFunction.bindings[0], {
			"type": "httpTrigger",
			"route": "a/p/i/{connName}-{hubName}/about",
			"methods": ["get"],
			"authLevel": "anonymous",
			"name": "req"
		});

		assert.strictEqual(!!((funcGraphList as any)._watcher), true);

		funcGraphList.cleanup();

		assert.strictEqual(!!((funcGraphList as any)._watcher), false);

	}).timeout(testTimeoutInMs);

	test('Visualizes Function Graph', async () => {

		// Arrange

		const context: any = {

			extensionPath: path.join(__dirname, '..', '..', '..')
		};

		const funcGraphList = new FunctionGraphList(context);

		const functionProjectPath = path.join(__dirname, '..', '..', '..', '..', 'durablefunctionsmonitor.dotnetbackend');

		Object.defineProperty(vscode.workspace, 'rootPath', { get: () => functionProjectPath });

		(vscode.window as any).showInputBox = (params: any) => {

			assert.strictEqual(params.value, functionProjectPath);

			return Promise.resolve(params.value);
		};

		// Act

		funcGraphList.visualize();

		await new Promise<void>((resolve) => setTimeout(resolve, 1000));

		// Assert

		assert.strictEqual((funcGraphList as any)._views.length, 1);

		funcGraphList.cleanup();

		assert.strictEqual((funcGraphList as any)._views.length, 0);

	}).timeout(testTimeoutInMs);

});
