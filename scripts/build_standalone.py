"""Build a standalone page, optionally with analytics for the hosted site."""

from pathlib import Path
from base64 import b64encode
import os
import re

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"

html = (DIST / "index.html").read_text(encoding="utf-8")
css = (DIST / "editor.css").read_text(encoding="utf-8")
js = (DIST / "editor.js").read_text(encoding="utf-8")
katex_css = (DIST / "vendor" / "katex.min.css").read_text(encoding="utf-8")
katex_js = (DIST / "vendor" / "katex.min.js").read_text(encoding="utf-8")

def embed_font(match):
    font = DIST / "vendor" / "fonts" / match.group(1)
    encoded = b64encode(font.read_bytes()).decode("ascii")
    return f"url(data:font/woff2;base64,{encoded})"

katex_css = re.sub(r"url\(fonts/([^()]+\.woff2)\)", embed_font, katex_css)

css_link = '<link rel="stylesheet" href="editor.css">'
js_link = '<script src="editor.js"></script>'
if html.count(css_link) != 1 or html.count(js_link) != 1:
    raise RuntimeError("Expected CSS and JavaScript links were not found exactly once")
if html.count('<link rel="stylesheet" href="vendor/katex.min.css">') != 1 or html.count('<script src="vendor/katex.min.js"></script>') != 1:
    raise RuntimeError("Expected KaTeX asset links were not found exactly once")

html = html.replace('<link rel="stylesheet" href="vendor/katex.min.css">', f"<style>\n{katex_css}\n</style>")
html = html.replace('<script src="vendor/katex.min.js"></script>', f"<script>\n{katex_js}\n</script>")
html = html.replace(css_link, f"<style>\n{css}\n</style>")
html = html.replace(js_link, f"<script>\n{js}\n</script>")

analytics_token = os.environ.get("CLOUDYPAGE_ANALYTICS_TOKEN")
if analytics_token:
    if not re.fullmatch(r"[0-9a-f]{32}", analytics_token):
        raise ValueError("Invalid Cloudflare Web Analytics token")
    if html.count("</body>") != 1:
        raise RuntimeError("Expected exactly one closing body tag")
    analytics = (
        '<!-- Cloudflare Web Analytics -->\n'
        "<script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' "
        f"""data-cf-beacon='{{"token": "{analytics_token}"}}'></script>\n"""
        '<!-- End Cloudflare Web Analytics -->\n'
    )
    html = html.replace("</body>", analytics + "</body>", 1)

output = DIST / "standalone.html"
output.write_text(html, encoding="utf-8")
print(output)
