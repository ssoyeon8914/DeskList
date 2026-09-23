import type { Doc, DocFolder, DocFormat, DocsUiState } from "./types";

export const DOC_BODY_MAX = 50_000;
export const DOC_TITLE_MAX = 120;
export const DOC_FOLDER_NAME_MAX = 40;

export function normalizeFormat(raw: unknown): DocFormat {
  return raw === "markdown" ? "markdown" : "text";
}

export function normalizeFolder(raw: unknown): DocFolder | null {
  if (!raw || typeof raw !== "object") return null;
  const f = raw as Partial<DocFolder>;
  const name = String(f.name ?? "").trim().slice(0, DOC_FOLDER_NAME_MAX);
  if (!name) return null;
  return {
    id: String(f.id || `df_${Math.random().toString(36).slice(2, 10)}`),
    name,
    sort: typeof f.sort === "number" && Number.isFinite(f.sort) ? f.sort : undefined,
    updatedAt: String(f.updatedAt || new Date().toISOString()),
  };
}

export function normalizeDoc(raw: unknown): Doc | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Partial<Doc>;
  const folderId = String(d.folderId || "");
  if (!folderId) return null;
  return {
    id: String(d.id || `dn_${Math.random().toString(36).slice(2, 10)}`),
    folderId,
    title: String(d.title ?? "").slice(0, DOC_TITLE_MAX),
    format: normalizeFormat(d.format),
    body: String(d.body ?? "").slice(0, DOC_BODY_MAX),
    updatedAt: String(d.updatedAt || new Date().toISOString()),
  };
}

export function seedFolders(): DocFolder[] {
  const now = new Date().toISOString();
  return [
    { id: "df1", name: "회의", sort: 0, updatedAt: now },
    { id: "df2", name: "개인", sort: 1, updatedAt: now },
  ];
}

export function seedDocs(): Doc[] {
  const now = new Date().toISOString();
  return [
    {
      id: "dn1",
      folderId: "df1",
      title: "킥오프 메모",
      format: "text",
      body: "안건\n1. 일정 공유\n2. 역할 나눔\n3. 다음 액션",
      updatedAt: now,
    },
    {
      id: "dn2",
      folderId: "df1",
      title: "주간 회고",
      format: "markdown",
      body: "# 주간 회고\n\n## 잘한 점\n- 일정 정리\n- 촬영 준비\n\n## 다음에\n1. 블로그 초안\n2. **카드뉴스** 리뷰\n\n> 짧게, 꾸준히.",
      updatedAt: now,
    },
    {
      id: "dn3",
      folderId: "df2",
      title: "아이디어 메모",
      format: "text",
      body: "나중에 다듬을 문장들을 여기에.",
      updatedAt: now,
    },
  ];
}

export function seedDocsUi(): DocsUiState {
  return {
    selectedFolderId: "df1",
    selectedDocId: "dn2",
    mdViewMode: "edit",
    foldersCollapsed: false,
    titlesCollapsed: false,
  };
}

export type MdViewMode = "edit" | "split" | "preview";

export function normalizeMdViewMode(raw: unknown): MdViewMode {
  if (raw === "split" || raw === "preview" || raw === "edit") return raw;
  return "edit";
}

export function foldersSorted(list: DocFolder[]): DocFolder[] {
  return list.slice().sort((a, b) => {
    const sa = a.sort ?? 0;
    const sb = b.sort ?? 0;
    if (sa !== sb) return sa - sb;
    return a.name.localeCompare(b.name, "ko");
  });
}

export function docsInFolder(list: Doc[], folderId: string): Doc[] {
  return list
    .filter((d) => d.folderId === folderId)
    .slice()
    .sort((a, b) => {
      if (a.updatedAt === b.updatedAt) {
        return a.title.localeCompare(b.title, "ko");
      }
      return a.updatedAt < b.updatedAt ? 1 : -1;
    });
}

/** Drop invalid selection ids; prefer first folder/doc when missing. */
export function resolveDocsUi(
  folders: DocFolder[],
  docs: Doc[],
  ui: DocsUiState | null | undefined,
): DocsUiState {
  const sorted = foldersSorted(folders);
  let folderId = ui?.selectedFolderId ?? null;
  if (!folderId || !sorted.some((f) => f.id === folderId)) {
    folderId = sorted[0]?.id ?? null;
  }
  let docId = ui?.selectedDocId ?? null;
  const inFolder = folderId ? docsInFolder(docs, folderId) : [];
  if (!docId || !inFolder.some((d) => d.id === docId)) {
    docId = inFolder[0]?.id ?? null;
  }
  return {
    selectedFolderId: folderId,
    selectedDocId: docId,
    mdViewMode: normalizeMdViewMode(ui?.mdViewMode),
    foldersCollapsed: !!ui?.foldersCollapsed,
    titlesCollapsed: !!ui?.titlesCollapsed,
  };
}

/**
 * Safe subset Markdown → HTML.
 * Escape first, then apply a small set of transforms (no raw HTML passthrough).
 */
export function renderMarkdownSafe(src: string): string {
  const escaped = String(src ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = escaped.split(/\r?\n/);
  const out: string[] = [];
  let inUl = false;
  let inOl = false;
  let inCode = false;
  let codeBuf: string[] = [];

  function closeLists() {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      out.push("</ol>");
      inOl = false;
    }
  }

  function inlineFormat(s: string): string {
    return s
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(
        /\[([^\]]+)\]\((https?:[^)\s]+)\)/g,
        '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>',
      );
  }

  for (const line of lines) {
    if (/^```/.test(line)) {
      if (inCode) {
        out.push("<pre><code>" + codeBuf.join("\n") + "</code></pre>");
        codeBuf = [];
        inCode = false;
      } else {
        closeLists();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }

    const h = /^(#{1,3})\s+(.+)$/.exec(line);
    if (h) {
      closeLists();
      const level = h[1].length;
      out.push(`<h${level}>${inlineFormat(h[2])}</h${level}>`);
      continue;
    }

    if (/^>\s?/.test(line)) {
      closeLists();
      out.push(`<blockquote><p>${inlineFormat(line.replace(/^>\s?/, ""))}</p></blockquote>`);
      continue;
    }

    const ul = /^[-*]\s+(.+)$/.exec(line);
    if (ul) {
      if (inOl) {
        out.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        out.push("<ul>");
        inUl = true;
      }
      out.push(`<li>${inlineFormat(ul[1])}</li>`);
      continue;
    }

    const ol = /^(\d+)\.\s+(.+)$/.exec(line);
    if (ol) {
      if (inUl) {
        out.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        out.push("<ol>");
        inOl = true;
      }
      out.push(`<li>${inlineFormat(ol[2])}</li>`);
      continue;
    }

    if (!line.trim()) {
      closeLists();
      continue;
    }

    closeLists();
    out.push(`<p>${inlineFormat(line)}</p>`);
  }

  if (inCode) {
    out.push("<pre><code>" + codeBuf.join("\n") + "</code></pre>");
  }
  closeLists();
  return out.join("\n") || "<p></p>";
}
