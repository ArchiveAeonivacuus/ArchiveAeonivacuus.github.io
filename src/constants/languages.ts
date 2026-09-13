export interface LanguageConfig {
	code: string; // 对应的 lang 属性值
	name: string; // 页面切换按钮中显示的文本，例如 "中文（简体）"、"日本語"
	fontClass: string; // 绑定的 CSS 类名
	style?: string; // 自定义内联样式 (例如 font-family 等)
}

export const LANGUAGE_MAP: Record<string, LanguageConfig> = {
	zh_CN: {
		code: "zh_CN",
		name: "简体中文",
		fontClass: "font-sc",
		style: "font-family: 'Source Han Serif SC', 'Source Han Serif JP', serif;",
	},
	zh_TW: {
		code: "zh_TW",
		name: "繁體中文",
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
		name: "Onglısch",
		fontClass: "font-ong",
		style: "font-family: 'Old English Onglisch', serif;",
	},
	"A-zh_iang": {
		code: "A-zh_iang",
		name: "大瀛漢語",
		fontClass: "font-zhiang",
		style: "font-family: 'Source Han Serif JP', 'Source Han Serif Old', serif;",
	},
};

// 除默认语言外，所有可作为文件名后缀的语言代码
const LANG_SUFFIXES = Object.keys(LANGUAGE_MAP).filter(
	(code) => code !== "zh_CN",
);

/**
 * 提取基础 Slug
 * 例如 "my-story_ja" -> "my-story"
 * "my-story" -> "my-story"
 * "nociw-kur-tura-karpa_perface-to-3" -> "nociw-kur-tura-karpa_perface-to-3" (不被错误截断)
 */
export function getBaseSlug(slug: string): string {
	// 严格匹配结尾是 "_ja", "_A-zh_iang" 等映射表中的语言代码后缀
	const escaped = LANG_SUFFIXES.map((s) =>
		s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
	);
	const regex = new RegExp(`_(${escaped.join("|")})$`);
	return slug.replace(regex, "");
}

/**
 * 提取语言后缀
 * 例如 "my-story_ja" -> "ja"
 * "my-story" -> "zh_CN" (如果没有后缀，默认取配置文件的第一语言)
 */
export function getLanguageSuffix(slug: string): string {
	const match = slug.match(/_([a-zA-Z0-9_-]+)$/);
	if (!match) return "zh_CN";
	return LANG_SUFFIXES.includes(match[1]) ? match[1] : "zh_CN";
}
