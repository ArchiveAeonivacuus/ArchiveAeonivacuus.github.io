/**
 * 服务端语言上下文：用 AsyncLocalStorage 把「当前页面语言」绑定到
 * 本次页面渲染的异步上下文，避免 SSG 并发渲染时页面之间互相串语言。
 *
 * 本文件只在服务端被 import（Layout.astro 的 frontmatter），
 * 不会进入浏览器 bundle。
 */
import { AsyncLocalStorage } from "node:async_hooks";
import { langStore } from "./lang-context";

const storage = new AsyncLocalStorage<{ lang: string }>();

langStore.set = (lang: string | null) => {
	storage.enterWith({ lang: lang ?? "" });
};

langStore.get = () => storage.getStore()?.lang;
