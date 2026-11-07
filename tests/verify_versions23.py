"""Check the files actually requested by the archived HTML, styles, and script literals.

Run without arguments against a built release. --sources additionally checks a
workspace of restored source trees before their numbered snapshots are built.
The release freezer separately verifies hashes and immutable manifests.
"""
import argparse
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

PROJECT = Path(__file__).resolve().parents[1]
CSS_URL = re.compile(r'''url\(\s*["']?([^\s'"()]+)["']?\s*\)''', re.I)
# Only explicit file paths, not example filenames printed in design notes or
# keys such as "medal-gold.webp" used to look up an inline data URI.
JS_ASSET = re.compile(r'''["'`](assets/[\w./-]+\.(?:webp|svg|png|jpg|jpeg|flac|mp3|ogg|json))["'`]''', re.I)
HTML_ATTR = re.compile(r'''\b(?:src|href)\s*=\s*["']((?:assets|docs|data)/[\w./-]+\.[a-z0-9]+|[\w.-]+\.html)["']''', re.I)


class References(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs = set()
        self.context = None

    def handle_starttag(self, tag, attrs):
        fields = dict(attrs)
        if tag in {"script", "style"}:
            self.context = tag
        if fields.get("style"):
            self.refs.update(CSS_URL.findall(fields["style"]))
        for key in ("src", "poster", "href"):
            if fields.get(key) and (key != "href" or tag in {"a", "link", "base"}):
                self.refs.add(fields[key])

    def handle_endtag(self, tag):
        if tag == self.context:
            self.context = None

    def handle_data(self, data):
        if self.context == "style":
            self.refs.update(CSS_URL.findall(data))
        elif self.context == "script":
            self.refs.update(JS_ASSET.findall(data))
            self.refs.update(HTML_ATTR.findall(data))


def references(path):
    text = path.read_text(encoding="utf-8")
    if path.suffix == ".css":
        return set(CSS_URL.findall(text))
    if path.suffix == ".js":
        result = set(JS_ASSET.findall(text)) | set(HTML_ATTR.findall(text))
        if "assets/medal-'+" in text:
            result.update(f"assets/medal-{metal}.webp" for metal in ("gold", "silver", "bronze"))
        if "'assets/archive18-'+c.plate+'.webp'" in text:
            result.update(f"assets/archive18-{name}.webp" for name in ("receiver", "strip", "parallax"))
        return result
    parser = References()
    parser.feed(text)
    return parser.refs


def verify_refs(directory, archived=True):
    issues, checked = set(), 0
    entry = directory / ("screen.txt" if archived else "index.html")
    if not entry.is_file():
        return {f"{directory.name}: original page entry missing"}, checked
    docs = set(directory.glob("*.html")) | set(directory.glob("*.js")) | set(directory.glob("*.css")) | set(directory.glob("docs/*.html")) | {entry}
    if archived:
        docs.discard(directory / "index.html")
    for path in docs:
        for raw in references(path):
            if raw.startswith(("data:", "#", "javascript:", "mailto:", "//")) or any(s in raw for s in ('${', "'+", '"+')):
                continue
            u = urlsplit(raw)
            if u.scheme or not u.path:
                continue
            ref = unquote(u.path)
            # Historical how-to pages intentionally link back to the live project.
            if ref.startswith("/"):
                if ref in {"/", "/index.html"} or ref.startswith("/api/"):
                    continue
                dest = PROJECT / ref.lstrip("/")
            else:
                dest = path.parent / ref
            if dest.is_dir():
                dest /= "index.html"
            # V1.5 originally ships a player for an optional, privately supplied
            # track; the first Vercel release to bundle its music is V1.5.1.
            if directory.name == "1.5" and path == entry and ref == "assets/music/cornfield-chase.flac":
                continue
            checked += 1
            if not dest.is_file():
                issues.add(f"{directory.name}/{path.relative_to(directory)} -> {ref}")
    return issues, checked


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--sources", type=Path, help="workspace containing history23_remote and archive23_inputs/public")
    args = cli.parse_args()
    if args.sources:
        folders = sorted((args.sources / "history23_remote").iterdir()) + sorted((args.sources / "archive23_inputs/public").glob("v0.[1234]")) + [PROJECT]
    else:
        catalogue = json.loads((PROJECT / "review/catalog.json").read_text())
        ids = [v["id"] for v in catalogue["versions"]]
        if sorted(set(ids), key=lambda v: list(map(int,v.split('.'))), reverse=True) != ids or catalogue["current"] not in ids:
            raise SystemExit("Release identifiers must be unique, descending, and include the live version")
        folders = [PROJECT / "history" / v for v in ids]
        on_disk = {p.name for p in (PROJECT/"history").iterdir() if p.is_dir()}
        if on_disk != set(ids):
            raise SystemExit(f"Selector/archive directory mismatch: {on_disk.symmetric_difference(ids)}")
        bootstrap = (PROJECT / "review/entry.html").read_bytes()
        if len(ids) < 24:
            raise SystemExit("The original V2.3 rollout contained 24 distinct releases")
        for launch in (PROJECT / "compare/index.html", PROJECT / "review/entry.html"):
            for url in references(launch):
                if url.startswith(("#", "http:", "https:")):
                    continue
                target = PROJECT / url[1:] if url.startswith("/") else launch.parent / url
                if not target.exists():
                    raise SystemExit(f"Missing shared review resource: {launch.name} -> {url}")
        for p in folders:
            if (p/"index.html").read_bytes() != bootstrap:
                raise SystemExit(f"Unexpected archive bootstrap: {p.name}")
            m=json.loads((p/"manifest.json").read_text())
            if m["version"] != p.name or bool(m.get("publicData")) != (p/"public-data.json").is_file():
                raise SystemExit(f"Manifest/playback mismatch: {p.name}")
    total, issues = 0, set()
    for p in folders:
        errs, count = verify_refs(p, not args.sources)
        issues.update(errs)
        total += count
    if issues:
        raise SystemExit("\n".join(sorted(issues)))
    print(f"{len(folders)} release trees: {total} concrete local references resolved.")


if __name__ == "__main__":
    main()
