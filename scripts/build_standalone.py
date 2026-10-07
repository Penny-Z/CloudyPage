"""Create a single offline HTML file from the editable project sources."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"

html = (DIST / "index.html").read_text(encoding="utf-8")
css = (DIST / "editor.css").read_text(encoding="utf-8")
js = (DIST / "editor.js").read_text(encoding="utf-8")

css_link = '<link rel="stylesheet" href="editor.css">'
js_link = '<script src="editor.js"></script>'
if html.count(css_link) != 1 or html.count(js_link) != 1:
    raise RuntimeError("Expected CSS and JavaScript links were not found exactly once")

html = html.replace(css_link, f"<style>\n{css}\n</style>")
html = html.replace(js_link, f"<script>\n{js}\n</script>")
output = DIST / "standalone.html"
output.write_text(html, encoding="utf-8")
print(output)
