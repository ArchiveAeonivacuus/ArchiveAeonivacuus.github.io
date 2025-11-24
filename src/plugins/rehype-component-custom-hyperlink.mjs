/// <reference types="mdast" />
import { h } from "hastscript";

/**
 * Hyperlink Card Component with manual avatar and description
 *
 * @param {Object} properties
 * @param {string} properties.href - 卡片跳转链接
 * @param {string} properties.title - 标题
 * @param {string} properties.avatar - 头像 URL
 * @param {string} properties.description - 描述
 * @param {import('mdast').RootContent[]} children - children（必须为空）
 * @returns {import('mdast').Parent}
 */
export function HyperlinkCardComponent(properties, children) {
	if (Array.isArray(children) && children.length !== 0) {
		return h("div", { class: "hidden" }, [
			'Invalid directive. ("hyperlink" directive must be leaf type)',
		]);
	}

	const href = properties.href || "#";
	const title = properties.title || "Title";
	const avatar = properties.avatar || "";
	const description = properties.description || "";

	const cardUuid = `HC${Math.random().toString(36).slice(-6)}`;

	const nAvatar = h(`div#${cardUuid}-avatar`, {
		class: "hc-avatar",
		style: `background-image:url('${avatar}');`,
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
		},
		[nTitlebar, nDescription],
	);
}
