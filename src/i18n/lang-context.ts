/**
 * 页面语言上下文的共享接口。
 *
 * 默认实现是空操作；服务端会由 lang-context.server.ts 用
 * AsyncLocalStorage 覆盖它，从而在 SSG 并发渲染时隔离各页面的语言。
 * 这个文件必须保持「无 Node 依赖」，因为它会进入浏览器端 bundle。
 */
export interface LangStore {
	set: (lang: string | null) => void;
	get: () => string | undefined;
}

export const langStore: LangStore = {
	set: () => {},
	get: () => undefined,
};
