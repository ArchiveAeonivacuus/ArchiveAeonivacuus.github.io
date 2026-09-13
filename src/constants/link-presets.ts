import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { LinkPreset, type NavBarLink } from "@/types/config";

export type PresetNavLink = NavBarLink & { i18nKey?: I18nKey };

/**
 * 注意：这里必须用函数，不能是模块级常量。
 * `i18n()` 依赖当前页面的语言覆盖，模块级求值只会执行一次，
 * 会导致导航栏永远固定成构建时那一种语言。
 */
export function getLinkPresets(): { [key in LinkPreset]: PresetNavLink } {
	return {
		[LinkPreset.Home]: {
			name: i18n(I18nKey.home),
			url: "/",
			i18nKey: I18nKey.home,
		},
		[LinkPreset.About]: {
			name: i18n(I18nKey.about),
			url: "/about/",
			i18nKey: I18nKey.about,
		},
		[LinkPreset.Archive]: {
			name: i18n(I18nKey.archive),
			url: "/archive/",
			i18nKey: I18nKey.archive,
		},
		[LinkPreset.Friends]: {
			name: i18n(I18nKey.friends),
			url: "/friends/",
			i18nKey: I18nKey.friends,
		},
	};
}
