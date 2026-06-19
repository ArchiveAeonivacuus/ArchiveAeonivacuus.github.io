import Giscus from "@giscus/react";
import * as React from "react";

const id = "inject-comments";

// 获取 localStorage 中 theme 的值
function getSavedTheme() {
	return window.localStorage.getItem("theme") || "auto";
}

// 获取 giscus 主题名
function getGiscusTheme() {
	const saved = getSavedTheme();
	if (saved === "dark") return "dark";
	if (saved === "light") return "light";
	// auto: 跟随系统
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const Comments = () => {
	const [mounted, setMounted] = React.useState(false);
	const [theme, setTheme] = React.useState("preferred_color_scheme");

	React.useEffect(() => {
		setTheme(getGiscusTheme());
		// 监听主题变化
		const observer = new MutationObserver(() => {
			setTheme(getGiscusTheme());
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["data-theme"],
		});

		// 取消监听
		return () => {
			observer.disconnect();
		};
	}, []);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<div id={id} className="w-full">
			{mounted ? (
				<Giscus
					id={id}
					repo="ArchiveAeonivacuus/ArchiveAeonivacuus.github.io"
					repoId="R_kgDOQb_VFw"
					category="Announcements"
					categoryId="DIC_kwDOQb_VF84Cy0te"
					mapping="title"
					reactionsEnabled="1"
					emitMetadata="0"
					inputPosition="top"
					lang="zh-CN"
					loading="lazy"
					theme={theme}
				/>
			) : null}
		</div>
	);
};

export default Comments;
