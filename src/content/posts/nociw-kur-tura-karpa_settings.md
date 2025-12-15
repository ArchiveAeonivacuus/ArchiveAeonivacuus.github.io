---
title: 星光留影——《我与星光同行》设定集
published: 2025-12-08
description: ''
image: ''
tags: [设定, 怪物猎人, 同人]
category: '我与星光同行'
draft: false 
lang: ''
---

<style>
/* 怪物猎人角色介绍系统 - 改进版 */
.mh-hunter, .mh-other {
  --mh-bg: #f8f5e6;
  --mh-border: #8b4513;
  --mh-label-color: #654321;
  --mh-value-color: #222;
  background: var(--mh-bg);
  border: 2px solid var(--mh-border);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  max-width: 720px;
}

.mh-title {
  color: #8b0000;
  border-bottom: 2px solid #d4af37;
  padding-bottom: 8px;
  margin-bottom: 16px;
  font-size: 1.4em;
  font-weight: bold;
}

/* 统一的左侧标签布局：使用绝对定位的 ::before 保证多行内容对齐 */
.mh-hunter > div:not(.mh-title),
.mh-other > div:not(.mh-title) {
  position: relative;
  padding-left: 120px;
  margin: 8px 0;
  color: var(--mh-value-color);
}

.mh-hunter > div:not(.mh-title)::before,
.mh-other > div:not(.mh-title)::before {
  content: attr(data-label) "：";
  color: var(--mh-label-color);
  font-weight: bold;
  position: absolute;
  left: 0;
  top: 0;
  width: 110px;
  display: block;
}

/* 装备：防具作为一个独立框体，位于同一标签列 */
.mh-equipment { }
.mh-equipment .armor-box {
  background:#fff;
  border:1px dashed #cfcfcf;
  padding:10px;
  border-radius:6px;
}
.mh-equipment .armor-box > div {
  margin:6px 0;
}
.mh-equipment .armor-box > div::before {
  content: attr(data-part) "：";
  color: var(--mh-label-color);
  font-weight: bold;
  display: inline-block;
  min-width: 60px;
  margin-right: 8px;
}

/* 连招：第一行与标签同行，后续多行自动对齐 */
.mh-combo {
  background: #fff8dc;
  border-left: 3px solid #ffa500;
  padding: 8px;
  white-space: pre-line;
}

.mh-description {
  border-top: 1px dashed #8b4513;
  padding-top: 12px;
  margin-top: 16px;
  line-height: 1.5;
}

/* 怪物表格封装样式 */
.mh-monster-table { border-collapse: collapse; width: 100%; }
.mh-monster-table th, .mh-monster-table td { border:1px solid #ddd; padding:8px; vertical-align: top; }
.mh-monster-table thead th { background:#f3f3f3; }
.monster-name { line-height:1.15; }
.monster-name .cn { font-weight:700; }
.monster-name .jp { font-family: 'Source Han Serif JP', serif; color:#444; font-size:0.95em; }
.monster-tag { display:inline-block; width:10px; height:10px; border-radius:2px; margin-left:8px; vertical-align:middle; }
.tag-large { background:#000; }
.tag-small { background:#9e9e9e; }
.tag-elder { background:#3b82f6; }
.tag-special { background:#ef4444; }

</style>

# 本篇仍在施工中！！！

# <span style="font-family: 'Source Han Serif JP'">ノチウ　コㇿ　ラムニンカ</span>
# nociw kor ramuninka
# 星光留影——《我与星光同行》设定集

在小说写作过程中，为作记录，开设本设定集。随着小说写作，本设定集会得到持续更新。这种更新包括但不限于：

- 对某条目的更新
- 增加新条目
- 增加新分类

也欢迎大家根据小说设定集，或是《怪物猎人 世界》和冰原DLC的内容来捉虫！有的内容是经过考量后修改的，应该会在后面注明为什么这么修改；而有的内容则可能单纯是鲁鱼亥豕，或是记忆模糊造成的差错，更有甚者还可能是严重的事实错误等，还请多包涵。期待斧正！

## 人物

1.  <b>雪泽 阿部缘（<span style="font-family: 'Source Han Serif JP'"><ruby>雪沢<rt>ゆきさわ</rt></ruby> <ruby>阿部縁<rt>アペフチ</rt></ruby></span>）</b>
<div class="mh-hunter">
  <div data-label="出身地">仁汨村</div>
  <div data-label="种族">人类</div>
  <div data-label="武器类型">太刀</div>
  <div data-label="武器">飞龙刀【朱】</div>
  <div class="mh-equipment" data-label="装备">
    <div class="armor-box">
      <div data-part="头甲">火龙S头盔</div>
      <div data-part="胸甲">火龙S铠甲</div>
      <div data-part="腕甲">火龙S腕甲</div>
      <div data-part="腰甲">火龙S腰甲</div>
      <div data-part="腿甲">火龙S腿甲</div>
    </div>
  </div>
  <div class="mh-combo" data-label="连招">纵斩连段<br>（气刃值）气刃三连斩连段<br>回避—（精回）武士道气刃无双斩连段<br>（勇气）弱勇气刚气刃斩连段<br>勇气纳刀连段</div>
  <div class="mh-description" data-label="人物介绍">小说主角。</div>
</div>
    
2.  <b>平泽 池荣怒（<span style="font-family: 'Source Han Serif JP'"><ruby>平沢<rt>ひらさわ</rt></ruby> <ruby>池容怒<rt>チロンヌㇷ゚</rt></ruby></span>）</b>
<div class="mh-other">
  <div data-label="出身地">仁汨村</div>
  <div data-label="种族">人类</div>
  <div data-label="职业">随行调查员</div>
  <div class="mh-description" data-label="人物介绍">调查时也进行物资采集的工作，来到新大陆后成为了接待员。原先当过骑士，但随行兽蓝速龙被斩龙杀死了。</div>
</div>

3.  <b>明日利玛（<span style="font-family: 'Source Han Serif JP'"><ruby>明日利瑪<rt>アシㇼパ</rt></ruby></span>）</b>
<div class="mh-hunter">
  <div data-label="出身地">阿里村</div>
  <div data-label="种族">人类</div>
  <div data-label="武器类型">未设定</div>
  <div data-label="武器">未设定</div>
  <div class="mh-equipment" data-label="装备">
    <div class="armor-box">
      <div data-part="头甲">未设定</div>
      <div data-part="胸甲">未设定</div>
      <div data-part="腕甲">未设定</div>
      <div data-part="腰甲">未设定</div>
      <div data-part="腿甲">未设定</div>
    </div>
  </div>
  <div class="mh-combo" data-label="连招">未设定</div>
  <div class="mh-description" data-label="人物介绍">雪泽阿部缘的教官。是一名老猎人。</div>
</div>

4.  <b>“天上来的第五期团”</b> 也就是MHW:I中的主角苍蓝星。

5.  <b>一之濑 唯（<span style="font-family: 'Source Han Serif JP'"><ruby>一之瀬<rt>いちのせ</rt></ruby> <ruby>唯<rt>ゆい</rt></ruby></span>）</b>
<div class="mh-hunter">
  <div data-label="出身地">莫加村</div>
  <div data-label="种族">人类</div>
  <div data-label="武器类型">铳枪</div>
  <div data-label="武器">雷铳枪海龙</div>
  <div class="mh-equipment" data-label="装备">
    <div class="armor-box">
      <div data-part="头甲">海龙S头盔</div>
      <div data-part="胸甲">海龙S铠甲</div>
      <div data-part="腕甲">海龙S腕甲</div>
      <div data-part="腰甲">海龙S腰甲</div>
      <div data-part="腿甲">海龙S腿甲</div>
    </div>
  </div>
  <div class="mh-combo" data-label="连招">突刺下砸连段<br>炮击连段<br>龙击炮连段<br>蓄力炮击连段<br>（月震值）深海月震击连段</div>
  <div class="mh-description" data-label="人物介绍">新大陆古龙调查团猎人，是雪泽阿部缘和平泽池荣怒的舍友。来自莫家村，擅长使用铳枪进行水战。攻击能够积攒月震值发动“深海月震击连段”。</div>
</div>

6.  <b>竹内琴音（<span style="font-family: 'Source Han Serif JP'"><ruby>竹内<rt>たけうち</rt></ruby> <ruby>琴音<rt>おとね</rt></ruby></span>）</b>
<div class="mh-hunter">
  <div data-label="出身地">未知</div>
  <div data-label="种族">人类</div>
  <div data-label="武器类型">盾斧</div>
  <div data-label="武器">未设定</div>
  <div class="mh-equipment" data-label="装备">
    <div class="armor-box">
      <div data-part="头甲">未设定</div>
      <div data-part="胸甲">未设定</div>
      <div data-part="腕甲">未设定</div>
      <div data-part="腰甲">未设定</div>
      <div data-part="腿甲">未设定</div>
    </div>
  </div>
  <div class="mh-combo" data-label="连招">未设定</div>
  <div class="mh-description" data-label="人物介绍">新大陆古龙调查团猎人，猎人登记地点是旧大陆的东多尔玛，出身哪个村就不知道了。</div>
</div>

7.  <b>言渊</b>
<div class="mh-hunter">
  <div data-label="出身地">龙通村</div>
  <div data-label="种族">人类</div>
  <div data-label="武器类型">弓箭</div>
  <div data-label="武器">未设定</div>
  <div class="mh-equipment" data-label="装备">
    <div class="armor-box">
      <div data-part="头甲">未设定</div>
      <div data-part="胸甲">未设定</div>
      <div data-part="腕甲">未设定</div>
      <div data-part="腰甲">未设定</div>
      <div data-part="腿甲">未设定</div>
    </div>
  </div>
  <div class="mh-combo" data-label="连招">未设定</div>
  <div class="mh-description" data-label="人物介绍">新大陆古龙调查团猎人，黑发灰眼，穿着长袍，比较东方。</div>
</div>

8.  <b>希恩·拉法叶尔（Siœn Raphaël）</b>
<div class="mh-hunter">
  <div data-label="出身地">埃尔迦德</div>
  <div data-label="种族">人类</div>
  <div data-label="武器类型">大剑/太刀</div>
  <div data-label="武器">冷冻旗鱼</div>
  <div class="mh-equipment" data-label="装备">
    <div class="armor-box">
      <div data-part="头甲">蔷薇头饰alpha</div>
      <div data-part="胸甲">蔷薇服装alpha</div>
      <div data-part="腕甲">蔷薇腕甲alpha</div>
      <div data-part="腰甲">蔷薇皮带alpha</div>
      <div data-part="腿甲">蔷薇靴alpha</div>
    </div>
  </div>
  <div class="mh-combo" data-label="连招">真·蓄力斩连段<br>飞身跃入斩连段<br>神岚拖刀三连斩连段</div>
  <div class="mh-description" data-label="人物介绍">新大陆古龙调查团猎人，黑发灰眼，穿着长袍，比较东方。</div>
</div>

9.  <b>“调查组组长” 扎伊德·戈登（Zaid Gordon）</b>
<div class="mh-hunter">
  <div data-label="出身地">新大陆</div>
  <div data-label="种族">人类</div>
  <div data-label="武器类型">大剑</div>
  <div data-label="武器">龙颚剑</div>
  <div class="mh-equipment" data-label="装备">
    <div class="armor-box">
      <div data-part="头甲">未设定</div>
      <div data-part="胸甲">未设定</div>
      <div data-part="腕甲">未设定</div>
      <div data-part="腰甲">未设定</div>
      <div data-part="腿甲">未设定</div>
    </div>
  </div>
  <div class="mh-combo" data-label="连招">真·蓄力斩连段<br>飞身跃入斩连段</div>
  <div class="mh-description" data-label="人物介绍">新大陆古龙调查团猎人，也就是游戏里的调查组组长其人。</div>
</div>

10.   蕾姆·帕克林（Rem Pakline）
<div class="mh-hunter">
  <div data-label="出身地">新大陆</div>
  <div data-label="种族">人类</div>
  <div data-label="武器类型">大剑</div>
  <div data-label="武器">防卫队炎刃型大剑2</div>
  <div class="mh-equipment" data-label="装备">
    <div class="armor-box">
      <div data-part="头甲">封印的龙骸布</div>
      <div data-part="胸甲">惨爪alpha</div>
      <div data-part="腕甲">未设定</div>
      <div data-part="腰甲">未设定</div>
      <div data-part="腿甲">未设定</div>
    </div>
  </div>
  <div class="mh-combo" data-label="连招">真·蓄力斩连段<br>飞身跃入斩连段</div>
  <div class="mh-description" data-label="人物介绍">新大陆古龙调查团猎人，女性，穿着清凉。是阿部缘在新大陆的启蒙导师。</div>
</div>

## 怪物

1.  <b>毁灭仁汨村的斩龙</b> 暂定是一头不明原因发狂的护死灭刃斩龙，是斩龙的唯一高度特化特殊个体。

2.  <b>阿里村附近的怪物</b> 其中<span style="color: #0075ff">蓝色</span>表示古龙，<span style="color: #ff0000">红色</span>表示特殊个体。

<table style="border-collapse: collapse;">
  <thead>
    <tr>
      <th>名称/出现怪物</th>
      <th>下位</th>
      <th>上位</th>
      <th>G位</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="7">迩岱空部森林<br><span style="font-family: 'Source Han Serif JP'"><ruby>迩岱空部<rt>ニタイカㇻペ</rt></ruby>の森</span></td>
      <td>蓝速龙王<br><span style="font-family: 'Source Han Serif JP'">ドスランポス</span></td>
      <td>雷狼龙<br><span style="font-family: 'Source Han Serif JP'">雷狼竜ジンオウガ</span></td>
      <td>斩翼鸟<br><span style="font-family: 'Source Han Serif JP'">斬翼鳥タララヤック</span></td>
    </tr>
    <tr>
      <td>青熊兽<br><span style="font-family: 'Source Han Serif JP'">青熊獣アオアシラ</span></td>
      <td>樱火龙<br><span style="font-family: 'Source Han Serif JP'">桜火竜リオレイア亜種</span></td>
      <td>茶兔兽<br><span style="font-family: 'Source Han Serif JP'">茶兎獣ウルクスス亜種</span></td>
    </tr>
    <tr>
      <td>吼鹿<br><span style="font-family: 'Source Han Serif JP'">吼鹿エケルギツ</span></td>
      <td>毒矢武将蟹<br><span style="font-family: 'Source Han Serif JP'">毒矢蟹ブショウイザミ亜種</span></td>
      <td>茶熊兽<br><span style="font-family: 'Source Han Serif JP'">茶熊獣アオアシラ希少種</span></td>
    </tr>
    <tr>
      <td>舌毒蜗<br><span style="font-family: 'Source Han Serif JP'">舌毒蝸トクシマキマ</span></td>
      <td>浓舌蜗<br><span style="font-family: 'Source Han Serif JP'">濃舌蝸トクシマキマ亜種</span></td>
      <td>迅龙<br><span style="font-family: 'Source Han Serif JP'">迅竜ナルガクルガ</span></td>
    </tr>
    <tr>
      <td>泡狐龙<br><span style="font-family: 'Source Han Serif JP'">泡狐竜タマミツネ</span></td>
      <td><span style="color: #0075ff">霞龙<br><span style="font-family: 'Source Han Serif JP'">霞龍オオナズチ</span></span></td>
      <td>绿迅龙<br><span style="font-family: 'Source Han Serif JP'">緑迅竜ナルガクルガ亜種</span></td>
    </tr>
    <tr>
      <td>武将矢蟹<br><span style="font-family: 'Source Han Serif JP'">矢蟹ブショウイザミ</span></td>
      <td></td>
      <td><span style="color: #0075ff">火神龙<br><span style="font-family: 'Source Han Serif JP'">火神龍アペフチ・カムイ</span></span></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td>守望火神龙<br><span style="font-family: 'Source Han Serif JP'">インカルン・アペフチ・カムイ</span></td>
    </tr>
    <tr>
      <td rowspan="8">卯桥留山部雪原<br><span style="font-family: 'Source Han Serif JP'"><ruby>卯橋留山部<rt>ウパㇱルヤンペ</rt></ruby>雪原</span></td>
      <td>白熊兽<br><span style="font-family: 'Source Han Serif JP'">白熊獣アオアシラ亜種</span></td>
      <td>雹狐龙<br><span style="font-family: 'Source Han Serif JP'">雹狐竜タマミツネ亜種</span></td>
      <td>碎铳鹿<br><span style="font-family: 'Source Han Serif JP'">砕銃鹿エケエクス希少種</span></td>
    </tr>
    <tr>
      <td>丹首鸟<br><span style="font-family: 'Source Han Serif JP'">丹首鳥グルスハケ</span></td>
      <td>霙刃龙<br><span style="font-family: 'Source Han Serif JP'">霙刃竜セレルギオス亜種</span></td>
      <td>狱狼龙<br><span style="font-family: 'Source Han Serif JP'">獄狼竜ジンオウガ亜種</span></td>
    </tr>
    <tr>
      <td>冻海兽<br><span style="font-family: 'Source Han Serif JP'">凍海獣ポカラドン</span></td>
      <td>霜锤龙<br><span style="font-family: 'Source Han Serif JP'">霜鎚竜ウラガンキン希少種</span></td>
      <td>雪鬼兽<br><span style="font-family: 'Source Han Serif JP'">雪鬼獣ゴシャハギ</span></td>
    </tr>
    <tr>
      <td>铳鹿<br><span style="font-family: 'Source Han Serif JP'">銃鹿エケエクス</span></td>
      <td>激昂雪狮子<br><span style="font-family: 'Source Han Serif JP'">激昂したドドブランゴ</span></td>
      <td>雪女兽<br><span style="font-family: 'Source Han Serif JP'">雪女獣ゴシャユキア</span></td>
    </tr>
    <tr>
      <td>风漂龙<br><span style="font-family: 'Source Han Serif JP'">風漂竜レイギエナ</span></td>
      <td><span style="color: #0075ff">钢龙<br><span style="font-family: 'Source Han Serif JP'">鋼龍クシャルダオラ</span></span></td>
      <td>巨兽<br><span style="font-family: 'Source Han Serif JP'">巨獣ガムート</span></td>
    </tr>
    <tr>
      <td>冰土砂龙<br><span style="font-family: 'Source Han Serif JP'">氷砕竜ボルボロス亜種</span></td>
      <td><span style="color: #0075ff">杀戟龙<br><span style="font-family: 'Source Han Serif JP'">殺戟龍シャチホコ</span></span></td>
      <td>喙裂丹首鸟<br><span style="font-family: 'Source Han Serif JP'">喙裂けたグルスハケ</span></td>
    </tr>
    <tr>
      <td>雪狮子<br><span style="font-family: 'Source Han Serif JP'">雪獅子ドドブランゴ</span></td>
      <td></td>
      <td><span style="color: #0075ff">麒麟<br><span style="font-family: 'Source Han Serif JP'">幻獣キリン</span></span></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td><span style="color: #0075ff">吹雪龙<br><span style="font-family: 'Source Han Serif JP'">吹雪龍メ・ウウェチ</span></span></td>
    </tr>
    <tr>
      <td rowspan="9">乌美怒振火山<br><span style="font-family: 'Source Han Serif JP'"><ruby>烏美怒振<rt>ウフイヌプリ</rt></ruby>火山</td>
      <td>炎铳鹿<br><span style="font-family: 'Source Han Serif JP'">炎銃鹿エケエクス亜種</span></td>
      <td>火龙<br><span style="font-family: 'Source Han Serif JP'">火竜リオレウス</span></td>
      <td>朱镰将军蟹<br><span style="font-family: 'Source Han Serif JP'">朱鎌蟹ショウグンギザミ亜種</span></td>
    </tr>
    <tr>
      <td>黑首鸟<br><span style="font-family: 'Source Han Serif JP'">黒首鳥グルスハケ亜種</span></td>
      <td>苍火龙<br><span style="font-family: 'Source Han Serif JP'">蒼火竜リオレウス亜種</span></td>
      <td>斩龙<br><span style="font-family: 'Source Han Serif JP'">斬竜ディノバルド</span></td>
    </tr>
    <tr>
      <td>爆锤龙<br><span style="font-family: 'Source Han Serif JP'">爆鎚竜ウラガンキン</span></td>
      <td>狱焰蛸<br><span style="font-family: 'Source Han Serif JP'">獄焔蛸ヌ・エグドラ</span></td>
      <td>黑铠龙<br><span style="font-family: 'Source Han Serif JP'">黒鎧竜グラビモス亜種</span></td>
    </tr>
    <tr>
      <td>岩蜗<br><span style="font-family: 'Source Han Serif JP'">岩蝸ルビマキマ</span></td>
      <td><span style="color: #0075ff">炎王龙<br><span style="font-family: 'Source Han Serif JP'">炎王龍テオ・テスカトル</span></span></td>
      <td>金火龙<br><span style="font-family: 'Source Han Serif JP'">金火竜リオレイア希少種</span></td>
    </tr>
    <tr>
      <td>铠龙<br><span style="font-family: 'Source Han Serif JP'">鎧竜グラビモス</span></td>
      <td><span style="color: #0075ff">炎妃龙<br><span style="font-family: 'Source Han Serif JP'">炎妃龍ナナ・テスカトリ</span></span></td>
      <td>银火龙<br><span style="font-family: 'Source Han Serif JP'">銀火竜リオレウス希少種</span></td>
    </tr>
    <tr>
      <td>将军镰蟹<br><span style="font-family: 'Source Han Serif JP'">鎌蟹ショウグンギザミ</span></td>
      <td></td>
      <td><span style="color: #0075ff">幼熔山龙<br><span style="font-family: 'Source Han Serif JP'">幼きゾラ・マグダラオス</span></span></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td><span style="color: #0075ff">姬鬼龙<br><span style="font-family: 'Source Han Serif JP'">姫鬼龍フィジャ・サンクタ</span></span></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td><span style="color: #ff0000">爆炎渊源姬鬼龙<br><span style="font-family: 'Source Han Serif JP'">爆炎の淵源フィジャ・サンクタ</span></span></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td><span style="color: #ff0000">护死灭刃斩龙<br><span style="font-family: 'Source Han Serif JP'">護死滅刃ディノバルド</span></span></td>
    </tr>
    <tr>
      <td rowspan="9">琉绘山沙滩<br><span style="font-family: 'Source Han Serif JP'"><ruby>琉絵山<rt>ルウェサン</rt></ruby>砂浜</span></td>
      <td>啮鱼龙<br><span style="font-family: 'Source Han Serif JP'">噛魚竜アラマキトス</span></td>
      <td>白一角龙<br><span style="font-family: 'Source Han Serif JP'">白一角竜モノブロス亜種</span></td>
      <td>刺鲀龙<br><span style="font-family: 'Source Han Serif JP'">刺魨竜テトラヴァルヌ</span></td>
    </tr>
    <tr>
      <td>大名盾蟹<br><span style="font-family: 'Source Han Serif JP'">盾蟹ダイミョウザザミ</span></td>
      <td>角龙<br><span style="font-family: 'Source Han Serif JP'">角竜ディアブロス</span></td>
      <td>海龙<br><span style="font-family: 'Source Han Serif JP'">海竜ラギアクルス</span></td>
    </tr>
    <tr>
      <td>翔虎鸟<br><span style="font-family: 'Source Han Serif JP'">翔虎鳥ハリリタラサ</span></td>
      <td>千刃龙<br><span style="font-family: 'Source Han Serif JP'">千刃竜セレルギオス</span></td>
      <td>痹蛸<br><span style="font-family: 'Source Han Serif JP'">痺蛸オクエペケセ</span></td>
    </tr>
    <tr>
      <td>一角龙<br><span style="font-family: 'Source Han Serif JP'">一角竜モノブロス</span></td>
      <td>礁龙<br><span style="font-family: 'Source Han Serif JP'">礁竜コラエムプ</span></td>
      <td>玄甲龟<br><span style="font-family: 'Source Han Serif JP'">玄甲亀カラパヴェス</span></td>
    </tr>
    <tr>
      <td>土砂龙<br><span style="font-family: 'Source Han Serif JP'">土砂竜ボルボロス</span></td>
      <td><span style="color: #0075ff">巨鲑龙<br><span style="font-family: 'Source Han Serif JP'">巨鮭龍カムイ・ペカンケル</span></span></td>
      <td>黑角龙<br><span style="font-family: 'Source Han Serif JP'">黒角竜ディアブロス亜種</span></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td>振翼鸟<br><span style="font-family: 'Source Han Serif JP'">振翼鳥タララヤック亜種</span></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td><span style="color: #ff0000">载世巨鲑龙<br><span style="font-family: 'Source Han Serif JP'">世を載せるカムイ・ペカンケル</span></span></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td><span style="color: #0075ff">溟波龙<br><span style="font-family: 'Source Han Serif JP'">溟波龍ネロミェール</span></span></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td><span style="color: #0075ff">古机龙<br><span style="font-family: 'Source Han Serif JP'">古機龍イォンネット</span></span></td>
    </tr>
  </tbody>
</table>

## 地点

1.  <b>仁汨村</b> 被毁灭的村子。雪泽阿部缘和平泽池荣怒的故乡。
   
2.  <b>阿里村</b> 仁汨村的邻村。明日利玛的故乡。雪泽阿部缘和平泽池荣怒幸存下来后被阿里村的猎人小队接到了阿里村。
   
3.  <b>龙通村</b> 以汉族为原型的村子。因为怪猎世界观很缺少汉族名字的设定，所以不得不添加这个。
   
4.  <b>古代树森林</b> 也就是MHW的古代树森林地图。下面是一些具体地名：
> 临海平原：1区的开阔平原。
> 毒蔓草树林：6区的树林。
> 林荫隧道：7区的隧道。
> 藤蔓树林：8区的树林。
> 岩柱瀑布：9区的大斜坡和瀑布。
   

## 连段

在连段说明中，可以看到一些（精回）（招架）的字样。它们分别代表动作的特殊判定，并且满足括号中的判定后才能够继续下面的连招。下面是对这些特殊判定的说明。

- 精回：也叫just回避、j回，在回避无敌时间内受到攻击就可以派生下面的动作。
- 招架：也叫Guard Point、GP，在格挡等无敌时间内受到攻击就可以做出反击或派生下面的动作。
- 耐力：需要消耗耐力。
- 气刃值：需要消耗太刀的气刃值进行发动。
- 气刃槽：需要消耗太刀的气刃槽等级进行发动。
- 受击：受到攻击自动派生，但不是反击等动作。
- 勇气：需要在勇气状态。

### 大剑

1.  <b>蓄力斩连段</b> MHXX/GU以前的大剑基本连段。蓄力斩后横拍，再派生蓄力斩、上捞斩、横扫斩、强蓄力斩等招式的连段。

2.  <b>真·蓄力斩连段</b> MHW以后的大剑基本连段。蓄力斩后既可以派生横拍，又可以派生强蓄力斩的连段。并且可以发动冲撞攻击。最终可以派生真·蓄力斩。

3.  <b>流斩连段</b> MHR:S出现的大剑连段。在三次流斩攻击后可以派生强蓄力斩等动作的连段。
   
4.  <b>神岚拖刀三连斩连段</b> <span style="font-family: 'Source Han Serif JP'">嵐曳三連斬り連携</span> 原创动作。基本动作是上捞斩—后撤拖刀蓄力—拖刀奔跑—颪斩1—颪斩2—岚斩。上捞斩后，能够后撤几步进入拖刀状态，拖刀状态下可蓄力最多三段，蓄满后可以消耗耐力进行拖刀奔跑。停止持续蓄力状态后可以打出神岚拖刀三连斩：先紧握刀身横砍两圈，再借助惯性跳起，重重砸在怪物身上。

5. <b>飞身跃入横扫斩连段</b> 大概是MHW出现的连段。回避后可以立即使出飞身跃入横扫斩。

### 太刀

1.  <b>纵斩连段</b> MH初代就有的基本连段。基本动作是纵斩—直斩—突刺—上挑。中间可以穿插袈裟斩，也可以跳过直斩等。
   
2.  <b>气刃三连斩连段</b> MH2dos的太刀气刃斩连段。基本动作是气刃斩1—气刃斩2—气刃三连斩。消耗气刃值打出强力的气刃斩攻击。以气刃三连斩收尾。
   
3.  <b>气刃大回旋连段</b> MHP3加入的太刀气刃斩连段。基本动作是气刃斩1—气刃斩2—气刃三连斩—气刃大回旋。气刃大回旋强制收刀，打中后可以提升气刃槽等级。

4.  <b>气刃无双斩连段</b> MHX/Ge的太刀气刃斩连段。基本动作是气刃斩1—气刃斩2—气刃一文字斩—气刃无双斩。打中后可以提升气刃槽等级。
   
5.  <b>武士道气刃无双斩连段</b> MHX/Ge的武士道风格太刀特化气刃无双斩连段。基本动作是（精回）—冲刺—一文字斩—气刃无双斩。打中后可以提升气刃槽等级。
   
6.  <b>刚气刃斩连段</b> MHXX/GU的勇气风格太刀，进入勇气模式后打出的气刃斩连段。气刃斩1—气刃斩2—刚气刃斩2—刚气刃斩3。
   
7.  <b>勇气刚气刃斩连段</b> MHXX/GU的勇气风格太刀，在勇气模式下发动GP打出的连段，基本动作是（GP）—刚气刃斩1—刚气刃斩2—刚气刃斩3。
   
8.  <b>弱勇气刚气刃斩连段</b> 原创动作。是弱化的勇气刚气刃斩连段。基本动作是（GP）—弱刚气刃斩1—气刃一文字斩—气刃无双斩。即使发动刚气刃斩1的GP效果，也只能抵消部分伤害，然后接速度相对较慢的气刃一文字斩和气刃无双斩。
   
9.  <b>飞翔踢连段</b> MHR加入的连段。基本动作是飞翔踢—下坠突刺/（气刃槽）气刃兜割。消耗一层气刃槽。

10. <b>气刃突刺连段</b> MHW加入的爆发输出连段。基本动作是气刃突刺—（气刃槽）气刃兜割。消耗一层气刃槽。

11. <b>炼气解放无双斩连段</b> MHWi加入的爆发输出连段。基本动作是气刃突刺—气刃兜割—炼气解放无双斩。另外有一个特点就是可以在空中收刀，取消这次攻击。

12. <b>特殊纳刀连段</b> MHW:I加入的连段。基本动作是特殊纳刀—拔刀二连斩/（气刃槽）拔刀气刃斩，俗称“居合斩”。在拔刀的一瞬间有无敌判定。如果判定成功还可以不消耗气刃槽等级，并且可以且仅可以派生气刃突刺。
    
13. <b>连续特殊纳刀连段</b> MHR加强的特殊纳刀连段。基本动作仍然是特殊纳刀—拔刀二连斩或特殊纳刀—拔刀气刃斩。在拔刀的一瞬间有无敌判定。如果拔刀气刃斩无敌判定成功还可以提升气刃槽等级，并追加三次攻击，还可以继续派生特殊纳刀。
    
14. <b>勇气纳刀连段</b> MHXX/GU的勇气风格连段。基本动作是勇气纳刀—（受击）勇气回避，如果未受到攻击则可以是勇气纳刀—勇气拔刀一文字斩/勇气拔刀袈裟斩/勇气拔刀气刃斩。勇气拔刀攻击击中怪物可以较大幅度地积攒勇气值。

### 铳枪

1.  <b>突刺连段</b> MH2dos时的连段。基本动作是前进突刺—突刺—突刺。 

2.  <b>突刺下砸连段</b> MHP3以后的连段。在几次突刺后会派生下砸，然后可以全弹发射。基本动作是前进突刺—突刺—突刺—下砸—全弹发射。
   
3.  <b>炮击连段</b> 可以连续炮击的连段。也可以和突刺下砸连段交错使用。
   
4.  <b>上挑下砸连段</b> 上挑后直接下砸的连段。基本动作是上挑—下砸—强力横扫斩。
   
5.  <b>龙击炮连段</b> MH2dos就存在的，可以蹲下发射龙击炮的连段。

6.  <b>龙杭炮连段</b> MHW加入的新连段。可以在强力横扫斩后打出龙杭炮。

7.  <b>蓄力炮击连段</b> MHP3加入的连段。可以蓄力炮击，蓄力炮击后还可以快速装填弹药。

8.  <b>深海月震击连段</b> <span style="font-family: 'Source Han Serif JP'">深海月震撃連携</span> 原创动作。灵感来自大海龙跃出水面的动作。基本动作是下砸—（月震值）新月踢—深海月震击。精准防御可以积攒月震值，月震值满后可以在下砸后派生新月踢，将铳枪狠狠插在地上，然后全力起跳，在空中朝着地面发射一发把猎人炸起来，用盾牌重重砸在怪物身上起跳，没有继续派生则会落地。新月踢后可派生深海月震击，在空中甩一下铳枪快速装弹，下落时将铳枪重重扎到怪物身上，进行全弹+龙击炮射击后，挥起铳枪下砸，后跳落地。

9.  <b>遮刺连段</b> <span style="font-family: 'Source Han Serif JP'">遮り突き連携</span> 原创动作。基本动作是防御突刺—位移遮刺。在防御突刺后可以刺向怪物，然后用盾牌击打怪物向后跳开。也可以向左向右位移。

## 一些细节

### 武器和用具等

1.  <b>飞翔爪和投射器</b> 飞翔爪抓在怪物身上后，需要按收索钮收紧绳子来攀附到怪物身上。投射器分为单发和全弹发射两种模式，通过转动快慢机切换。另外，软化的具体原理是通过给怪物造成伤口来增加对这个部位的攻击力。

2.  <b>气刃和气刃槽</b> 太刀上或隐或显，会有气刃槽结构，攻击获得的气刃值储存在这里。另外气刃槽等级升高后会发出不同颜色的光。

3. <b>消耗品的设定</b> 诸如砥石、捕虫网、矿镐等，在旧大陆都是要自己准备的。而在新大陆古龙调查团，制式砥石、制式捕虫网、制式矿镐等，连同制式的道具袋一同由调查团统一发放，放在道具袋统一的位置。后来这种制度也随着黑龙的讨伐传回了旧大陆。

4. <b>导虫笼</b> 导虫笼是新大陆古龙调查团统一配发的，据传是总司令所发明。需要追踪怪物时，可以将捡到的样本夹在样本夹上，导虫就会追踪怪物。其他事项同理。 

5. <b>狩猎中的吃吃喝喝</b> 各种包装实际上都是使用生物材料制作的，扔在环境中就可以讲解。你也不想狩猎的时候还要收拾垃圾吧？另外，刚来新大陆的猎人可能还不习惯跑步喝药的作风。每个人都有自己的习惯——站着吃药吃得快，跑着吃药比较安全。
  
### 住宿

1. <b>新大陆古龙调查团的宿舍</b> 标准的是三人间，一般情况下有三张西式床具，还有武器架、道具箱等陈设。也有一些生活用具。