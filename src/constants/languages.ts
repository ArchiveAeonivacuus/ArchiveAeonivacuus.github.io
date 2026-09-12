export interface LanguageConfig {
	code: string; // 对应的 lang 属性值
	name: string; // 页面切换按钮中显示的文本，例如 "中文（简体）"、"日本語"
	fontClass: string; // 绑定的 CSS 类名
	style?: string; // 自定义内联样式 (例如 font-family 等)
}

export const LANGUAGE_MAP: Record<string, LanguageConfig> = {
	zh_CN: {
		code: "zh_CN",
		name: "中文 （简体）",
		fontClass: "font-sc",
		style:
			"font-family: 'Source Han Serif SC VF', 'Source Han Serif SC', serif;",
	},
	zh_TW: {
		code: "zh_TW",
		name: "中文（繁體）",
		fontClass: "font-tc",
		style: "font-family: 'Source Han Serif Old', serif;",
	},
	ja: {
		code: "ja",
		name: "日本語",
		fontClass: "font-ja",
		style: "font-family: 'Source Han Serif JP', 'Asebi Mincho', serif;",
	},
	en: {
		code: "en",
		name: "English",
		fontClass: "font-en",
		style: "font-family: 'HighTowerText', 'Old English Onglisch', serif;",
	},
	"A-ong": {
		code: "A-ong",
		name: "Onglisch",
		fontClass: "font-ong",
		style: "font-family: 'Old English Onglisch', serif;",
	},
	"A-zh-iang": {
		code: "A-zh-iang",
		name: "漢語（大瀛）",
		fontClass: "font-zhiang",
		style: "font-family: 'Source Han Serif Old', 'Source Han Serif JP', serif;",
	},
};

/**
 * 提取基础 Slug
 * 例如 "my-story_ja" -> "my-story"
 * "my-story" -> "my-story"
 * "nociw-kur-tura-karpa_perface-to-3" -> "nociw-kur-tura-karpa_perface-to-3" (不被错误截断)
 */
export function getBaseSlug(slug: string): string {
	const langSuffixes = ["ja", "zh_TW", "en", "A-ong", "A-zh-iang"];
	// 严格匹配结尾是 "_ja", "_en" 等在我们映射表中的语言代码后缀
	const regex = new RegExp(
		`_(${langSuffixes.map((s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|")})$`,
	);
	return slug.replace(regex, "");
}

/**
 * 提取语言后缀
 * 例如 "my-story_ja" -> "ja"
 * "my-story" -> "zh_CN" (如果没有后缀，默认取配置文件的第一语言)
 */
export function getLanguageSuffix(slug: string): string {
	const match = slug.match(/_([a-zA-Z0-9-]+)$/);
	return match ? match[1] : "zh_CN";
}
