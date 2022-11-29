import { Test, TestContext } from '@japa/runner';
import { Client } from 'pg';
import { TestExecutor } from '@japa/core';
export declare var pg: Client;
export declare const test: (title: string, callback: TestExecutor<TestContext, undefined>) => Test<undefined>;
