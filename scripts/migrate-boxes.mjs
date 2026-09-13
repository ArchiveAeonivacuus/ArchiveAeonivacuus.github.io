/**
 * 把诗/词盒子的原始 HTML 写法转成容器指令：
 *
 *   <div class="shi">…</div>   ->   :::shi
 *                                    …
 *                                    :::
 *
 * 为什么：
 *   - 原始 <div> 是 HTML 区块，紧随其后没有空行时内部 Markdown 不会解析，
 *     `{字|音}` / `:字体[]` 简写会失效；`:::` 容器内部始终按 Markdown 解析。
 *   - 去掉 HTML，写法更短、和 :::dialog 一致。
 *
 * 用法：
 *   node scripts/migrate-boxes.mjs            # 实际写入
 *   node scripts/migrate-boxes.mjs --dry-run  # 只报告
 */

import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = "src/content/posts";
const DRY_RUN = process.argv.includes("--dry-run");

// 只匹配没有嵌套 <div> 的盒子（这些文章里 <div> 数量 == 盒子数量，已确认无嵌套）
const BOX_RE = /<div class="(shi|ci|spellcard|poet|waka)">([\s\S]*?)<\/div>/g;

let converted = 0;
let skipped = 0;

for (const file of fs
	.readdirSync(POSTS_DIR)
	.filter((f) => f.endsWith(".md"))
	.sort()) {
	const full = path.join(POSTS_DIR, file);
	const original = fs.readFileSync(full, "utf8");

	const out = original.replace(BOX_RE, (match, cls, inner) => {
		// 内容里若有以 ::: 开头的行，转成容器会被误当成闭合围栏，跳过
		if (/^\s*:::/m.test(inner)) {
			skipped++;
			return match;
		}
		const body = inner.replace(/^\n+/, "").replace(/\n+$/, "");
		converted++;
		return `:::${cls}\n\n${body}\n\n:::`;
	});

	if (out !== original && !DRY_RUN) {
		fs.writeFileSync(full, out);
	}
}

console.log(
	`转换 ${converted} 个盒子${skipped ? `，跳过 ${skipped} 个（含 ::: 行）` : ""}${DRY_RUN ? "（dry-run，未写入）" : ""}`,
);
