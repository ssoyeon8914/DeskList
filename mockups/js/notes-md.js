/**
 * Safe subset Markdown → HTML (escape-first). Shared rules with src/domain/notes.ts.
 */
(function (global) {
  function renderMarkdownSafe(src) {
    var escaped = String(src == null ? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    var lines = escaped.split(/\r?\n/);
    var out = [];
    var inUl = false;
    var inOl = false;
    var inCode = false;
    var codeBuf = [];

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

    function inlineFormat(s) {
      return s
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(
          /\[([^\]]+)\]\((https?:[^)\s]+)\)/g,
          '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>',
        );
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
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

      var h = /^(#{1,3})\s+(.+)$/.exec(line);
      if (h) {
        closeLists();
        var level = h[1].length;
        out.push("<h" + level + ">" + inlineFormat(h[2]) + "</h" + level + ">");
        continue;
      }

      if (/^>\s?/.test(line)) {
        closeLists();
        out.push(
          "<blockquote><p>" +
            inlineFormat(line.replace(/^>\s?/, "")) +
            "</p></blockquote>",
        );
        continue;
      }

      var ul = /^[-*]\s+(.+)$/.exec(line);
      if (ul) {
        if (inOl) {
          out.push("</ol>");
          inOl = false;
        }
        if (!inUl) {
          out.push("<ul>");
          inUl = true;
        }
        out.push("<li>" + inlineFormat(ul[1]) + "</li>");
        continue;
      }

      var ol = /^(\d+)\.\s+(.+)$/.exec(line);
      if (ol) {
        if (inUl) {
          out.push("</ul>");
          inUl = false;
        }
        if (!inOl) {
          out.push("<ol>");
          inOl = true;
        }
        out.push("<li>" + inlineFormat(ol[2]) + "</li>");
        continue;
      }

      if (!line.trim()) {
        closeLists();
        continue;
      }

      closeLists();
      out.push("<p>" + inlineFormat(line) + "</p>");
    }

    if (inCode) {
      out.push("<pre><code>" + codeBuf.join("\n") + "</code></pre>");
    }
    closeLists();
    return out.join("\n") || "<p></p>";
  }

  global.NotesMd = { renderMarkdownSafe: renderMarkdownSafe };
})(typeof window !== "undefined" ? window : globalThis);
