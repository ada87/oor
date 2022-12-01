import { Assert } from '@japa/assert';
/**
 * Plugin for "@japa/runner"
 */
declare module '@japa/runner' {
    interface TestContext {
        assert: Assert;
    }
}
