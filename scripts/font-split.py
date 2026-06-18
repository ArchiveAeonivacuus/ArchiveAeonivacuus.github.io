#!/usr/bin/env python3
"""
字体分片脚本：将大字体文件按 Unicode 区间拆分为多个 woff2 小文件，
并生成带 unicode-range 的 CSS 文件，实现浏览器按需加载。
"""

import os
import subprocess
import sys
from pathlib import Path

# 项目根目录
ROOT = Path(__file__).resolve().parent.parent
FONTS_DIR = ROOT / "public" / "fonts"

# 定义需要分片的字体及其 font-family 信息
FONTS_TO_SPLIT = [
    {
        "file": "AsebiMin-Light.otf",
        "family": "Asebi Mincho",
        "local_names": ["'Asebi Mincho'", "'馬酔木明朝'"],
        "style": "normal",
        "weight": "normal",
    },
    {
        "file": "simkai.ttf",
        "family": "KaiTi",
        "local_names": ["KaiTi"],
        "style": "normal",
        "weight": "normal",
    },
    {
        "file": "標楷體.ttf",
        "family": "DFKai-SB",
        "local_names": ["DFKai-SB"],
        "style": "normal",
        "weight": "normal",
    },
    {
        "file": "SourceHanSerifJP-Regular.ttf",
        "family": "Source Han Serif JP",
        "local_names": ["'Source Han Serif JP'"],
        "style": "normal",
        "weight": "normal",
    },
    {
        "file": "SOURCEHANSERIFOLD-LIGHT.OTF",
        "family": "Source Han Serif Old",
        "local_names": ["'Source Han Serif Old'"],
        "style": "normal",
        "weight": "normal",
    },
    {
        "file": "Old English Onglisch.otf",
        "family": "Old English Onglisch",
        "local_names": ["'Old English Onglisch'"],
        "style": "normal",
        "weight": "normal",
    },
    {
        "file": "HTOWERT.TTF",
        "family": "HighTowerText",
        "local_names": [],
        "style": "normal",
        "weight": "400",
    },
    {
        "file": "HTOWERTI.TTF",
        "family": "HighTowerText",
        "local_names": [],
        "style": "italic",
        "weight": "400",
    },
]

# Unicode 分片范围定义
# 每个 tuple: (起始码位, 结束码位, 描述)
# 按常见 Unicode 区间划分，确保每个分片覆盖合理的字符范围

def generate_unicode_ranges():
    """生成 Unicode 分片范围列表"""
    ranges = []
    
    # 基本拉丁文 (ASCII)
    ranges.append((0x0020, 0x007F, "Basic Latin"))
    
    # 拉丁文扩展
    ranges.append((0x0080, 0x00FF, "Latin-1 Supplement"))
    ranges.append((0x0100, 0x024F, "Latin Extended-A"))
    ranges.append((0x0250, 0x02AF, "Latin Extended-B"))
    
    # 间距修饰字符
    ranges.append((0x02B0, 0x02FF, "Spacing Modifier Letters"))
    
    # 组合变音标记
    ranges.append((0x0300, 0x036F, "Combining Diacritical Marks"))
    
    # 希腊文
    ranges.append((0x0370, 0x03FF, "Greek and Coptic"))
    
    # 西里尔文
    ranges.append((0x0400, 0x04FF, "Cyrillic"))
    
    # 亚美尼亚文
    ranges.append((0x0530, 0x058F, "Armenian"))
    
    # 希伯来文
    ranges.append((0x0590, 0x05FF, "Hebrew"))
    
    # 阿拉伯文
    ranges.append((0x0600, 0x06FF, "Arabic"))
    
    # 泰文
    ranges.append((0x0E00, 0x0E7F, "Thai"))
    
    # 乔治亚文
    ranges.append((0x10A0, 0x10FF, "Georgian"))
    
    # 拉丁文扩展附加
    ranges.append((0x1E00, 0x1EFF, "Latin Extended Additional"))
    
    # 通用标点
    ranges.append((0x2000, 0x206F, "General Punctuation"))
    
    # 上标和下标
    ranges.append((0x2070, 0x209F, "Superscripts and Subscripts"))
    
    # 货币符号
    ranges.append((0x20A0, 0x20CF, "Currency Symbols"))
    
    # 字母式符号
    ranges.append((0x2100, 0x214F, "Letterlike Symbols"))
    
    # 数字形式
    ranges.append((0x2150, 0x218F, "Number Forms"))
    
    # 箭头
    ranges.append((0x2190, 0x21FF, "Arrows"))
    
    # 数学运算符
    ranges.append((0x2200, 0x22FF, "Mathematical Operators"))
    
    # 杂项技术符号
    ranges.append((0x2300, 0x23FF, "Miscellaneous Technical"))
    
    # 制表符
    ranges.append((0x2500, 0x257F, "Box Drawing"))
    
    # 方块元素
    ranges.append((0x2580, 0x259F, "Block Elements"))
    
    # 几何形状
    ranges.append((0x25A0, 0x25FF, "Geometric Shapes"))
    
    # 杂项符号
    ranges.append((0x2600, 0x26FF, "Miscellaneous Symbols"))
    
    # 装饰符号
    ranges.append((0x2700, 0x27BF, "Dingbats"))
    
    # CJK 符号和标点
    ranges.append((0x3000, 0x303F, "CJK Symbols and Punctuation"))
    
    # 平假名
    ranges.append((0x3040, 0x309F, "Hiragana"))
    
    # 片假名
    ranges.append((0x30A0, 0x30FF, "Katakana"))
    
    # 注音符号
    ranges.append((0x3100, 0x312F, "Bopomofo"))
    
    # CJK 围栏
    ranges.append((0x3190, 0x319F, "Kanbun"))
    
    # CJK 兼容
    ranges.append((0x3300, 0x33FF, "CJK Compatibility"))
    
    # CJK 统一汉字 - 按 256 个码位一组分片
    # U+4E00 到 U+9FFF (CJK Unified Ideographs)
    for start in range(0x4E00, 0xA000, 0x100):
        end = min(start + 0xFF, 0x9FFF)
        ranges.append((start, end, f"CJK Unified Ideographs {start:04X}-{end:04X}"))
    
    # CJK 兼容汉字
    ranges.append((0xF900, 0xFAFF, "CJK Compatibility Ideographs"))
    
    # 半角和全角形式
    ranges.append((0xFF00, 0xFFEF, "Halfwidth and Fullwidth Forms"))
    
    # CJK 统一汉字扩展A
    ranges.append((0x3400, 0x4DBF, "CJK Unified Ideographs Extension A"))
    
    # CJK 统一汉字扩展B 及以后 - 按 256 分片
    for start in range(0x20000, 0x2A700, 0x100):
        end = min(start + 0xFF, 0x2A6D6)
        ranges.append((start, end, f"CJK Extension B+ {start:04X}-{end:04X}"))
    
    return ranges


def get_font_cmap(font_path):
    """获取字体中实际包含的码位集合"""
    from fontTools.ttLib import TTFont
    font = TTFont(font_path)
    cmap = set()
    for table in font['cmap'].tables:
        cmap.update(table.cmap.keys())
    font.close()
    return cmap


def split_font(font_info, unicode_ranges, output_dir):
    """对单个字体执行分片"""
    font_file = font_info["file"]
    font_path = FONTS_DIR / font_file
    
    if not font_path.exists():
        print(f"  跳过: {font_file} 不存在")
        return None
    
    # 创建输出目录
    family_slug = font_info["family"].replace(" ", "-").replace("'", "").lower()
    # 对同 family 不同 style 加后缀
    style_suffix = ""
    if font_info["style"] == "italic":
        style_suffix = "-italic"
    out_dir = output_dir / f"{family_slug}{style_suffix}"
    out_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"  处理: {font_file} -> {out_dir.name}/")
    
    # 获取字体的实际码位
    try:
        font_cmap = get_font_cmap(str(font_path))
        print(f"    字体包含 {len(font_cmap)} 个码位")
    except Exception as e:
        print(f"    无法读取字体 cmap: {e}")
        font_cmap = None
    
    css_lines = []
    chunk_index = 0
    
    for start, end, desc in unicode_ranges:
        # 检查这个范围是否有字符在字体中
        if font_cmap is not None:
            chars_in_range = [c for c in font_cmap if start <= c <= end]
            if not chars_in_range:
                continue
        else:
            chars_in_range = None
        
        # 生成 unicode 范围字符串
        if start == end:
            unicode_str = f"U+{start:04X}"
        else:
            unicode_str = f"U+{start:04X}-{end:04X}"
        
        # 输出文件名
        out_file = out_dir / f"{chunk_index:04d}.woff2"
        
        # 构建 pyftsubset 命令
        cmd = [
            "pyftsubset",
            str(font_path),
            f"--unicodes={unicode_str}",
            f"--output-file={out_file}",
            "--flavor=woff2",
            "--layout-features=*",
            "--name-IDs=*",
            "--no-hinting",
            "--desubroutinize",
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            if result.returncode != 0:
                print(f"    警告: 分片 {chunk_index} ({desc}) 失败: {result.stderr[:100]}")
                continue
            
            # 检查输出文件大小，跳过空/极小文件
            file_size = out_file.stat().st_size
            if file_size < 50:  # 小于 50 字节说明没有有效字形
                out_file.unlink()
                continue
            
            # 生成 CSS @font-face
            family_css = font_info["family"]
            # 如果 family 名有空格需要引号
            if " " in family_css:
                family_css = f"'{family_css}'"
            
            css_line = f"@font-face {{\n"
            css_line += f"  font-family: {family_css};\n"
            
            # src: local() 优先, 然后 url()
            src_parts = []
            for local_name in font_info.get("local_names", []):
                src_parts.append(f"local({local_name})")
            src_parts.append(f"url('/fonts/{family_slug}{style_suffix}/{chunk_index:04d}.woff2') format('woff2')")
            css_line += f"  src: {', '.join(src_parts)};\n"
            css_line += f"  unicode-range: {unicode_str};\n"
            
            if font_info["style"] != "normal":
                css_line += f"  font-style: {font_info['style']};\n"
            if font_info["weight"] != "normal":
                css_line += f"  font-weight: {font_info['weight']};\n"
            
            css_line += f"  font-display: swap;\n"
            css_line += f"}}"
            
            css_lines.append(css_line)
            chunk_index += 1
            
        except subprocess.TimeoutExpired:
            print(f"    超时: 分片 {chunk_index} ({desc})")
            continue
        except Exception as e:
            print(f"    错误: 分片 {chunk_index} ({desc}): {e}")
            continue
    
    print(f"    生成 {chunk_index} 个分片")
    
    # 写入 CSS 文件
    css_file = out_dir / "index.css"
    css_content = "\n\n".join(css_lines)
    css_file.write_text(css_content, encoding="utf-8")
    print(f"    CSS 写入: {css_file}")
    
    return out_dir


def main():
    print("=" * 60)
    print("字体分片工具 - Font Splitter")
    print("=" * 60)
    
    output_dir = FONTS_DIR / "split"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    unicode_ranges = generate_unicode_ranges()
    print(f"\nUnicode 分片范围: {len(unicode_ranges)} 个区间\n")
    
    all_css_parts = []
    
    for font_info in FONTS_TO_SPLIT:
        result = split_font(font_info, unicode_ranges, output_dir)
        if result:
            # 读取生成的 CSS
            css_file = result / "index.css"
            if css_file.exists():
                all_css_parts.append(css_file.read_text(encoding="utf-8"))
    
    # 生成合并的 CSS 文件
    combined_css = output_dir / "fonts-split.css"
    combined_css.write_text("\n\n".join(all_css_parts), encoding="utf-8")
    print(f"\n合并 CSS 写入: {combined_css}")
    
    # 统计输出
    total_size = 0
    total_files = 0
    for f in output_dir.rglob("*.woff2"):
        total_size += f.stat().st_size
        total_files += 1
    
    print(f"\n总计: {total_files} 个 woff2 文件, {total_size / 1024 / 1024:.1f} MB")
    print("完成!")


if __name__ == "__main__":
    main()
