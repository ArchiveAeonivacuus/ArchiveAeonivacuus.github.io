/// <reference types="mdast" />
import { h } from "hastscript";

/**
 * 单行叶子指令卡片：
 *
 *   ::card{href="https://example.com" title="标题" avatar="头像URL" desc="描述"}
 *
 * 除 href 外都可省略：
 *   - title 省略时用域名
 *   - avatar 省略时用 <origin>/favicon.ico
 *   - desc 省略时为空
 *
 * 兼容旧的 `hyperlink` 指令名（同样建议用叶子写法 ::hyperlink{...}）。
 *
 * @param {Object} properties
 * @param {string} properties.href - 卡片跳转链接
 * @param {string} [properties.title] - 标题
 * @param {string} [properties.avatar] - 头像 URL
 * @param {string} [properties.desc] - 描述（纯文本）
 * @param {import('mdast').RootContent[]} children
 * @returns {import('mdast').Parent}
 */
export function HyperlinkCardComponent(properties, children) {
	if (Array.isArray(children) && children.length !== 0) {
		return h("div", { class: "hidden" }, [
			'Invalid directive. ("card" must be a leaf directive: ::card{href="..."})',
		]);
	}

	const href = properties.href || "#";

	let hostname = "";
	let origin = "";
	try {
		const u = new URL(href);
		hostname = u.hostname;
		origin = u.origin;
	} catch {
		// 相对链接等，忽略自动推导
	}

	const title = properties.title || hostname || "Link";
	const avatar = properties.avatar || (origin ? `${origin}/favicon.ico` : "");
	const description = properties.desc || properties.description || "";

	const cardUuid = `HC${Math.random().toString(36).slice(-6)}`;

	const nAvatar = h(`div#${cardUuid}-avatar`, {
		class: "hc-avatar",
		style: avatar ? `background-image:url('${avatar}');` : "",
	});

	const nTitle = h("div", { class: "hc-title" }, title);
	const nDescription = h("div", { class: "hc-description" }, description);

	const nTitlebar = h("div", { class: "hc-titlebar" }, [nAvatar, nTitle]);

	return h(
		`a#${cardUuid}-card`,
		{
			class: "card-hyperlink no-styling",
			href,
			target: "_blank",
			rel: "noopener",
		},
		[nTitlebar, nDescription],
	);
}
