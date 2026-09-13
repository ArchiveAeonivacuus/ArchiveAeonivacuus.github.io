/// <reference types="mdast" />
import { h } from "hastscript";

/**
 * 原有的 Dialog 组件
 */
export function DialogComponent(properties, children) {
	const person =
		properties.label ||
		properties.person ||
		properties.p ||
		properties.n ||
		"???";
	const nPerson = h("div", { class: "dialog-person" }, person);
	const nContent = h("div", { class: "dialog-content" }, children);
	return h("div", { class: "dialog-block" }, [nPerson, nContent]);
}

/**
 * 新增：通用样式盒子工厂函数
 * 用来快速生成 <div class="className">...</div>
 */
export function ClassBox(className) {
	return (properties, children) => {
		return h("div", { class: className }, children);
	};
}

/**
 * 新增：行内字体工厂函数
 * 用来把 :ong[文本] 之类的行内指令转成 <span class="className">文本</span>
 */
export function FontSpan(className) {
	return (_properties, children) => {
		return h("span", { class: className }, children);
	};
}
