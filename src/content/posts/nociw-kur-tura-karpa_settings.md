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
/* 怪物猎人角色介绍系统 */
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
  max-width: 600px;
}

.mh-title {
  color: #8b0000;
  border-bottom: 2px solid #d4af37;
  padding-bottom: 8px;
  margin-bottom: 16px;
  font-size: 1.4em;
  font-weight: bold;
}

/* 猎人专用标签生成 */
.mh-hunter > div:not(.mh-title)::before {
  content: attr(data-label) "：";
  color: var(--mh-label-color);
  font-weight: bold;
  display: inline-block;
  min-width: 100px;
}

.mh-hunter > div:not(.mh-title) {
  color: var(--mh-value-color);
  margin: 8px 0;
  padding-left: 10px;
}

/* 装备部分特殊处理 */
.mh-hunter .mh-equipment {
  margin-top: 8px;
  padding-left: 110px; /* 对齐其他字段 */
}

.mh-hunter .mh-equipment::before {
  content: "装备" "：";
  color: var(--mh-label-color);
  font-weight: bold;
  position: absolute;
  margin-left: -110px;
  min-width: 100px;
}

.mh-equipment > div::before {
  content: attr(data-part) "：";
  color: var(--mh-label-color);
  font-weight: bold;
  display: inline-block;
  min-width: 50px;
  margin-right: 8px;
}

.mh-combo {
  background: #fff8dc;
  border-left: 3px solid #ffa500;
  padding: 8px;
  margin: 8px 0 8px 110px;
}

.mh-description {
  border-top: 1px dashed #8b4513;
  padding-top: 12px;
  margin-top: 16px;
  line-height: 1.5;
}

/* 其他人物专用标签生成 */
.mh-other > div:not(.mh-title)::before {
  content: attr(data-label) "：";
  color: var(--mh-label-color);
  font-weight: bold;
  display: inline-block;
  min-width: 80px;
}

.mh-other > div:not(.mh-title) {
  color: var(--mh-value-color);
  margin: 8px 0;
  padding-left: 10px;
}

</style>

# 本篇仍在施工中！！！

# ノチウ　コㇿ　ラムニンカ
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
  <div class="mh-equipment">
    <div data-part="头甲">火龙S头盔</div>
    <div data-part="胸甲">火龙S铠甲</div>
    <div data-part="腕甲">火龙S腕甲</div>
    <div data-part="腰甲">火龙S腰甲</div>
    <div data-part="腿甲">火龙S腿甲</div>
  </div>
  <div data-label="武器">飞龙刀【朱】</div>
  <div class="mh-combo" data-label="连招">纵斩连段<br>气刃三连斩连段（气刃值）<br>回避（精回）—武士道气刃无双斩连段<br>勇气状态后：刚气刃斩1（招架）—勇气气刃无双斩连段|此连段中，刚气刃斩1只能减弱伤害，不能完全免除。</div>
  <div class="mh-description">小说主角。</div>
</div>
    
1.  <b>平泽 池荣怒（<span style="font-family: 'Source Han Serif JP'"><ruby>平沢<rt>ひらさわ</rt></ruby> <ruby>池容怒<rt>チロンヌㇷ゚</rt></ruby></span>）</b>
<div class="mh-other">
  <div data-label="出身地">仁汨村</div>
  <div data-label="种族">人类</div>
  <div data-label="职业">随行调查员</div>
  <div class="mh-description">调查时也进行物资采集的工作，来到新大陆后成为了接待员。原先当过骑士，但随行兽蓝速龙被斩龙杀死了。</div>
</div>

## 连段

在连段说明中，可以看到一些（精回）（招架）的字样。它们分别代表动作的特殊判定，并且满足括号中的判定后才能够继续下面的连招。下面是对这些特殊判定的说明。

- 精回：也叫just回避、j回，在回避无敌时间内受到攻击就可以派生下面的动作。
- 招架：也叫Guard Point、GP，在格挡等无敌时间内受到攻击就可以做出反击或派生下面的动作。
- 耐力：需要消耗耐力。
- 气刃值：需要消耗太刀的气刃值进行发动。
- 气刃槽：需要消耗太刀的气刃槽等级进行发动。

### 大剑

1.  <b>蓄力斩连段</b>

2.  <b>真·蓄力斩连段</b>

3.  <b>流斩连段</b>
   
4.  <b>神岚拖刀三连斩连段</b> 

### 太刀

1.  <b>纵斩连段</b>
   
2.  <b>气刃三连斩连段</b>
   
3.  <b>气刃大回旋连段</b>

4.  <b>气刃无双斩连段</b>
   
5.  <b>武士道气刃无双斩连段</b>
   
6.  <b>刚气刃斩连段</b>
   
7.  <b>勇气刚气刃斩连段</b>
   
8.  <b>勇气气刃无双斩连段</b>
   
9.  <b>飞翔踢连段</b>

10. <b>气刃突刺连段</b>

11. <b>炼气解放无双斩连段</b>

### 片手剑

### 双剑

### 大锤

### 狩猎笛

### 长枪

### 铳枪

1.  <b>突刺下砸连段</b>
   
2.  <b>突刺连段</b>
   
3.  <b>上挑下砸连段</b>
   
4.  <b>深海月震击连段</b>

5.  <b>防刺连段</b>

### 斩斧

### 盾斧

### 操虫棍

### 轻弩

### 重弩

### 弓箭

## 动作