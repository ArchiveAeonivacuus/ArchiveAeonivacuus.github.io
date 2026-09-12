import { siteConfig } from "../config";
import type I18nKey from "./i18nKey";
import { A_ong } from "./languages/A_ong";
import { A_zh_iang } from "./languages/A_zh_iang";
import { en } from "./languages/en";
import { es } from "./languages/es";
import { id } from "./languages/id";
import { ja } from "./languages/ja";
import { ko } from "./languages/ko";
import { th } from "./languages/th";
import { tr } from "./languages/tr";
import { vi } from "./languages/vi";
import { zh_CN } from "./languages/zh_CN";
import { zh_TW } from "./languages/zh_TW";

export type Translation = {
	[K in I18nKey]: string;
};

const defaultTranslation = en;

const map: { [key: string]: Translation } = {
	// 现实语言（规范为大写区域码，同时保留小写变体兼容）
	es: es,
	en: en,
	en_us: en,
	en_gb: en,
	en_au: en,
	zh_CN: zh_CN,
	zh_cn: zh_CN,
	zh_TW: zh_TW,
	zh_tw: zh_TW,
	ja: ja,
	ja_jp: ja,
	ko: ko,
	ko_kr: ko,
	th: th,
	th_th: th,
	vi: vi,
	vi_vn: vi,
	id: id,
	tr: tr,
	tr_tr: tr,
	// 自定义造语
	"A-ong": A_ong,
	"a-ong": A_ong,
	"A-zh_iang": A_zh_iang,
	"a-zh_iang": A_zh_iang,
};

import { WORD_TRANSLATIONS } from "../constants/translations";

export function getTranslation(lang: string): Translation {
	return map[lang] || defaultTranslation;
}

// 页面级临时语言重写（利用 NodeJS 全局变量在 Astro 的每个单次渲染沙盒周期中进行隔离重写）
let globalPageLangOverride: string | null = null;

export function setPageLanguageOverride(lang: string | null) {
	globalPageLangOverride = lang;
}

export function getCurrentPageLanguage(): string {
	return globalPageLangOverride || siteConfig.lang || "zh_CN";
}

/**
 * 智能翻译分类和标签，如果没定义该词的对应翻译，则完美回退到原始名字，100% 向下兼容
 */
export function translateWord(
	word: string | null | undefined,
	langCode: string,
): string {
	if (!word) return "";
	const cleanWord = word.trim();
	const matched = WORD_TRANSLATIONS[cleanWord];
	if (matched) {
		return matched[langCode] || matched["zh_CN"] || cleanWord;
	}
	return cleanWord;
}

export function i18n(key: I18nKey): string {
	const lang = getCurrentPageLanguage();
	return getTranslation(lang)[key];
}
