import { register } from "./lifecycle";

type FieldKey = "word" | "pos" | "phonetic" | "notes" | "meaning";
type FieldFilter = "all" | FieldKey;
type SortKey = "word-asc" | "word-desc" | "meaning-asc" | "pos-asc" | "length-asc";

interface Run {
  text: string;
  style: string | null;
}

interface Entry {
  word: string;
  pos: string;
  phonetic: string;
  notes: string;
  meaning: string;
  rowStyle?: string | null;
  runs?: Partial<Record<FieldKey, Run[]>>;
}

interface LanguageData {
  id: string;
  name: string;
  native: string;
  nativeClass?: string;
  wordClass?: string;
  description: string;
  columnStyles?: Partial<Record<FieldKey, string>>;
  fields: { key: FieldKey; label: string }[];
  stats: { entries: number; uniqueWords: number; pos: number; notes: number };
  pos: { value: string; count: number }[];
  entries: Entry[];
}

interface LanguageMeta {
  id: string;
  name: string;
  native: string;
  nativeClass?: string;
  wordClass?: string;
  description: string;
  count: number;
  file: string;
}

interface LexiconIndex {
  languages: LanguageMeta[];
  total: number;
}

interface SearchRow {
  entry: Entry;
  folded: Record<FieldFilter, string>;
}

const PAGE_SIZE = 50;
const FIELD_KEYS: FieldKey[] = ["word", "phonetic", "pos", "meaning", "notes"];
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "word-asc", label: "词形 A → Z" },
  { value: "word-desc", label: "词形 Z → A" },
  { value: "meaning-asc", label: "释义" },
  { value: "pos-asc", label: "词性" },
  { value: "length-asc", label: "词形长度" },
];

const STYLE_CLASSES: Record<string, string> = {
  ja: "ff-ja",
  kr: "ff-kr",
  "old-ja": "ff-ja_old",
  ong: "ff-ong",
  en: "ff-en",
  ar: "ff-ar",
  rom: "ff-rom",
  zh: "ff-zh_cn",
  "zh-tw": "ff-zh_tw",
  "old-cjk": "ff-cjk_old",
  lxgw: "ff-lxgw",
  kai: "ff-kai",
  mincho: "ff-min",
};

function styleClass(style: string): string {
  return STYLE_CLASSES[style] ?? (style.startsWith("ff-") ? style : `ff-${style}`);
}

const SPECIAL_FOLDS: [RegExp, string][] = [  [/[ƿǷ]/g, "w"],
  [/ı/g, "i"],
  [/ſ/g, "s"],
  [/æ/g, "ae"],
  [/œ/g, "oe"],
  [/þ/g, "th"],
  [/ð/g, "d"],
  [/ŋ/g, "ng"],
  [/ꞅ/g, "s"],
  [/ƀ/g, "b"],
  [/ȝ/g, "g"],
  [/ƕ/g, "hv"],
];

function fold(input: string): string {
  let value = input.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  for (const [pattern, replacement] of SPECIAL_FOLDS) value = value.replace(pattern, replacement);
  return value;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text: string, tokens: string[]): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const active = tokens.filter(Boolean).sort((a, b) => b.length - a.length);
  if (active.length === 0) {
    fragment.append(text);
    return fragment;
  }
  const pattern = new RegExp(`(${active.map(escapeRegExp).join("|")})`, "gi");
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) fragment.append(text.slice(last, match.index));
    const mark = document.createElement("mark");
    mark.textContent = match[0];
    fragment.append(mark);
    last = match.index + match[0].length;
    if (match[0].length === 0) pattern.lastIndex += 1;
  }
  if (last < text.length) fragment.append(text.slice(last));
  return fragment;
}

function renderRuns(
  target: HTMLElement,
  entry: Entry,
  field: FieldKey,
  tokens: string[],
  fallback: string,
  columnStyle?: string | null,
): void {
  const runs = entry.runs?.[field] ?? [{ text: entry[field] || fallback, style: null }];
  const baseStyle = entry.rowStyle ?? columnStyle ?? null;
  for (const run of runs) {
    const style = run.style ?? baseStyle;
    if (style) {
      const span = document.createElement("span");
      span.className = styleClass(style);
      span.append(highlight(run.text, tokens));
      target.append(span);
    } else {
      target.append(highlight(run.text, tokens));
    }
  }
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`${url} -> ${response.status}`);
  return (await response.json()) as T;
}

export function mountLexicon(): void {
  const app = document.querySelector<HTMLElement>("#lexicon-app");
  if (!app || app.dataset.mounted === "true") return;
  app.dataset.mounted = "true";
  const root: HTMLElement = app;

  const controller = new AbortController();
  register(() => controller.abort());

  const state = {
    index: null as LexiconIndex | null,
    data: null as LanguageData | null,
    rows: [] as SearchRow[],
    lang: "",
    query: "",
    field: "all" as FieldFilter,
    pos: "all",
    sort: "word-asc" as SortKey,
    page: 1,
  };
  const cache = new Map<string, LanguageData>();
  let activeEntry: Entry | null = null;
  let searchTimer = 0;

  root.innerHTML = `
    <div class="lex-loading" id="lex-loading" role="status">
      <div class="lex-skeleton lex-skeleton-head"></div>
      <div class="lex-skeleton-row"></div>
      <div class="lex-skeleton-row"></div>
      <div class="lex-skeleton-row"></div>
      <div class="lex-skeleton-row"></div>
    </div>
    <div id="lex-content" hidden>
      <div class="lex-langbar">
        <div class="lex-langs" id="lex-langs" role="tablist" aria-label="语言"></div>
        <div class="lex-stats" id="lex-stats"></div>
      </div>
      <p class="lex-lang-note" id="lex-lang-note" hidden></p>
      <div class="lex-toolbar">
        <label class="lex-search" for="lex-q">
          <span class="lex-search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10.8" cy="10.8" r="6.3"></circle><path d="m15.5 15.5 4.2 4.2"></path></svg>
          </span>
          <input id="lex-q" type="search" autocomplete="off" spellcheck="false" placeholder="搜索词形、读音、释义或注释…" aria-label="搜索词表" />
          <button id="lex-clear" class="lex-clear" type="button" aria-label="清空搜索" hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m7 7 10 10M17 7 7 17"></path></svg>
          </button>
        </label>
        <label class="lex-select"><span>字段</span><select id="lex-field" aria-label="搜索字段"></select></label>
        <label class="lex-select"><span>排序</span><select id="lex-sort" aria-label="排序方式"></select></label>
      </div>
      <div class="lex-posbar" id="lex-pos" role="group" aria-label="按词性筛选"></div>
      <div class="lex-summary"><span id="lex-count" aria-live="polite"></span><span id="lex-hint">按 <kbd>/</kbd> 键跳到搜索框；点击词条查看详情</span></div>
      <div class="lex-table-wrap" id="lex-table-wrap">
        <table class="lex-table">
          <thead id="lex-head"><tr></tr></thead>
          <tbody id="lex-body"></tbody>
        </table>
      </div>
      <div class="lex-empty" id="lex-empty" hidden>
        <span class="lex-empty-glyph" aria-hidden="true">ƿ</span>
        <strong>没有找到匹配的词条</strong>
        <span>换一个关键词，或清除当前筛选。</span>
        <button class="lex-button" id="lex-reset" type="button">清除筛选</button>
      </div>
      <nav class="lex-pager" id="lex-pager" aria-label="词表分页"></nav>
    </div>
    <dialog class="lex-dialog" id="lex-dialog">
      <div class="lex-dialog-card">
        <button class="lex-dialog-close" id="lex-dialog-close" type="button" aria-label="关闭">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 6 12 12M18 6 6 18"></path></svg>
        </button>
        <p class="lex-dialog-kicker">LEXICON ENTRY</p>
        <h3 id="lex-dialog-word"></h3>
        <p class="lex-dialog-phon" id="lex-dialog-phon"></p>
        <span class="lex-pos-badge" id="lex-dialog-pos"></span>
        <p class="lex-dialog-meaning" id="lex-dialog-meaning"></p>
        <div class="lex-dialog-notes" id="lex-dialog-notes"></div>
        <button class="lex-button lex-copy" id="lex-copy" type="button">复制词条</button>
      </div>
    </dialog>
  `;

  function get<T extends Element>(selector: string): T {
    const node = root.querySelector(selector);
    if (!node) throw new Error(`lexicon: missing ${selector}`);
    return node as T;
  }

  const ui = {
    loading: get<HTMLElement>("#lex-loading"),
    content: get<HTMLElement>("#lex-content"),
    langs: get<HTMLElement>("#lex-langs"),
    stats: get<HTMLElement>("#lex-stats"),
    langNote: get<HTMLElement>("#lex-lang-note"),
    search: get<HTMLInputElement>("#lex-q"),
    clear: get<HTMLButtonElement>("#lex-clear"),
    field: get<HTMLSelectElement>("#lex-field"),
    sort: get<HTMLSelectElement>("#lex-sort"),
    posbar: get<HTMLElement>("#lex-pos"),
    count: get<HTMLElement>("#lex-count"),
    tableWrap: get<HTMLElement>("#lex-table-wrap"),
    head: get<HTMLTableSectionElement>("#lex-head"),
    body: get<HTMLTableSectionElement>("#lex-body"),
    empty: get<HTMLElement>("#lex-empty"),
    pager: get<HTMLElement>("#lex-pager"),
    reset: get<HTMLButtonElement>("#lex-reset"),
    dialog: get<HTMLDialogElement>("#lex-dialog"),
    dialogWord: get<HTMLElement>("#lex-dialog-word"),
    dialogPhon: get<HTMLElement>("#lex-dialog-phon"),
    dialogPos: get<HTMLElement>("#lex-dialog-pos"),
    dialogMeaning: get<HTMLElement>("#lex-dialog-meaning"),
    dialogNotes: get<HTMLElement>("#lex-dialog-notes"),
    dialogClose: get<HTMLButtonElement>("#lex-dialog-close"),
    copy: get<HTMLButtonElement>("#lex-copy"),
  };

  function makeRows(data: LanguageData): SearchRow[] {
    return data.entries.map((entry) => {
      const fields: Record<FieldKey, string> = {
        word: entry.word,
        pos: entry.pos,
        phonetic: entry.phonetic,
        notes: entry.notes,
        meaning: entry.meaning,
      };
      const folded = {
        all: fold(FIELD_KEYS.map((key) => fields[key]).join(" ")),
        word: fold(fields.word),
        pos: fold(fields.pos),
        phonetic: fold(fields.phonetic),
        notes: fold(fields.notes),
        meaning: fold(fields.meaning),
      } as Record<FieldFilter, string>;
      return { entry, folded };
    });
  }

  function readUrl(): void {
    const params = new URLSearchParams(location.search);
    state.query = params.get("q") ?? "";
    const field = params.get("field");
    if (field === "all" || (field && FIELD_KEYS.includes(field as FieldKey))) {
      state.field = field as FieldFilter;
    }
    const sort = params.get("sort");
    if (SORT_OPTIONS.some((option) => option.value === sort)) state.sort = sort as SortKey;
    const page = Number(params.get("page") ?? "1");
    state.page = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    state.lang = params.get("lang") ?? "";
    state.pos = params.get("pos") ?? "all";
  }

  function syncUrl(): void {
    const params = new URLSearchParams(location.search);
    const set = (key: string, value: string, fallback: string): void => {
      if (value && value !== fallback) params.set(key, value);
      else params.delete(key);
    };
    set("lang", state.lang, state.index?.languages[0]?.id ?? "");
    set("q", state.query, "");
    set("field", state.field, "all");
    set("pos", state.pos, "all");
    set("sort", state.sort, "word-asc");
    set("page", state.page > 1 ? String(state.page) : "", "");
    const query = params.toString();
    history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}${location.hash}`);
  }

  function renderLanguageTabs(): void {
    if (!state.index) return;
    ui.langs.replaceChildren();
    for (const language of state.index.languages) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "lex-lang";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(language.id === state.lang));
      button.classList.toggle("is-active", language.id === state.lang);
      const name = document.createElement("span");
      name.textContent = language.name;
      button.append(name);
      if (language.native && language.native !== language.name) {
        const native = document.createElement("small");
        native.textContent = language.native;
        if (language.nativeClass) native.className = language.nativeClass;
        button.append(native);
      }
      button.addEventListener("click", () => {
        if (language.id === state.lang) return;
        state.query = "";
        state.field = "all";
        state.pos = "all";
        state.page = 1;
        ui.search.value = "";
        void selectLanguage(language.id);
      }, { signal: controller.signal });
      ui.langs.append(button);
    }
  }

  function renderStats(): void {
    if (!state.data) return;
    const { stats } = state.data;    const items: [string, string][] = [
      [String(stats.entries), "词条"],
      [String(stats.uniqueWords), "词形"],
      [String(stats.pos), "词性"],
      [String(stats.notes), "注释"],
    ];
    ui.stats.replaceChildren(
      ...items.map(([value, label]) => {
        const item = document.createElement("span");
        item.className = "lex-stat";
        const strong = document.createElement("strong");
        strong.textContent = value;
        const text = document.createElement("span");
        text.textContent = label;
        item.append(strong, text);
        return item;
      }),
    );
  }

  function renderLanguageNote(): void {
    if (!state.data) return;
    ui.langNote.hidden = !state.data.description;
    ui.langNote.textContent = state.data.description ?? "";
  }

  function renderFieldOptions(): void {
    if (!state.data) return;
    ui.field.replaceChildren();
    const all = document.createElement("option");
    all.value = "all";
    all.textContent = "全部字段";
    ui.field.append(all);
    for (const field of state.data.fields) {
      const option = document.createElement("option");
      option.value = field.key;
      option.textContent = field.label;
      ui.field.append(option);
    }
    if (!state.data.fields.some((field) => field.key === state.field)) state.field = "all";
    ui.field.value = state.field;
    const active = state.data.fields.find((field) => field.key === state.field);
    ui.search.placeholder = active
      ? `搜索${active.label}…`
      : "搜索词形、读音、释义或注释…";
  }

  function renderPos(): void {
    if (!state.data) return;
    if (!state.data.pos.some((item) => item.value === state.pos)) state.pos = "all";
    ui.posbar.replaceChildren();
    const makeChip = (value: string, label: string, count: number): HTMLButtonElement => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "lex-chip";
      button.classList.toggle("is-active", value === state.pos);
      button.setAttribute("aria-pressed", String(value === state.pos));
      const text = document.createElement("span");
      text.textContent = label;
      const badge = document.createElement("span");
      badge.className = "lex-chip-count";
      badge.textContent = String(count);
      button.append(text, badge);
      button.addEventListener("click", () => {
        state.pos = value;
        state.page = 1;
        renderPos();
        render();
        syncUrl();
      }, { signal: controller.signal });
      return button;
    };
    ui.posbar.append(makeChip("all", "全部", state.data.entries.length));
    for (const item of state.data.pos) ui.posbar.append(makeChip(item.value, item.value, item.count));
  }

  function fieldLabel(key: FieldKey): string {
    return state.data?.fields.find((field) => field.key === key)?.label ?? key;
  }

  function renderHead(): void {
    if (!state.data) return;
    const row = document.createElement("tr");
    for (const key of FIELD_KEYS) {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = fieldLabel(key);
      row.append(th);
    }
    ui.head.replaceChildren(row);
  }

  function cell(label: string, content: Node | string, field?: FieldKey): HTMLTableCellElement {
    const td = document.createElement("td");
    td.dataset.label = label;
    if (field) td.dataset.field = field;
    if (typeof content === "string") td.textContent = content;
    else td.append(content);
    return td;
  }

  function wordCell(entry: Entry, tokens: string[]): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "lex-word-cell";
    const word = document.createElement("span");
    word.className = "lex-word";
    if (state.data?.wordClass) word.classList.add(state.data.wordClass);
    renderRuns(word, entry, "word", tokens, "", state.data?.columnStyles?.word);
    wrap.append(word);
    return wrap;
  }

  function openDetail(entry: Entry): void {
    activeEntry = entry;
    ui.dialogWord.replaceChildren();
    ui.dialogWord.className = state.data?.wordClass ?? "";
    renderRuns(ui.dialogWord, entry, "word", [], "", state.data?.columnStyles?.word);
    ui.dialogPhon.replaceChildren();
    renderRuns(ui.dialogPhon, entry, "phonetic", [], "未标注特殊读音", state.data?.columnStyles?.phonetic);
    ui.dialogPhon.hidden = false;
    ui.dialogPos.replaceChildren();
    renderRuns(ui.dialogPos, entry, "pos", [], "未标注", state.data?.columnStyles?.pos);
    ui.dialogMeaning.replaceChildren();
    renderRuns(ui.dialogMeaning, entry, "meaning", [], "暂无释义", state.data?.columnStyles?.meaning);
    ui.dialogNotes.replaceChildren();
    ui.dialogNotes.hidden = !entry.notes;
    if (entry.notes) {
      const label = document.createElement("span");
      label.className = "lex-dialog-notes-label";
      label.textContent = fieldLabel("notes");
      const text = document.createElement("p");
      renderRuns(text, entry, "notes", [], "", state.data?.columnStyles?.notes);
      ui.dialogNotes.append(label, text);
    }
    ui.copy.textContent = "复制词条";
    ui.dialog.showModal();
  }

  function renderTable(rows: SearchRow[], tokens: string[]): void {
    ui.body.replaceChildren();
    for (const row of rows) {
      const { entry } = row;
      const tr = document.createElement("tr");
      tr.tabIndex = 0;
      tr.setAttribute("role", "button");
      tr.setAttribute("aria-label", `查看 ${entry.word} 的详细释义`);
      tr.append(cell(fieldLabel("word"), wordCell(entry, tokens), "word"));
      const phonetic = document.createElement("span");
      phonetic.className = entry.phonetic ? "lex-phonetic-cell" : "lex-phonetic-cell is-empty";
      renderRuns(phonetic, entry, "phonetic", tokens, "—", state.data?.columnStyles?.phonetic);
      phonetic.title = entry.phonetic || "词表未标注特殊读音";
      tr.append(cell(fieldLabel("phonetic"), phonetic, "phonetic"));
      const pos = document.createElement("span");
      pos.className = "lex-pos-badge";
      renderRuns(pos, entry, "pos", tokens, "—", state.data?.columnStyles?.pos);
      tr.append(cell(fieldLabel("pos"), pos, "pos"));
      const meaning = document.createElement("span");
      renderRuns(meaning, entry, "meaning", tokens, "—", state.data?.columnStyles?.meaning);
      tr.append(cell(fieldLabel("meaning"), meaning, "meaning"));
      const notes = document.createElement("span");
      notes.className = entry.notes ? "lex-note" : "lex-note is-empty";
      renderRuns(notes, entry, "notes", tokens, "—", state.data?.columnStyles?.notes);
      if (entry.notes) notes.title = entry.notes;
      tr.append(cell(fieldLabel("notes"), notes, "notes"));
      tr.addEventListener("click", () => openDetail(entry), { signal: controller.signal });
      tr.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetail(entry);
        }
      }, { signal: controller.signal });
      ui.body.append(tr);
    }
  }

  function renderPager(totalPages: number): void {
    ui.pager.replaceChildren();
    ui.pager.hidden = totalPages <= 1;
    if (totalPages <= 1) return;
    const makeButton = (label: string, page: number, disabled = false, active = false): HTMLButtonElement => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "lex-page";
      button.classList.toggle("is-active", active);
      button.textContent = label;
      button.disabled = disabled;
      if (active) button.setAttribute("aria-current", "page");
      button.addEventListener("click", () => {
        if (disabled || page === state.page) return;
        state.page = page;
        render();
        syncUrl();
        ui.tableWrap.scrollIntoView({ behavior: "smooth", block: "start" });
      }, { signal: controller.signal });
      return button;
    };
    ui.pager.append(makeButton("‹", state.page - 1, state.page <= 1));
    const wanted = new Set([1, totalPages, state.page - 1, state.page, state.page + 1]);
    const pages = [...wanted].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
    let previous = 0;
    for (const page of pages) {
      if (previous > 0 && page > previous + 1) {
        const gap = document.createElement("span");
        gap.className = "lex-page-gap";
        gap.textContent = "…";
        ui.pager.append(gap);
      }
      ui.pager.append(makeButton(String(page), page, false, page === state.page));
      previous = page;
    }
    ui.pager.append(makeButton("›", state.page + 1, state.page >= totalPages));
  }

  function render(): void {
    if (!state.data) return;
    const tokens = state.query.trim().split(/\s+/).filter(Boolean);
    const foldedTokens = tokens.map(fold).filter(Boolean);
    const filtered = state.rows.filter((row) => {
      if (state.pos !== "all" && row.entry.pos !== state.pos) return false;
      if (foldedTokens.length === 0) return true;
      const haystack = state.field === "all" ? row.folded.all : row.folded[state.field];
      return foldedTokens.every((token) => haystack.includes(token));
    });

    const collator = new Intl.Collator(["zh-Hans", "en"], { numeric: true, sensitivity: "base" });
    filtered.sort((a, b) => {
      switch (state.sort) {
        case "word-desc":
          return collator.compare(b.entry.word, a.entry.word) || collator.compare(a.entry.pos, b.entry.pos);
        case "meaning-asc":
          return collator.compare(a.entry.meaning, b.entry.meaning) || collator.compare(a.entry.word, b.entry.word);
        case "pos-asc":
          return collator.compare(a.entry.pos, b.entry.pos) || collator.compare(a.entry.word, b.entry.word);
        case "length-asc":
          return a.entry.word.length - b.entry.word.length || collator.compare(a.entry.word, b.entry.word);
        default:
          return collator.compare(a.entry.word, b.entry.word) || collator.compare(a.entry.pos, b.entry.pos);
      }
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    state.page = Math.min(Math.max(1, state.page), totalPages);
    const start = (state.page - 1) * PAGE_SIZE;
    const visible = filtered.slice(start, start + PAGE_SIZE);
    const filteredActive = tokens.length > 0 || state.pos !== "all";
    ui.count.textContent = filteredActive
      ? `找到 ${filtered.length} 条 · 第 ${state.page} / ${totalPages} 页`
      : `共 ${filtered.length} 条 · 第 ${state.page} / ${totalPages} 页`;
    ui.clear.hidden = state.query.length === 0;
    ui.empty.hidden = filtered.length > 0;
    ui.tableWrap.hidden = filtered.length === 0;
    renderTable(visible, tokens);
    renderPager(totalPages);
  }

  async function selectLanguage(id: string): Promise<void> {
    if (!state.index) return;
    const meta = state.index.languages.find((language) => language.id === id);
    if (!meta) return;
    state.lang = meta.id;
    renderLanguageTabs();
    let data = cache.get(meta.file);
    try {
      if (!data) {
        data = await fetchJson<LanguageData>(`/assets/lexicon/${meta.file}`, controller.signal);
        if (controller.signal.aborted) return;
        cache.set(meta.file, data);
      }
      state.data = data;
      state.rows = makeRows(data);
      if (!data.pos.some((item) => item.value === state.pos)) state.pos = "all";
      ui.loading.hidden = true;
      ui.content.hidden = false;
      renderFieldOptions();
      renderPos();
      renderStats();
      renderLanguageNote();
      renderHead();
      render();
      syncUrl();
      root.setAttribute("aria-busy", "false");
    } catch (error) {
      if (controller.signal.aborted) return;
      ui.loading.hidden = true;
      ui.content.hidden = true;
      ui.loading.replaceChildren();
      const message = document.createElement("div");
      message.className = "lex-error";
      const title = document.createElement("strong");
      title.textContent = "词表加载失败";
      const detail = document.createElement("span");
      detail.textContent = error instanceof Error ? error.message : String(error);
      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "lex-button";
      retry.textContent = "重新加载";
      retry.addEventListener("click", () => location.reload());
      message.append(title, detail, retry);
      ui.loading.append(message);
      ui.loading.hidden = false;
    }
  }

  async function boot(): Promise<void> {
    readUrl();
    try {
      const index = await fetchJson<LexiconIndex>(`/assets/lexicon/index.json?v=${Date.now()}`, controller.signal);
      if (controller.signal.aborted) return;
      if (!index.languages.length) throw new Error("index.json contains no languages");
      state.index = index;
      const initial = index.languages.some((language) => language.id === state.lang)
        ? state.lang
        : index.languages[0]?.id ?? "";
      if (!initial) throw new Error("no default language");
      await selectLanguage(initial);
      bindEvents();
    } catch (error) {
      if (controller.signal.aborted) return;
      ui.loading.hidden = false;
      ui.loading.replaceChildren();
      const message = document.createElement("div");
      message.className = "lex-error";
      const title = document.createElement("strong");
      title.textContent = "词表加载失败";
      const detail = document.createElement("span");
      detail.textContent = error instanceof Error ? error.message : String(error);
      message.append(title, detail);
      ui.loading.append(message);
    }
  }

  function bindEvents(): void {
    ui.sort.replaceChildren();
    for (const option of SORT_OPTIONS) {
      const node = document.createElement("option");
      node.value = option.value;
      node.textContent = option.label;
      ui.sort.append(node);
    }

    ui.search.addEventListener("input", () => {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => {
        state.query = ui.search.value;
        state.page = 1;
        render();
        syncUrl();
      }, 120);
    }, { signal: controller.signal });

    ui.clear.addEventListener("click", () => {
      ui.search.value = "";
      state.query = "";
      state.page = 1;
      render();
      syncUrl();
      ui.search.focus();
    }, { signal: controller.signal });

    ui.field.addEventListener("change", () => {
      state.field = ui.field.value as FieldFilter;
      state.page = 1;
      renderFieldOptions();
      render();
      syncUrl();
    }, { signal: controller.signal });

    ui.sort.addEventListener("change", () => {
      state.sort = ui.sort.value as SortKey;
      state.page = 1;
      render();
      syncUrl();
    }, { signal: controller.signal });

    ui.reset.addEventListener("click", () => {
      ui.search.value = "";
      state.query = "";
      state.field = "all";
      state.pos = "all";
      state.page = 1;
      renderFieldOptions();
      renderPos();
      render();
      syncUrl();
      ui.search.focus();
    }, { signal: controller.signal });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      event.preventDefault();
      ui.search.focus();
    }, { signal: controller.signal });

    ui.dialogClose.addEventListener("click", () => ui.dialog.close(), { signal: controller.signal });
    ui.dialog.addEventListener("click", (event) => {
      if (event.target === ui.dialog) ui.dialog.close();
    }, { signal: controller.signal });

    ui.copy.addEventListener("click", async () => {
      if (!activeEntry) return;
      const text = [activeEntry.word, activeEntry.pos, activeEntry.meaning]
        .filter(Boolean)
        .join("\t") + (activeEntry.notes ? `\n${activeEntry.notes}` : "");
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const area = document.createElement("textarea");
        area.value = text;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.append(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      ui.copy.textContent = "已复制";
      window.setTimeout(() => { ui.copy.textContent = "复制词条"; }, 1400);
    }, { signal: controller.signal });

    for (const [key, value] of [
      ["field", state.field],
      ["sort", state.sort],
    ] as const) {
      const select = key === "field" ? ui.field : ui.sort;
      select.value = value;
    }
    ui.search.value = state.query;
  }

  void boot();
}
