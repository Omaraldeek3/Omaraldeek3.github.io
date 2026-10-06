# Design File Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A password-protected search site for the shop's ~50 GB of CorelDRAW/Photoshop/PDF design files, findable by the text inside each design and by an AI description of its preview, with the original downloadable from anywhere.

**Architecture:** A Windows uploader (Python, packaged as one `.exe`) scans the uncle's folders, hashes each file, extracts text and a preview, uploads originals and previews to Cloudflare R2 through presigned URLs, and registers metadata with the site. The site (Next.js 16 on Vercel, Neon Postgres) serves search, details, previews and downloads. Preview descriptions are written by Claude Code sessions through two uploader subcommands (`describe-pull`, `describe-push`) and a token-protected API.

**Tech Stack:** Python 3.12+ (httpx, Pillow, PyMuPDF, pytest, PyInstaller); Next.js 16.x App Router, TypeScript, Tailwind, zod, `@neondatabase/serverless`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, vitest; Neon Postgres with `pg_trgm`; Cloudflare R2.

**Spec:** `docs/superpowers/specs/2026-10-07-design-file-search-design.md` (in the `codex` repo). Read it before starting any task.

## Global Constraints

- New standalone repo at `D:\work\design-search` (not inside `codex`). Layout: `uploader/` (Python) and `web/` (Next.js).
- Next.js 16: the request interceptor file is `proxy.ts` exporting `function proxy` (not `middleware`); `cookies()`, `params` and `searchParams` are async. Read `web/node_modules/next/dist/docs/` before writing Next code.
- Never modify, rename or move the shop's original files. The uploader only reads them.
- Backup files (`Backup_of_…`) are ordinary files: indexed, uploaded and shown like any other.
- R2 object keys: `originals/<sha256><ext>` and `previews/<sha256>.png`. Hash is lowercase hex SHA-256.
- Skip files: names `.ds_store`, `thumbs.db`, `desktop.ini`, names starting `~$`, extensions `.log`, `.tmp`.
- Kinds by extension: `.cdr`→`cdr`; `.psd`/`.psb`→`psd`; `.pdf`→`pdf`; `.ai`→`ai`; `.jpg`/`.jpeg`/`.png`→`image`; `.ttf`/`.otf`→`font`; anything else→`other`. Search hides `font` and `other` unless the kind filter asks for them.
- `extract_status` ∈ `ok | no_text | unreadable | failed`; `ai_status` ∈ `pending | done | skipped` (`skipped` when there is no preview).
- Arabic normalization (server side only, `web/lib/normalize.ts`): drop tashkeel U+064B–U+0652, U+0670 and tatweel U+0640; أ/إ/آ/ٱ→ا; ة→ه; ى→ي; collapse whitespace; lowercase.
- Extracted words: Arabic runs of 2+ chars in U+0621–U+064A plus tashkeel; Latin words `[A-Za-z][A-Za-z0-9'&-]{2,}`; drop CorelDRAW names `Desktop Guides Document Grid Layer ENU ARA Page`.
- Login: one shared password (env `SITE_PASSWORD`), HMAC-signed cookie `ds_session`, 30 days. Uploader and describe APIs use `Authorization: Bearer <API_TOKEN>`.
- Env vars (web): `DATABASE_URL`, `SITE_PASSWORD`, `SESSION_SECRET`, `API_TOKEN`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.
- Credentials are entered by Omar himself (Vercel dashboard, Cloudflare dashboard, `config.json`). Agents never type secrets into web forms.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

---

## File Structure

```
D:\work\design-search\
  .gitignore
  README.md
  uploader/
    pyproject.toml
    config.example.json
    DESCRIBE.md                      # how a Claude session writes descriptions
    install-shortcut.ps1             # desktop icon "رفع التصاميم الجديدة"
    design_uploader/
      __init__.py
      __main__.py                    # python -m design_uploader
      words.py                       # WordCollector: word regexes + CorelDRAW-name filter
      extract/
        __init__.py                  # Extracted, kind_for(), extract()
        cdr.py                       # zip CDR text + preview
        psd.py                       # PSD/PSB text (Txt TEXT scan) + thumbnail resource
        pdf.py                       # PDF/AI text + page-1 render
        image.py                     # to_png(), image thumbnail
      scan.py                        # FoundFile, should_skip(), iter_files(), sha256_file()
      state.py                       # State: local SQLite of hashes and done uploads
      api.py                         # Api: HTTP client with retries
      runner.py                      # run_upload(), count_files(), Summary
      describe.py                    # pull(), push()
      main.py                        # CLI wiring, config loading
    tests/
      fixtures.py                    # builders for fake CDR/PSD/PDF/PNG files
      test_words.py
      test_extract_cdr.py
      test_extract_other.py
      test_scan_state.py
      test_api.py
      test_runner.py
      test_describe.py
  web/
    (create-next-app output)
    proxy.ts
    vitest.config.ts
    db/schema.sql
    scripts/migrate.mjs
    lib/
      normalize.ts  normalize.test.ts
      auth.ts       auth.test.ts
      db.ts
      r2.ts         r2.test.ts
      schemas.ts    schemas.test.ts
      search.ts     search.test.ts
      api-auth.ts
    app/
      layout.tsx  globals.css  page.tsx
      login/page.tsx
      api/login/route.ts
      api/ingest/check/route.ts
      api/ingest/presign/route.ts
      api/ingest/register/route.ts
      api/search/route.ts
      api/file/[sha256]/route.ts
      api/preview/[sha256]/route.ts
      api/download/[locationId]/route.ts
      api/describe/pending/route.ts
      api/describe/[sha256]/route.ts
    components/
      SearchPage.tsx  ResultCard.tsx  DetailsDialog.tsx
```

---

### Task 1: Repo and CorelDRAW extraction

**Files:**
- Create: `D:\work\design-search\.gitignore`, `README.md`
- Create: `uploader/pyproject.toml`, `uploader/design_uploader/__init__.py`, `uploader/design_uploader/words.py`, `uploader/design_uploader/extract/__init__.py` (empty for now), `uploader/design_uploader/extract/cdr.py`
- Test: `uploader/tests/fixtures.py`, `uploader/tests/test_words.py`, `uploader/tests/test_extract_cdr.py`

**Interfaces:**
- Produces: `WordCollector` with `.add_text(text: str) -> None` and `.words: list[str]` (first-seen order, no repeats). `cdr.extract(path: Path) -> tuple[list[str], bytes | None]`; raises `zipfile.BadZipFile` for pre-X4 CDR. Test builders `make_cdr(path, page_bytes, preview=b"...")`.

- [ ] **Step 1: Create the repo**

```bash
mkdir D:/work/design-search && cd D:/work/design-search && git init -b main
```

`.gitignore`:
```
__pycache__/
*.egg-info/
.pytest_cache/
uploader/build/
uploader/dist/
uploader/config.json
uploader/state.db
uploader/upload-errors.txt
web/node_modules/
web/.next/
web/.env*
web/.vercel/
```

`README.md`:
```markdown
# design-search

Search the shop's design files by the text inside them. See the design in
`codex/docs/superpowers/specs/2026-10-07-design-file-search-design.md`.

- `uploader/` — Windows uploader (Python). `python -m design_uploader --help`
- `web/` — search site (Next.js on Vercel)
```

`uploader/pyproject.toml`:
```toml
[project]
name = "design-uploader"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = ["httpx>=0.27", "Pillow>=10", "PyMuPDF>=1.24"]

[project.optional-dependencies]
dev = ["pytest>=8", "pyinstaller>=6"]

[project.scripts]
design-uploader = "design_uploader.main:main"

[build-system]
requires = ["setuptools>=69"]
build-backend = "setuptools.build_meta"

[tool.setuptools.packages.find]
include = ["design_uploader*"]
```

`uploader/design_uploader/__init__.py` and `uploader/design_uploader/extract/__init__.py`: empty files.

Run: `cd uploader && python -m pip install -e ".[dev]"`
Expected: installs without errors.

- [ ] **Step 2: Write the failing tests**

`uploader/tests/fixtures.py`:
```python
"""Builders for small fake design files, so tests never need customer data."""
import io
import struct
import zipfile
from pathlib import Path

from PIL import Image


def png_bytes(size=(40, 30), color=(200, 30, 30)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", size, color).save(buf, "PNG")
    return buf.getvalue()


def jpeg_bytes(size=(40, 30)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", size, (10, 120, 10)).save(buf, "JPEG")
    return buf.getvalue()


def make_cdr(path: Path, page_bytes: bytes, preview: bytes | None = None) -> Path:
    with zipfile.ZipFile(path, "w") as z:
        z.writestr("mimetype", "application/x-vnd.corel.draw.document+zip")
        z.writestr("content/data/page1.dat", page_bytes)
        if preview is not None:
            z.writestr("previews/thumbnail.png", preview)
    return path


def make_psd(path: Path, text: str, thumbnail_jpeg: bytes | None = None) -> Path:
    header = b"8BPS" + struct.pack(">H", 1) + b"\0" * 6 + struct.pack(">HIIHH", 3, 30, 40, 8, 3)
    color_mode = struct.pack(">I", 0)
    resources = b""
    if thumbnail_jpeg is not None:
        data = b"\0" * 28 + thumbnail_jpeg
        pad = b"\0" if len(data) % 2 else b""
        # 8BIM, id 1036, empty pascal name padded to 2 bytes, size, data
        resources = b"8BIM" + struct.pack(">H", 1036) + b"\0\0" + struct.pack(">I", len(data)) + data + pad
    encoded = (text + "\0").encode("utf-16-be")
    layer_section = b"junk" * 10 + b"Txt TEXT" + struct.pack(">I", len(text) + 1) + encoded + b"more"
    path.write_bytes(header + color_mode + struct.pack(">I", len(resources)) + resources + layer_section)
    return path
```

`uploader/tests/test_words.py`:
```python
from design_uploader.words import WordCollector


def test_keeps_arabic_and_latin_words_in_order_without_repeats():
    w = WordCollector()
    w.add_text("Desktop سنداً قلبي سنداً Lara Guides ab")
    assert w.words == ["سنداً", "قلبي", "Lara"]


def test_drops_non_core_arabic_letters_and_single_letters():
    w = WordCollector()
    w.add_text("ۂُ ۂ و بك")
    assert w.words == ["بك"]
```

`uploader/tests/test_extract_cdr.py`:
```python
import zipfile

import pytest

from design_uploader.extract import cdr
from tests.fixtures import make_cdr, png_bytes


def test_reads_text_at_even_and_odd_offsets_and_preview(tmp_path):
    page = (b"\0\0" + "سنداً قلبي".encode("utf-16-le") + b"\x07"
            + "Desktop Lara Guides".encode("utf-16-le"))
    preview = png_bytes()
    words, got_preview = cdr.extract(make_cdr(tmp_path / "lara9.cdr", page, preview))
    assert words == ["سنداً", "قلبي", "Lara"]
    assert got_preview == preview


def test_file_without_text_or_preview(tmp_path):
    words, preview = cdr.extract(make_cdr(tmp_path / "curves.cdr", b"\x01\x02\x03\x04"))
    assert words == []
    assert preview is None


def test_old_riff_cdr_is_not_a_zip(tmp_path):
    old = tmp_path / "old.cdr"
    old.write_bytes(b"RIFF\x10\x00\x00\x00CDR9vrsn")
    with pytest.raises(zipfile.BadZipFile):
        cdr.extract(old)
```

Also create `uploader/tests/__init__.py` (empty) so `tests.fixtures` imports work.

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd uploader && python -m pytest -q`
Expected: FAIL with `ModuleNotFoundError: No module named 'design_uploader.words'`.

- [ ] **Step 4: Implement**

`uploader/design_uploader/words.py`:
```python
"""Turn decoded text into a clean, ordered list of searchable words."""
import re

# Core Arabic letters + tashkeel only; Persian/Urdu letters in CDR data are binary noise.
ARABIC_WORD = re.compile(r"[\u0621-\u064A\u064B-\u0652]{2,}")
LATIN_WORD = re.compile(r"[A-Za-z][A-Za-z0-9'&-]{2,}")
# CorelDRAW's own layer/page names, present in every file.
CORE_NAMES = frozenset({"Desktop", "Guides", "Document", "Grid", "Layer", "ENU", "ARA", "Page"})


class WordCollector:
    def __init__(self):
        self.words: list[str] = []
        self._seen: set[str] = set()

    def add_text(self, text: str) -> None:
        for pattern in (ARABIC_WORD, LATIN_WORD):
            for match in pattern.finditer(text):
                word = match.group()
                if word not in self._seen and word not in CORE_NAMES:
                    self._seen.add(word)
                    self.words.append(word)
```

`uploader/design_uploader/extract/cdr.py`:
```python
"""Text and preview from a modern (zip-based, X4+) CorelDRAW file."""
import zipfile
from pathlib import Path

from ..words import WordCollector

PREVIEWS = ("previews/thumbnail.png", "previews/page1.png")


def extract(path: Path) -> tuple[list[str], bytes | None]:
    """Raises zipfile.BadZipFile for pre-X4 CDR files, which are RIFF, not zip."""
    words = WordCollector()
    with zipfile.ZipFile(path) as z:
        names = z.namelist()
        for name in names:
            if name.startswith("content/data/page") or name == "content/data/masterPage.dat":
                data = z.read(name)
                # Text runs may start on an odd byte, so decode both alignments.
                for offset in (0, 1):
                    words.add_text(data[offset:].decode("utf-16-le", errors="ignore"))
        preview = next((z.read(n) for n in PREVIEWS if n in names), None)
    return words.words, preview
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd uploader && python -m pytest -q`
Expected: 5 passed.

- [ ] **Step 6: Check against a real sample file (read-only)**

Run: `cd uploader && python -c "from pathlib import Path; from design_uploader.extract import cdr; w,p=cdr.extract(Path(r'G:\My Drive\sumar\2026\2026 X  9\lara9.cdr')); print(len(w), w[:8], len(p or b''))"`
Expected: about 20+ words including `سنداً`, preview about 13683 bytes. (Skip this step if `G:` is not available.)

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(uploader): extract text and preview from CorelDRAW files

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Photoshop, PDF, image extraction and dispatch

**Files:**
- Create: `uploader/design_uploader/extract/image.py`, `uploader/design_uploader/extract/psd.py`, `uploader/design_uploader/extract/pdf.py`
- Modify: `uploader/design_uploader/extract/__init__.py`
- Test: `uploader/tests/test_extract_other.py`

**Interfaces:**
- Consumes: `WordCollector` (Task 1), `cdr.extract` (Task 1).
- Produces:
  ```python
  @dataclass
  class Extracted:
      kind: str               # cdr | psd | pdf | ai | image | font | other
      status: str             # ok | no_text | unreadable | failed
      words: list[str]
      preview_png: bytes | None
  def kind_for(suffix: str) -> str
  def extract(path: Path) -> Extracted   # never raises
  def to_png(img: PIL.Image.Image, max_side: int = 600) -> bytes
  ```

- [ ] **Step 1: Write the failing tests**

`uploader/tests/test_extract_other.py`:
```python
import io

import pymupdf
from PIL import Image

from design_uploader.extract import Extracted, extract, kind_for
from tests.fixtures import jpeg_bytes, make_cdr, make_psd, png_bytes


def is_png(data):
    return data is not None and data[:8] == b"\x89PNG\r\n\x1a\n"


def test_kind_for():
    assert kind_for(".CDR") == "cdr"
    assert kind_for(".psb") == "psd"
    assert kind_for(".ai") == "ai"
    assert kind_for(".jpeg") == "image"
    assert kind_for(".otf") == "font"
    assert kind_for(".rar") == "other"


def test_psd_text_layer_and_thumbnail(tmp_path):
    result = extract(make_psd(tmp_path / "card.psd", "كرت عرس رامي", jpeg_bytes()))
    assert result.kind == "psd"
    assert result.status == "ok"
    assert result.words == ["كرت", "عرس", "رامي"]
    assert is_png(result.preview_png)


def test_psd_without_thumbnail(tmp_path):
    result = extract(make_psd(tmp_path / "big.psb", "Shelf Strip"))
    assert result.words == ["Shelf", "Strip"]
    assert result.preview_png is None


def test_pdf_text_and_render(tmp_path):
    doc = pymupdf.open()
    doc.new_page(width=200, height=100).insert_text((20, 50), "Lurpak Ramadan")
    path = tmp_path / "strip.pdf"
    doc.save(path)
    result = extract(path)
    assert result.kind == "pdf"
    assert result.words == ["Lurpak", "Ramadan"]
    assert is_png(result.preview_png)
    assert max(Image.open(io.BytesIO(result.preview_png)).size) <= 600


def test_image_gets_png_preview_and_no_text(tmp_path):
    path = tmp_path / "mockup.jpg"
    path.write_bytes(jpeg_bytes((1200, 800)))
    result = extract(path)
    assert result == Extracted("image", "no_text", [], result.preview_png)
    assert Image.open(io.BytesIO(result.preview_png)).size == (600, 400)


def test_cdr_dispatch_and_statuses(tmp_path):
    ok = extract(make_cdr(tmp_path / "a.cdr", "سنداً".encode("utf-16-le"), png_bytes()))
    assert (ok.kind, ok.status, ok.words) == ("cdr", "ok", ["سنداً"])
    curves = extract(make_cdr(tmp_path / "b.cdr", b"\x01\x02", png_bytes()))
    assert curves.status == "no_text"
    old = tmp_path / "old.cdr"
    old.write_bytes(b"RIFF....CDR9")
    assert extract(old).status == "unreadable"


def test_broken_file_is_failed_not_raised(tmp_path):
    bad = tmp_path / "bad.pdf"
    bad.write_bytes(b"not a pdf")
    assert extract(bad).status == "failed"


def test_font_is_stored_without_text(tmp_path):
    font = tmp_path / "x.ttf"
    font.write_bytes(b"\0\1\0\0")
    assert extract(font) == Extracted("font", "no_text", [], None)
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd uploader && python -m pytest tests/test_extract_other.py -q`
Expected: FAIL with `ImportError: cannot import name 'Extracted'`.

- [ ] **Step 3: Implement**

`uploader/design_uploader/extract/image.py`:
```python
import io
from pathlib import Path

from PIL import Image


def to_png(img: Image.Image, max_side: int = 600) -> bytes:
    img = img.convert("RGB")
    img.thumbnail((max_side, max_side))
    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=True)
    return buf.getvalue()


def extract(path: Path) -> tuple[list[str], bytes | None]:
    with Image.open(path) as img:
        return [], to_png(img)
```

`uploader/design_uploader/extract/psd.py`:
```python
"""PSD/PSB text and thumbnail without loading the whole file (PSBs reach 1.6 GB)."""
import io
import re
import struct
from pathlib import Path

from PIL import Image

from ..words import WordCollector
from .image import to_png

# A text layer stores its string as descriptor key 'Txt ' of type 'TEXT':
# uint32 length in UTF-16 units (including a trailing NUL), then UTF-16BE.
TEXT_MARK = b"Txt TEXT"
CHUNK = 64 * 1024 * 1024
OVERLAP = 64 * 1024
THUMBNAIL_RESOURCE = 1036


def _words(path: Path) -> list[str]:
    words = WordCollector()
    with open(path, "rb") as fh:
        tail = b""
        while chunk := fh.read(CHUNK):
            buf = tail + chunk
            for m in re.finditer(re.escape(TEXT_MARK), buf):
                start = m.end()
                if start + 4 > len(buf):
                    continue
                (units,) = struct.unpack(">I", buf[start:start + 4])
                raw = buf[start + 4:start + 4 + 2 * units]
                words.add_text(raw.decode("utf-16-be", errors="ignore"))
            tail = buf[-OVERLAP:]
    return words.words


def _thumbnail(path: Path) -> bytes | None:
    with open(path, "rb") as fh:
        if fh.read(26)[:4] != b"8BPS":
            return None
        (color_len,) = struct.unpack(">I", fh.read(4))
        fh.seek(color_len, 1)
        (res_len,) = struct.unpack(">I", fh.read(4))
        end = fh.tell() + res_len
        while fh.tell() < end:
            if fh.read(4) != b"8BIM":
                return None
            (rid,) = struct.unpack(">H", fh.read(2))
            (name_len,) = struct.unpack(">B", fh.read(1))
            fh.seek(name_len + (name_len + 1) % 2, 1)  # pascal string padded to even
            (size,) = struct.unpack(">I", fh.read(4))
            data = fh.read(size)
            if size % 2:
                fh.read(1)
            if rid == THUMBNAIL_RESOURCE:
                with Image.open(io.BytesIO(data[28:])) as img:  # 28-byte header, then JPEG
                    return to_png(img)
    return None


def extract(path: Path) -> tuple[list[str], bytes | None]:
    return _words(path), _thumbnail(path)
```

`uploader/design_uploader/extract/pdf.py`:
```python
"""PDF and PDF-compatible Illustrator files: text of the first pages + page 1 render."""
from pathlib import Path

import pymupdf

from ..words import WordCollector

MAX_PAGES = 5
PREVIEW_SIDE = 600


def extract(path: Path) -> tuple[list[str], bytes | None]:
    words = WordCollector()
    doc = pymupdf.open(path, filetype="pdf")
    try:
        for i in range(min(MAX_PAGES, doc.page_count)):
            words.add_text(doc[i].get_text())
        page = doc[0]
        zoom = PREVIEW_SIDE / max(page.rect.width, page.rect.height)
        preview = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom)).tobytes("png")
    finally:
        doc.close()
    return words.words, preview
```

`uploader/design_uploader/extract/__init__.py`:
```python
"""Pick the right extractor for a file and never let one bad file stop a run."""
import zipfile
from dataclasses import dataclass
from pathlib import Path

from . import cdr, image, pdf, psd

KINDS = {
    ".cdr": "cdr", ".psd": "psd", ".psb": "psd", ".pdf": "pdf", ".ai": "ai",
    ".jpg": "image", ".jpeg": "image", ".png": "image", ".ttf": "font", ".otf": "font",
}
EXTRACTORS = {"cdr": cdr.extract, "psd": psd.extract, "pdf": pdf.extract, "ai": pdf.extract, "image": image.extract}


@dataclass
class Extracted:
    kind: str
    status: str
    words: list[str]
    preview_png: bytes | None


def kind_for(suffix: str) -> str:
    return KINDS.get(suffix.lower(), "other")


def extract(path: Path) -> Extracted:
    kind = kind_for(path.suffix)
    extractor = EXTRACTORS.get(kind)
    if extractor is None:
        return Extracted(kind, "no_text", [], None)
    try:
        words, preview = extractor(path)
    except zipfile.BadZipFile:
        return Extracted(kind, "unreadable", [], None)
    except Exception:
        return Extracted(kind, "failed", [], None)
    return Extracted(kind, "ok" if words else "no_text", words, preview)
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd uploader && python -m pytest -q`
Expected: all passed (14).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(uploader): extract Photoshop, PDF and image files

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Folder scan, hashing and local state

**Files:**
- Create: `uploader/design_uploader/scan.py`, `uploader/design_uploader/state.py`
- Test: `uploader/tests/test_scan_state.py`

**Interfaces:**
- Produces:
  ```python
  @dataclass(frozen=True)
  class FoundFile: path: Path; size: int; mtime: float
  def should_skip(path: Path) -> bool
  def iter_files(roots: list[Path]) -> Iterator[FoundFile]
  def sha256_file(path: Path) -> str
  class State:
      def __init__(self, db_path: Path)
      def cached_hash(self, f: FoundFile) -> str | None
      def save_hash(self, f: FoundFile, sha256: str) -> None
      def is_done(self, path: Path, sha256: str) -> bool
      def mark_done(self, path: Path, sha256: str) -> None
  ```

- [ ] **Step 1: Write the failing tests**

`uploader/tests/test_scan_state.py`:
```python
import hashlib
from pathlib import Path

from design_uploader.scan import FoundFile, iter_files, sha256_file, should_skip
from design_uploader.state import State


def test_should_skip():
    assert should_skip(Path("a/.DS_Store"))
    assert should_skip(Path("a/Thumbs.db"))
    assert should_skip(Path("a/debug.log"))
    assert should_skip(Path("a/~$card.cdr"))
    assert not should_skip(Path("a/Backup_of_lara.cdr"))


def test_iter_files_walks_roots_and_skips(tmp_path):
    (tmp_path / "2026 X 1").mkdir()
    (tmp_path / "2026 X 1" / "lara.cdr").write_bytes(b"abc")
    (tmp_path / "2026 X 1" / "debug.log").write_bytes(b"x")
    (tmp_path / "top.psd").write_bytes(b"12345")
    found = sorted(iter_files([tmp_path]), key=lambda f: f.path.name)
    assert [(f.path.name, f.size) for f in found] == [("lara.cdr", 3), ("top.psd", 5)]


def test_sha256_file(tmp_path):
    p = tmp_path / "x.cdr"
    p.write_bytes(b"hello")
    assert sha256_file(p) == hashlib.sha256(b"hello").hexdigest()


def test_state_hash_cache_and_done(tmp_path):
    state = State(tmp_path / "state.db")
    f = FoundFile(tmp_path / "a.cdr", 10, 1000.0)
    assert state.cached_hash(f) is None
    state.save_hash(f, "aa")
    assert state.cached_hash(f) == "aa"
    assert state.cached_hash(FoundFile(f.path, 11, 1000.0)) is None  # size changed
    assert not state.is_done(f.path, "aa")
    state.mark_done(f.path, "aa")
    assert state.is_done(f.path, "aa")
    assert not state.is_done(f.path, "bb")  # file edited since upload
    assert State(tmp_path / "state.db").is_done(f.path, "aa")  # persisted
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd uploader && python -m pytest tests/test_scan_state.py -q`
Expected: FAIL with `ModuleNotFoundError: No module named 'design_uploader.scan'`.

- [ ] **Step 3: Implement**

`uploader/design_uploader/scan.py`:
```python
import hashlib
from collections.abc import Iterator
from dataclasses import dataclass
from pathlib import Path

SKIP_NAMES = {".ds_store", "thumbs.db", "desktop.ini"}
SKIP_SUFFIXES = {".log", ".tmp"}


@dataclass(frozen=True)
class FoundFile:
    path: Path
    size: int
    mtime: float


def should_skip(path: Path) -> bool:
    name = path.name.lower()
    return name in SKIP_NAMES or name.startswith("~$") or path.suffix.lower() in SKIP_SUFFIXES


def iter_files(roots: list[Path]) -> Iterator[FoundFile]:
    for root in roots:
        for path in sorted(root.rglob("*")):
            if path.is_file() and not should_skip(path):
                st = path.stat()
                yield FoundFile(path, st.st_size, st.st_mtime)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as fh:
        while block := fh.read(1024 * 1024):
            digest.update(block)
    return digest.hexdigest()
```

`uploader/design_uploader/state.py`:
```python
"""What this machine already hashed and uploaded, so reruns only do new work."""
import sqlite3
from pathlib import Path

from .scan import FoundFile


class State:
    def __init__(self, db_path: Path):
        self.db = sqlite3.connect(db_path)
        self.db.executescript(
            "create table if not exists hashes (path text primary key, size integer, mtime real, sha256 text);"
            "create table if not exists done (path text primary key, sha256 text);"
        )

    def cached_hash(self, f: FoundFile) -> str | None:
        row = self.db.execute("select size, mtime, sha256 from hashes where path = ?", (str(f.path),)).fetchone()
        if row and row[0] == f.size and row[1] == f.mtime:
            return row[2]
        return None

    def save_hash(self, f: FoundFile, sha256: str) -> None:
        self.db.execute("insert or replace into hashes values (?, ?, ?, ?)", (str(f.path), f.size, f.mtime, sha256))
        self.db.commit()

    def is_done(self, path: Path, sha256: str) -> bool:
        row = self.db.execute("select sha256 from done where path = ?", (str(path),)).fetchone()
        return row is not None and row[0] == sha256

    def mark_done(self, path: Path, sha256: str) -> None:
        self.db.execute("insert or replace into done values (?, ?)", (str(path), sha256))
        self.db.commit()
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd uploader && python -m pytest -q`
Expected: all passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(uploader): scan folders, hash files, remember finished uploads

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Web scaffold, normalization, database schema

**Files:**
- Create: `web/` via create-next-app; `web/vitest.config.ts`, `web/lib/normalize.ts`, `web/lib/normalize.test.ts`, `web/lib/db.ts`, `web/db/schema.sql`, `web/scripts/migrate.mjs`
- Modify: `web/package.json` (scripts), `web/app/layout.tsx` (Arabic, RTL)

**Interfaces:**
- Produces: `normalize(text: string): string`; `nameKey(fileName: string): string` (strip extension, strip any number of leading `Backup_of_`, underscores→spaces, normalize); `buildSearchNorm(parts: (string | null | undefined)[]): string`; `db()` returning a `neon` query function (`sql.query(text, params)` for dynamic SQL, tagged template for static).

- [ ] **Step 1: Scaffold**

```bash
cd D:/work/design-search && npx create-next-app@latest web --ts --app --eslint --tailwind --no-src-dir --import-alias "@/*" --use-npm --yes
cd web && npm install @neondatabase/serverless @aws-sdk/client-s3 @aws-sdk/s3-request-presigner zod && npm install -D vitest
```

Then read `web/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` and `.../01-getting-started/15-route-handlers.md` before writing any Next code. If create-next-app wrote an `AGENTS.md`, keep it.

In `web/package.json` scripts add: `"test": "vitest run"`, `"migrate": "node --env-file=.env.local scripts/migrate.mjs"`.

`web/vitest.config.ts`:
```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: { include: ["lib/**/*.test.ts"] },
});
```

- [ ] **Step 2: Write the failing test**

`web/lib/normalize.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { buildSearchNorm, nameKey, normalize } from "./normalize";

describe("normalize", () => {
  it.each([
    ["سنداً", "سندا"],
    ["أراد إليه آية", "اراد اليه ايه"],
    ["سارة على", "ساره علي"],
    ["دُمت مـــبارك", "دمت مبارك"],
    ["  Lara   21 ", "lara 21"],
  ])("%s -> %s", (input, expected) => {
    expect(normalize(input)).toBe(expected);
  });
});

describe("nameKey", () => {
  it("groups backup copies with their original", () => {
    expect(nameKey("Backup_of_Backup_of_LARA 6.cdr")).toBe("lara 6");
    expect(nameKey("LARA 6.cdr")).toBe("lara 6");
    expect(nameKey("كرت_عرس.psd")).toBe("كرت عرس");
  });
});

describe("buildSearchNorm", () => {
  it("joins the non-empty parts and normalizes them", () => {
    expect(buildSearchNorm(["سنداً قلبي", null, "كرت خطوبة", undefined])).toBe("سندا قلبي كرت خطوبه");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd web && npm test`
Expected: FAIL, cannot find module `./normalize`.

- [ ] **Step 4: Implement**

`web/lib/normalize.ts`:
```ts
const TASHKEEL = /[\u064B-\u0652\u0670\u0640]/g;
const ALEF = /[أإآٱ]/g;

/** One spelling for every Arabic variant, so "سنداً" finds "سندا" and "سارة" finds "ساره". */
export function normalize(text: string): string {
  return text
    .replace(TASHKEEL, "")
    .replace(ALEF, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** File name without extension or CorelDRAW backup prefixes; equal keys are versions of one design. */
export function nameKey(fileName: string): string {
  const stem = fileName.replace(/\.[^.]+$/, "").replace(/^(backup_of_)+/i, "");
  return normalize(stem.replace(/_/g, " "));
}

export function buildSearchNorm(parts: (string | null | undefined)[]): string {
  return normalize(parts.filter(Boolean).join(" "));
}
```

`web/lib/db.ts`:
```ts
import { neon } from "@neondatabase/serverless";

/** Created per call so a missing DATABASE_URL fails the request, not the build. */
export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}
```

`web/db/schema.sql`:
```sql
create extension if not exists pg_trgm;

create table if not exists files (
  sha256 text primary key,
  ext text not null,
  size_bytes bigint not null,
  kind text not null,
  preview_key text,
  extract_status text not null,
  text_raw text not null default '',
  ai_text text,
  ai_description text,
  ai_kind text,
  ai_status text not null,
  search_norm text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists locations (
  id bigserial primary key,
  sha256 text not null references files(sha256),
  machine text not null,
  path text not null,
  file_name text not null,
  name_norm text not null,
  modified_at timestamptz not null,
  unique (machine, path)
);

create index if not exists files_search_trgm on files using gin (search_norm gin_trgm_ops);
create index if not exists locations_name_trgm on locations using gin (name_norm gin_trgm_ops);
create index if not exists locations_sha on locations (sha256);
create index if not exists files_ai_pending on files (created_at) where ai_status = 'pending';
```

`web/scripts/migrate.mjs`:
```js
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");
// The HTTP driver runs one statement per call.
for (const statement of schema.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean)) {
  await sql.query(statement);
}
console.log("schema applied");
```

In `web/app/layout.tsx` set `<html lang="ar" dir="rtl">` and metadata `title: "بحث التصاميم"`. Remove the starter page content from `web/app/page.tsx`, leaving `export default function Home() { return <main /> }` (Task 9 replaces it).

- [ ] **Step 5: Run tests and build**

Run: `cd web && npm test && npm run build`
Expected: tests pass (7); build succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(web): scaffold site, Arabic normalization, database schema

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Shared-password login

**Files:**
- Create: `web/lib/auth.ts`, `web/lib/auth.test.ts`, `web/lib/api-auth.ts`, `web/proxy.ts`, `web/app/login/page.tsx`, `web/app/api/login/route.ts`

**Interfaces:**
- Produces: `SESSION_COOKIE = "ds_session"`, `SESSION_MAX_AGE = 2592000`, `signSession(expiresAtMs: number, secret: string): string`, `verifySession(value: string, secret: string, nowMs?: number): boolean`, `passwordMatches(input: string, expected: string): boolean`, `bearerMatches(header: string | null, token: string): boolean`; `requireApiToken(req: Request): Response | null` (returns a 401 response when the bearer token is wrong, else `null`).

- [ ] **Step 1: Write the failing test**

`web/lib/auth.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { bearerMatches, passwordMatches, signSession, verifySession } from "./auth";

const SECRET = "test-secret";

describe("session cookie", () => {
  it("accepts its own signature before expiry", () => {
    const value = signSession(2_000, SECRET);
    expect(verifySession(value, SECRET, 1_000)).toBe(true);
  });
  it("rejects expired, tampered and foreign values", () => {
    const value = signSession(2_000, SECRET);
    expect(verifySession(value, SECRET, 3_000)).toBe(false);
    expect(verifySession(value.replace("2000", "9000"), SECRET, 1_000)).toBe(false);
    expect(verifySession(value, "other", 1_000)).toBe(false);
    expect(verifySession("garbage", SECRET, 1_000)).toBe(false);
  });
});

describe("password and bearer", () => {
  it("compares exactly", () => {
    expect(passwordMatches("محل123", "محل123")).toBe(true);
    expect(passwordMatches("محل12", "محل123")).toBe(false);
    expect(bearerMatches("Bearer abc", "abc")).toBe(true);
    expect(bearerMatches("Bearer abd", "abc")).toBe(false);
    expect(bearerMatches(null, "abc")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npm test`
Expected: FAIL, cannot find module `./auth`.

- [ ] **Step 3: Implement**

`web/lib/auth.ts`:
```ts
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "ds_session";
export const SESSION_MAX_AGE = 30 * 24 * 3600;

function hmac(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("hex");
}

/** Compare via fixed-length digests so neither length nor content leaks through timing. */
function same(a: string, b: string): boolean {
  const da = createHash("sha256").update(a).digest();
  const dbuf = createHash("sha256").update(b).digest();
  return timingSafeEqual(da, dbuf);
}

export function signSession(expiresAtMs: number, secret: string): string {
  return `${expiresAtMs}.${hmac(String(expiresAtMs), secret)}`;
}

export function verifySession(value: string, secret: string, nowMs = Date.now()): boolean {
  const [expires, signature] = value.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires)) return false;
  return same(signature, hmac(expires, secret)) && Number(expires) > nowMs;
}

export function passwordMatches(input: string, expected: string): boolean {
  return same(input, expected);
}

export function bearerMatches(header: string | null, token: string): boolean {
  return header !== null && same(header, `Bearer ${token}`);
}
```

`web/lib/api-auth.ts`:
```ts
import { bearerMatches } from "./auth";

/** For uploader/describe routes, which the session proxy lets through. */
export function requireApiToken(req: Request): Response | null {
  const token = process.env.API_TOKEN;
  if (token && bearerMatches(req.headers.get("authorization"), token)) return null;
  return Response.json({ error: "unauthorized" }, { status: 401 });
}
```

`web/proxy.ts`:
```ts
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const value = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET;
  if (value && secret && verifySession(value, secret)) return NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  // Login, the token-protected uploader/describe APIs and static assets skip the session check.
  matcher: ["/((?!login|api/login|api/ingest|api/describe|_next/static|_next/image|favicon.ico).*)"],
};
```

`web/app/api/login/route.ts`:
```ts
import { NextResponse } from "next/server";
import { passwordMatches, SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  if (!passwordMatches(password, process.env.SITE_PASSWORD ?? "")) {
    return NextResponse.redirect(new URL("/login?error=1", req.url), 303);
  }
  const res = NextResponse.redirect(new URL("/", req.url), 303);
  res.cookies.set(SESSION_COOKIE, signSession(Date.now() + SESSION_MAX_AGE * 1000, process.env.SESSION_SECRET!), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
```

`web/app/login/page.tsx`:
```tsx
export default async function LoginPage(props: PageProps<"/login">) {
  const { error } = await props.searchParams;
  return (
    <main className="min-h-screen grid place-items-center p-4">
      <form method="post" action="/api/login" className="w-full max-w-xs space-y-3">
        <h1 className="text-xl font-bold">بحث التصاميم</h1>
        <input
          type="password"
          name="password"
          required
          autoFocus
          placeholder="كلمة المرور"
          className="w-full rounded border px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">كلمة المرور غير صحيحة</p>}
        <button className="w-full rounded bg-black px-3 py-2 text-white">دخول</button>
      </form>
    </main>
  );
}
```

- [ ] **Step 4: Run tests and build**

Run: `cd web && npm test && npm run build`
Expected: tests pass; build succeeds (`PageProps` is generated by the build/typegen).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(web): shared-password login and API token check

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: R2 helpers and the ingest API

**Files:**
- Create: `web/lib/r2.ts`, `web/lib/r2.test.ts`, `web/lib/schemas.ts`, `web/lib/schemas.test.ts`, `web/app/api/ingest/check/route.ts`, `web/app/api/ingest/presign/route.ts`, `web/app/api/ingest/register/route.ts`

**Interfaces:**
- Consumes: `db()`, `normalize`/`nameKey`/`buildSearchNorm` (Task 4), `requireApiToken` (Task 5).
- Produces (HTTP, all `Authorization: Bearer <API_TOKEN>`, JSON):
  - `POST /api/ingest/check` `{sha256s: string[]}` (≤1000) → `{known: string[]}`
  - `POST /api/ingest/presign` `{sha256, ext, withPreview}` → `{original: url, preview: url | null}` (PUT URLs, 1 hour)
  - `POST /api/ingest/register` → `{ok: true}`. Two shapes: `{file: FilePayload, location}` for new content, `{sha256, file: null, location}` for a new location of known content (409 `{error: "unknown file"}` if that hash is not in the database).
  - `FilePayload = {sha256, ext, sizeBytes, kind, extractStatus, textRaw, hasPreview}`; `LocationPayload = {machine, path, fileName, modifiedAt}` (ISO string).
- Produces (TS): `originalKey(sha256, ext)`, `previewKey(sha256)`, `presignPut(key)`, `presignGet(key, downloadName?)`, `contentDisposition(name)`; zod schemas `checkBody`, `presignBody`, `registerBody`, `describeBody`, and `SHA256` regex.

- [ ] **Step 1: Write the failing tests**

`web/lib/r2.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { contentDisposition, originalKey, previewKey } from "./r2";

describe("r2 keys", () => {
  it("builds content-addressed keys", () => {
    expect(originalKey("ab".repeat(32), ".cdr")).toBe(`originals/${"ab".repeat(32)}.cdr`);
    expect(previewKey("ab".repeat(32))).toBe(`previews/${"ab".repeat(32)}.png`);
  });
});

describe("contentDisposition", () => {
  it("keeps the Arabic name and an ASCII fallback", () => {
    // Every non-ASCII character and every quote becomes "_" in the fallback.
    const value = contentDisposition('كرت "عرس".cdr');
    expect(value).toBe(`attachment; filename="___ _____.cdr"; filename*=UTF-8''${encodeURIComponent('كرت "عرس".cdr')}`);
  });
});
```

`web/lib/schemas.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { checkBody, presignBody, registerBody } from "./schemas";

const sha = "a".repeat(64);
const location = { machine: "uncle-pc", path: "D:\\2026\\lara9.cdr", fileName: "lara9.cdr", modifiedAt: "2026-09-20T18:19:25Z" };
const file = { sha256: sha, ext: ".cdr", sizeBytes: 435403, kind: "cdr", extractStatus: "ok", textRaw: "سنداً", hasPreview: true };

describe("schemas", () => {
  it("accepts well-formed bodies", () => {
    expect(checkBody.safeParse({ sha256s: [sha] }).success).toBe(true);
    expect(presignBody.safeParse({ sha256: sha, ext: ".cdr", withPreview: true }).success).toBe(true);
    expect(registerBody.safeParse({ file, location }).success).toBe(true);
    expect(registerBody.safeParse({ sha256: sha, file: null, location }).success).toBe(true);
  });
  it("rejects bad hashes, extensions, kinds and statuses", () => {
    expect(checkBody.safeParse({ sha256s: ["xyz"] }).success).toBe(false);
    expect(presignBody.safeParse({ sha256: sha, ext: "cdr", withPreview: true }).success).toBe(false);
    expect(registerBody.safeParse({ file: { ...file, kind: "zip" }, location }).success).toBe(false);
    expect(registerBody.safeParse({ file: { ...file, extractStatus: "maybe" }, location }).success).toBe(false);
    expect(registerBody.safeParse({ file: null, location }).success).toBe(false); // known file needs its hash
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd web && npm test`
Expected: FAIL, cannot find modules `./r2` and `./schemas`.

- [ ] **Step 3: Implement**

`web/lib/r2.ts`:
```ts
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export const originalKey = (sha256: string, ext: string) => `originals/${sha256}${ext}`;
export const previewKey = (sha256: string) => `previews/${sha256}.png`;

/** Arabic name for modern browsers, underscores for the ASCII-only fallback. */
export function contentDisposition(name: string): string {
  const ascii = name.replace(/[^\x20-\x7e]|"/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

export function presignPut(key: string): Promise<string> {
  return getSignedUrl(client(), new PutObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key }), { expiresIn: 3600 });
}

export function presignGet(key: string, downloadName?: string, expiresIn = 600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: key,
    ResponseContentDisposition: downloadName ? contentDisposition(downloadName) : undefined,
  });
  return getSignedUrl(client(), command, { expiresIn });
}
```

`web/lib/schemas.ts`:
```ts
import { z } from "zod";

export const SHA256 = /^[0-9a-f]{64}$/;
const sha256 = z.string().regex(SHA256);

export const checkBody = z.object({ sha256s: z.array(sha256).max(1000) });

export const presignBody = z.object({
  sha256,
  ext: z.string().regex(/^\.[a-z0-9]{1,6}$/),
  withPreview: z.boolean(),
});

export const registerBody = z
  .object({
  sha256: sha256.optional(),
  file: z
    .object({
      sha256,
      ext: z.string().regex(/^\.[a-z0-9]{0,6}$/),
      sizeBytes: z.number().int().nonnegative(),
      kind: z.enum(["cdr", "psd", "pdf", "ai", "image", "font", "other"]),
      extractStatus: z.enum(["ok", "no_text", "unreadable", "failed"]),
      textRaw: z.string().max(100_000),
      hasPreview: z.boolean(),
    })
    .nullable(),
  location: z.object({
    machine: z.string().min(1).max(100),
    path: z.string().min(1).max(1000),
    fileName: z.string().min(1).max(300),
    modifiedAt: z.string().datetime({ offset: true }),
  }),
  })
  .refine((b) => b.file !== null || b.sha256 !== undefined, { message: "sha256 required when file is null" });

export const describeBody = z.object({
  aiText: z.string().max(5000),
  aiDescription: z.string().max(2000),
  aiKind: z.string().max(50),
});
```

(Extensions are lowercased by the uploader; a file with no extension sends `""`, which `registerBody` allows and `presignBody` does not — such files get `ext: ".bin"` from the uploader, see Task 7.)

`web/app/api/ingest/check/route.ts`:
```ts
import { requireApiToken } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { checkBody } from "@/lib/schemas";

export async function POST(req: Request) {
  const denied = requireApiToken(req);
  if (denied) return denied;
  const body = checkBody.safeParse(await req.json());
  if (!body.success) return Response.json({ error: body.error.message }, { status: 400 });
  const rows = await db().query("select sha256 from files where sha256 = any($1)", [body.data.sha256s]);
  return Response.json({ known: rows.map((r) => r.sha256) });
}
```

`web/app/api/ingest/presign/route.ts`:
```ts
import { requireApiToken } from "@/lib/api-auth";
import { originalKey, presignPut, previewKey } from "@/lib/r2";
import { presignBody } from "@/lib/schemas";

export async function POST(req: Request) {
  const denied = requireApiToken(req);
  if (denied) return denied;
  const body = presignBody.safeParse(await req.json());
  if (!body.success) return Response.json({ error: body.error.message }, { status: 400 });
  const { sha256, ext, withPreview } = body.data;
  return Response.json({
    original: await presignPut(originalKey(sha256, ext)),
    preview: withPreview ? await presignPut(previewKey(sha256)) : null,
  });
}
```

`web/app/api/ingest/register/route.ts`:
```ts
import { requireApiToken } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { buildSearchNorm, nameKey } from "@/lib/normalize";
import { previewKey } from "@/lib/r2";
import { registerBody } from "@/lib/schemas";

export async function POST(req: Request) {
  const denied = requireApiToken(req);
  if (denied) return denied;
  const body = registerBody.safeParse(await req.json());
  if (!body.success) return Response.json({ error: body.error.message }, { status: 400 });
  const { file, location } = body.data;
  const sha256 = file?.sha256 ?? body.data.sha256!;
  const sql = db();

  if (file) {
    await sql.query(
      `insert into files (sha256, ext, size_bytes, kind, preview_key, extract_status, text_raw, ai_status, search_norm)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       on conflict (sha256) do nothing`,
      [
        file.sha256,
        file.ext,
        file.sizeBytes,
        file.kind,
        file.hasPreview ? previewKey(file.sha256) : null,
        file.extractStatus,
        file.textRaw,
        file.hasPreview ? "pending" : "skipped",
        buildSearchNorm([file.textRaw]),
      ],
    );
  } else {
    const known = await sql.query("select 1 from files where sha256 = $1", [sha256]);
    if (known.length === 0) return Response.json({ error: "unknown file" }, { status: 409 });
  }

  // An edited file keeps its path but gets a new hash, so the location moves to the new file.
  await sql.query(
    `insert into locations (sha256, machine, path, file_name, name_norm, modified_at)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (machine, path) do update
       set sha256 = excluded.sha256, file_name = excluded.file_name,
           name_norm = excluded.name_norm, modified_at = excluded.modified_at`,
    [sha256, location.machine, location.path, location.fileName, nameKey(location.fileName), location.modifiedAt],
  );
  return Response.json({ ok: true });
}
```

- [ ] **Step 4: Run tests and build**

Run: `cd web && npm test && npm run build`
Expected: tests pass; build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(web): ingest API with presigned R2 uploads

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Uploader API client, upload run and CLI

**Files:**
- Create: `uploader/design_uploader/api.py`, `uploader/design_uploader/runner.py`, `uploader/design_uploader/main.py`, `uploader/design_uploader/__main__.py`, `uploader/config.example.json`
- Test: `uploader/tests/test_api.py`, `uploader/tests/test_runner.py`

**Interfaces:**
- Consumes: `extract`, `Extracted` (Task 2); `FoundFile`, `iter_files`, `sha256_file`, `State` (Task 3); ingest API (Task 6).
- Produces:
  ```python
  class Api:
      def __init__(self, base_url: str, token: str, client: httpx.Client | None = None, sleep=time.sleep)
      def known(self, sha256s: list[str]) -> set[str]
      def presign(self, sha256: str, ext: str, with_preview: bool) -> dict
      def put_bytes(self, url: str, data: bytes) -> None
      def put_file(self, url: str, path: Path, size: int) -> None
      def register(self, payload: dict) -> None
      def pending(self, limit: int) -> list[dict]          # Task 10 uses
      def download(self, url: str) -> bytes                 # Task 10 uses
      def describe(self, sha256: str, body: dict) -> None   # Task 10 uses
  @dataclass
  class Summary: uploaded: int = 0; linked: int = 0; skipped: int = 0; failed: list[tuple[str, str]]
  def run_upload(files, state, api, machine, extract_fn=extract, log=print) -> Summary
  def count_files(files) -> dict[str, tuple[int, int]]   # ext -> (count, bytes)
  ```
- CLI: `python -m design_uploader [--config PATH] upload [--count-only]`, plus `describe-pull`/`describe-push` added in Task 10. Running with no subcommand means `upload`.

- [ ] **Step 1: Write the failing tests**

`uploader/tests/test_api.py`:
```python
import json

import httpx
import pytest

from design_uploader.api import Api


def make_api(handler):
    return Api("https://site.test/", "tok", client=httpx.Client(transport=httpx.MockTransport(handler)), sleep=lambda s: None)


def test_known_batches_and_sends_token():
    seen = []

    def handler(request):
        assert request.headers["authorization"] == "Bearer tok"
        shas = json.loads(request.content)["sha256s"]
        seen.append(len(shas))
        return httpx.Response(200, json={"known": shas[:1]})

    api = make_api(handler)
    known = api.known([f"{i:064x}" for i in range(1200)])
    assert seen == [500, 500, 200]
    assert len(known) == 3


def test_retries_server_errors_then_succeeds():
    calls = []

    def handler(request):
        calls.append(1)
        return httpx.Response(503) if len(calls) < 3 else httpx.Response(200, json={"ok": True})

    make_api(handler).register({"x": 1})
    assert len(calls) == 3


def test_client_errors_are_not_retried():
    calls = []

    def handler(request):
        calls.append(1)
        return httpx.Response(409, json={"error": "unknown file"})

    with pytest.raises(httpx.HTTPStatusError):
        make_api(handler).register({"x": 1})
    assert len(calls) == 1


def test_put_file_sends_length(tmp_path):
    p = tmp_path / "a.cdr"
    p.write_bytes(b"12345")

    def handler(request):
        assert request.headers["content-length"] == "5"
        assert request.read() == b"12345"
        return httpx.Response(200)

    make_api(handler).put_file("https://r2.test/put", p, 5)
```

`uploader/tests/test_runner.py`:
```python
from pathlib import Path

from design_uploader.extract import Extracted
from design_uploader.runner import count_files, run_upload
from design_uploader.scan import FoundFile, sha256_file
from design_uploader.state import State


class FakeApi:
    def __init__(self, known=()):
        self._known = set(known)
        self.puts = []
        self.registered = []

    def known(self, shas):
        return {s for s in shas if s in self._known}

    def presign(self, sha, ext, with_preview):
        return {"original": f"put/{sha}{ext}", "preview": f"put/{sha}.png" if with_preview else None}

    def put_file(self, url, path, size):
        self.puts.append(url)

    def put_bytes(self, url, data):
        self.puts.append(url)

    def register(self, payload):
        if payload.get("fail"):
            raise RuntimeError("boom")
        self.registered.append(payload)


def found(path: Path) -> FoundFile:
    st = path.stat()
    return FoundFile(path, st.st_size, st.st_mtime)


def fake_extract(path):
    return Extracted("cdr", "ok", ["سنداً"], b"\x89PNG")


def test_new_file_is_uploaded_known_file_is_linked_done_file_is_skipped(tmp_path):
    new = tmp_path / "lara9.cdr"
    new.write_bytes(b"new")
    copy = tmp_path / "Backup_of_lara9.cdr"
    copy.write_bytes(b"old-known")
    state = State(tmp_path / "state.db")
    api = FakeApi(known=[sha256_file(copy)])

    summary = run_upload([found(new), found(copy)], state, api, "pc", extract_fn=fake_extract, log=lambda *_: None)
    assert (summary.uploaded, summary.linked, summary.skipped, summary.failed) == (1, 1, 0, [])
    new_sha = sha256_file(new)
    assert api.puts == [f"put/{new_sha}.cdr", f"put/{new_sha}.png"]
    file_payload = next(p for p in api.registered if p["file"])
    assert file_payload["file"]["textRaw"] == "سنداً"
    assert file_payload["location"]["fileName"] == "lara9.cdr"
    link_payload = next(p for p in api.registered if not p["file"])
    assert link_payload["sha256"] == sha256_file(copy)

    again = run_upload([found(new), found(copy)], state, api, "pc", extract_fn=fake_extract, log=lambda *_: None)
    assert (again.uploaded, again.linked, again.skipped) == (0, 0, 2)


def test_same_content_twice_in_one_run_uploads_once(tmp_path):
    a = tmp_path / "a.cdr"
    b = tmp_path / "b.cdr"
    a.write_bytes(b"same")
    b.write_bytes(b"same")
    api = FakeApi()
    summary = run_upload([found(a), found(b)], State(tmp_path / "s.db"), api, "pc", extract_fn=fake_extract, log=lambda *_: None)
    assert (summary.uploaded, summary.linked) == (1, 1)


def test_failures_are_collected_and_not_marked_done(tmp_path):
    a = tmp_path / "a.cdr"
    a.write_bytes(b"x")
    api = FakeApi()
    api.register = lambda payload: (_ for _ in ()).throw(RuntimeError("network down"))
    state = State(tmp_path / "s.db")
    summary = run_upload([found(a)], state, api, "pc", extract_fn=fake_extract, log=lambda *_: None)
    assert summary.failed == [(str(a), "RuntimeError('network down')")]
    assert not state.is_done(a, sha256_file(a))


def test_count_files(tmp_path):
    (tmp_path / "a.cdr").write_bytes(b"12")
    (tmp_path / "b.CDR").write_bytes(b"345")
    (tmp_path / "c.psd").write_bytes(b"6")
    counts = count_files([found(p) for p in sorted(tmp_path.iterdir())])
    assert counts == {".cdr": (2, 5), ".psd": (1, 1)}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd uploader && python -m pytest tests/test_api.py tests/test_runner.py -q`
Expected: FAIL with `ModuleNotFoundError: No module named 'design_uploader.api'`.

- [ ] **Step 3: Implement**

`uploader/design_uploader/api.py`:
```python
"""HTTP client for the search site and R2 presigned URLs, with retries for flaky shop internet."""
import time
from pathlib import Path

import httpx

ATTEMPTS = 4


class Api:
    def __init__(self, base_url: str, token: str, client: httpx.Client | None = None, sleep=time.sleep):
        self.base = base_url.rstrip("/")
        self.headers = {"Authorization": f"Bearer {token}"}
        self.client = client or httpx.Client(timeout=httpx.Timeout(60, read=600, write=600))
        self.sleep = sleep

    def _retry(self, send) -> httpx.Response:
        for attempt in range(1, ATTEMPTS + 1):
            try:
                response = send()
            except httpx.TransportError:
                if attempt == ATTEMPTS:
                    raise
            else:
                if response.status_code < 500 or attempt == ATTEMPTS:
                    response.raise_for_status()
                    return response
            self.sleep(2 ** attempt)
        raise AssertionError("unreachable")

    def _post(self, path: str, body: dict) -> httpx.Response:
        return self._retry(lambda: self.client.post(f"{self.base}{path}", json=body, headers=self.headers))

    def known(self, sha256s: list[str]) -> set[str]:
        known: set[str] = set()
        for i in range(0, len(sha256s), 500):
            known.update(self._post("/api/ingest/check", {"sha256s": sha256s[i:i + 500]}).json()["known"])
        return known

    def presign(self, sha256: str, ext: str, with_preview: bool) -> dict:
        return self._post("/api/ingest/presign", {"sha256": sha256, "ext": ext, "withPreview": with_preview}).json()

    def put_bytes(self, url: str, data: bytes) -> None:
        self._retry(lambda: self.client.put(url, content=data))

    def put_file(self, url: str, path: Path, size: int) -> None:
        def send():
            with open(path, "rb") as fh:
                # R2 presigned PUT needs a length, not chunked encoding.
                return self.client.put(url, content=fh, headers={"Content-Length": str(size)})
        self._retry(send)

    def register(self, payload: dict) -> None:
        self._post("/api/ingest/register", payload)

    def pending(self, limit: int) -> list[dict]:
        return self._retry(lambda: self.client.get(
            f"{self.base}/api/describe/pending", params={"limit": limit}, headers=self.headers)).json()["items"]

    def download(self, url: str) -> bytes:
        return self._retry(lambda: self.client.get(url)).content

    def describe(self, sha256: str, body: dict) -> None:
        self._post(f"/api/describe/{sha256}", body)
```

`uploader/design_uploader/runner.py`:
```python
"""One upload run: hash, skip what is done, upload new content once, record every location."""
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone

from .extract import extract
from .scan import FoundFile, sha256_file

MAX_TEXT = 100_000


@dataclass
class Summary:
    uploaded: int = 0
    linked: int = 0
    skipped: int = 0
    failed: list[tuple[str, str]] = field(default_factory=list)


def count_files(files: list[FoundFile]) -> dict[str, tuple[int, int]]:
    counts: dict[str, list[int]] = defaultdict(lambda: [0, 0])
    for f in files:
        entry = counts[f.path.suffix.lower()]
        entry[0] += 1
        entry[1] += f.size
    return {ext: (n, size) for ext, (n, size) in counts.items()}


def _location(f: FoundFile, machine: str) -> dict:
    modified = datetime.fromtimestamp(f.mtime, tz=timezone.utc).isoformat()
    return {"machine": machine, "path": str(f.path), "fileName": f.path.name, "modifiedAt": modified}


def run_upload(files, state, api, machine: str, extract_fn=extract, log=print) -> Summary:
    summary = Summary()
    hashed = []
    for f in files:
        sha = state.cached_hash(f)
        if sha is None:
            sha = sha256_file(f.path)
            state.save_hash(f, sha)
        hashed.append((f, sha))

    todo = [(f, sha) for f, sha in hashed if not state.is_done(f.path, sha)]
    summary.skipped = len(hashed) - len(todo)
    known = api.known(sorted({sha for _, sha in todo}))
    log(f"{len(hashed)} ملف، {summary.skipped} مرفوع سابقاً، {len(todo)} للمعالجة")

    for i, (f, sha) in enumerate(todo, 1):
        try:
            if sha in known:
                api.register({"sha256": sha, "file": None, "location": _location(f, machine)})
                summary.linked += 1
            else:
                ext = f.path.suffix.lower() or ".bin"
                result = extract_fn(f.path)
                urls = api.presign(sha, ext, result.preview_png is not None)
                api.put_file(urls["original"], f.path, f.size)
                if result.preview_png is not None:
                    api.put_bytes(urls["preview"], result.preview_png)
                api.register({
                    "file": {
                        "sha256": sha, "ext": ext, "sizeBytes": f.size, "kind": result.kind,
                        "extractStatus": result.status, "textRaw": " ".join(result.words)[:MAX_TEXT],
                        "hasPreview": result.preview_png is not None,
                    },
                    "location": _location(f, machine),
                })
                known.add(sha)
                summary.uploaded += 1
            state.mark_done(f.path, sha)
            log(f"[{i}/{len(todo)}] {f.path.name}")
        except Exception as e:  # one bad file must not stop the run
            summary.failed.append((str(f.path), repr(e)))
            log(f"[{i}/{len(todo)}] فشل: {f.path.name}: {e!r}")
    return summary
```

`uploader/design_uploader/main.py`:
```python
"""Command line entry: `upload` (default), `upload --count-only`, `describe-pull`, `describe-push`."""
import argparse
import json
import sys
from pathlib import Path

from .api import Api
from .runner import count_files, run_upload
from .scan import iter_files
from .state import State


def app_dir() -> Path:
    # Next to the .exe when packaged, otherwise the current folder.
    return Path(sys.executable).parent if getattr(sys, "frozen", False) else Path.cwd()


def load_config(path: Path | None) -> dict:
    path = path or app_dir() / "config.json"
    return json.loads(path.read_text(encoding="utf-8"))


def cmd_upload(config: dict, count_only: bool) -> int:
    files = list(iter_files([Path(r) for r in config["roots"]]))
    if count_only:
        total = 0
        for ext, (n, size) in sorted(count_files(files).items(), key=lambda kv: -kv[1][1]):
            print(f"{ext or '(بدون امتداد)':10} {n:7} ملف  {size / 1e9:8.2f} GB")
            total += size
        print(f"المجموع: {len(files)} ملف، {total / 1e9:.2f} GB")
        return 0
    api = Api(config["site_url"], config["api_token"])
    summary = run_upload(files, State(app_dir() / "state.db"), api, config["machine"])
    errors = app_dir() / "upload-errors.txt"
    if summary.failed:
        errors.write_text("\n".join(f"{p}\t{e}" for p, e in summary.failed), encoding="utf-8")
    print(f"\nرُفع {summary.uploaded} جديد، {summary.linked} نسخة لملف موجود، "
          f"{summary.skipped} مرفوع سابقاً، {len(summary.failed)} فشل")
    if summary.failed:
        print(f"أسباب الفشل في: {errors}")
    return 1 if summary.failed else 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="design-uploader")
    parser.add_argument("--config", type=Path)
    sub = parser.add_subparsers(dest="command")
    up = sub.add_parser("upload")
    up.add_argument("--count-only", action="store_true")
    args = parser.parse_args(argv)
    config = load_config(args.config)
    code = cmd_upload(config, getattr(args, "count_only", False))
    if getattr(sys, "frozen", False) and sys.stdin.isatty():
        input("\nاضغط Enter للإغلاق")
    return code
```

`uploader/design_uploader/__main__.py`:
```python
import sys

from .main import main

sys.exit(main())
```

`uploader/config.example.json`:
```json
{
  "site_url": "https://design-search.example.vercel.app",
  "api_token": "PASTE-API_TOKEN-HERE",
  "machine": "uncle-pc",
  "roots": ["D:\\Designs"]
}
```

On Windows consoles Arabic output needs UTF-8: at the top of `main()` add
```python
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd uploader && python -m pytest -q`
Expected: all passed.

- [ ] **Step 5: Try count-only against the sample (read-only)**

Create `uploader/config.json` (gitignored) with `"roots": ["G:\\My Drive\\sumar\\2026"]`, any `site_url`/`api_token`, `"machine": "omar-sample"`.
Run: `cd uploader && python -m design_uploader upload --count-only`
Expected: `.cdr` about 516 files, total about 629 files / 5.6 GB (minus skipped `.log`/`.DS_Store`).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(uploader): upload run with retries, dedup and count-only mode

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Search, details, preview and download APIs

**Files:**
- Create: `web/lib/search.ts`, `web/lib/search.test.ts`, `web/app/api/search/route.ts`, `web/app/api/file/[sha256]/route.ts`, `web/app/api/preview/[sha256]/route.ts`, `web/app/api/download/[locationId]/route.ts`

**Interfaces:**
- Consumes: `normalize` (Task 4), `db()` (Task 4), `presignGet`, `previewKey`, `originalKey` (Task 6), `SHA256` (Task 6). Session cookie enforced by `proxy.ts` (Task 5).
- Produces:
  - `buildSearchQuery(opts: {q: string; kind?: string; year?: number; limit: number; offset: number}): {text: string; params: unknown[]; terms: string[]}`
  - `matchedWords(text: string, terms: string[], max?: number): string[]`
  - `GET /api/search?q=&kind=&year=&page=` → `{results: SearchResult[]}` where `SearchResult = {sha256, kind, previewUrl: string | null, locationId: number, fileName, path, modifiedAt, matched: string[]}`; page size 40.
  - `GET /api/file/[sha256]` → `{file: {sha256, kind, extractStatus, textRaw, aiText, aiDescription, aiKind}, locations: Loc[], versions: Loc[]}` with `Loc = {id, sha256, fileName, path, machine, modifiedAt}`.
  - `GET /api/preview/[sha256]` → 302 to presigned preview.
  - `GET /api/download/[locationId]` → 302 to presigned original with the original file name.

- [ ] **Step 1: Write the failing test**

`web/lib/search.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { buildSearchQuery, matchedWords } from "./search";

describe("buildSearchQuery", () => {
  it("normalizes terms and requires each one", () => {
    const q = buildSearchQuery({ q: "سنداً  قلبي", limit: 40, offset: 0 });
    expect(q.terms).toEqual(["سندا", "قلبي"]);
    expect(q.params).toContain("%سندا%");
    expect(q.params).toContain("%قلبي%");
    expect(q.text.match(/<% f\.search_norm/g)).toHaveLength(2);
    expect(q.text).toContain("f.kind not in ('font', 'other')");
  });

  it("escapes LIKE wildcards in user input", () => {
    const q = buildSearchQuery({ q: "50%_off", limit: 40, offset: 0 });
    expect(q.params).toContain("%50\\%\\_off%");
  });

  it("applies kind and year filters", () => {
    const q = buildSearchQuery({ q: "", kind: "psd", year: 2026, limit: 40, offset: 80 });
    expect(q.terms).toEqual([]);
    expect(q.params).toEqual(expect.arrayContaining(["psd", 2026, 40, 80]));
    expect(q.text).toContain("f.kind = $");
    expect(q.text).not.toContain("not in");
  });
});

describe("matchedWords", () => {
  it("returns original spellings whose normalized form contains a term", () => {
    expect(matchedWords("دُمت سنداً قلبي سنداً", ["سندا"])).toEqual(["سنداً"]);
    expect(matchedWords("a b c", ["x"])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npm test`
Expected: FAIL, cannot find module `./search`.

- [ ] **Step 3: Implement**

`web/lib/search.ts`:
```ts
import { normalize } from "./normalize";

export type SearchOptions = { q: string; kind?: string; year?: number; limit: number; offset: number };

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Every term must appear (exactly or fuzzily) in the design's text or file name; whole-word hits rank first. */
export function buildSearchQuery(opts: SearchOptions) {
  const terms = normalize(opts.q).split(" ").filter(Boolean).slice(0, 8);
  const params: unknown[] = [];
  const p = (v: unknown) => {
    params.push(v);
    return `$${params.length}`;
  };
  const where: string[] = [];
  const score: string[] = [];
  for (const term of terms) {
    const like = p(`%${escapeLike(term)}%`);
    const raw = p(term);
    where.push(`(f.search_norm like ${like} or l.name_norm like ${like} or ${raw} <% f.search_norm)`);
    const word = p(`(^| )${escapeRegex(term)}( |$)`);
    score.push(
      `(case when f.search_norm ~ ${word} or l.name_norm ~ ${word} then 2 ` +
        `when f.search_norm like ${like} or l.name_norm like ${like} then 1 else 0 end)`,
    );
  }
  where.push(opts.kind ? `f.kind = ${p(opts.kind)}` : `f.kind not in ('font', 'other')`);
  if (opts.year) where.push(`extract(year from l.modified_at) = ${p(opts.year)}`);

  const text = `
    select * from (
      select distinct on (f.sha256)
        f.sha256, f.kind, f.preview_key is not null as has_preview, f.text_raw, f.ai_text,
        l.id as location_id, l.file_name, l.path, l.modified_at,
        ${score.length ? score.join(" + ") : "0"} as score
      from locations l join files f on f.sha256 = l.sha256
      where ${where.join(" and ")}
      order by f.sha256, l.modified_at desc
    ) r
    order by score desc, modified_at desc
    limit ${p(opts.limit)} offset ${p(opts.offset)}`;
  return { text, params, terms };
}

export function matchedWords(text: string, terms: string[], max = 6): string[] {
  const out: string[] = [];
  for (const word of new Set(text.split(/\s+/).filter(Boolean))) {
    const n = normalize(word);
    if (terms.some((t) => n.includes(t))) out.push(word);
    if (out.length === max) break;
  }
  return out;
}
```

`web/app/api/search/route.ts`:
```ts
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { buildSearchQuery, matchedWords } from "@/lib/search";

const PAGE = 40;
const KINDS = new Set(["cdr", "psd", "pdf", "ai", "image", "font", "other"]);

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const kind = sp.get("kind") ?? "";
  const year = Number(sp.get("year")) || undefined;
  const page = Math.max(0, Number(sp.get("page")) || 0);
  const query = buildSearchQuery({
    q: sp.get("q") ?? "",
    kind: KINDS.has(kind) ? kind : undefined,
    year,
    limit: PAGE,
    offset: page * PAGE,
  });
  const rows = await db().query(query.text, query.params);
  return Response.json({
    results: rows.map((r) => ({
      sha256: r.sha256,
      kind: r.kind,
      previewUrl: r.has_preview ? `/api/preview/${r.sha256}` : null,
      locationId: Number(r.location_id),
      fileName: r.file_name,
      path: r.path,
      modifiedAt: r.modified_at,
      matched: matchedWords(`${r.text_raw} ${r.ai_text ?? ""}`, query.terms),
    })),
  });
}
```

`web/app/api/file/[sha256]/route.ts`:
```ts
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { SHA256 } from "@/lib/schemas";

const LOC = "id, sha256, file_name as \"fileName\", path, machine, modified_at as \"modifiedAt\"";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/file/[sha256]">) {
  const { sha256 } = await ctx.params;
  if (!SHA256.test(sha256)) return Response.json({ error: "bad hash" }, { status: 400 });
  const sql = db();
  const [file] = await sql.query(
    `select sha256, kind, extract_status as "extractStatus", text_raw as "textRaw", ai_text as "aiText",
            ai_description as "aiDescription", ai_kind as "aiKind"
     from files where sha256 = $1`,
    [sha256],
  );
  if (!file) return Response.json({ error: "not found" }, { status: 404 });
  const locations = await sql.query(`select ${LOC} from locations where sha256 = $1 order by modified_at desc`, [sha256]);
  const versions = await sql.query(
    `select ${LOC} from locations
     where name_norm in (select name_norm from locations where sha256 = $1) and sha256 <> $1
     order by modified_at desc limit 20`,
    [sha256],
  );
  return Response.json({ file, locations, versions });
}
```

`web/app/api/preview/[sha256]/route.ts`:
```ts
import type { NextRequest } from "next/server";
import { presignGet, previewKey } from "@/lib/r2";
import { SHA256 } from "@/lib/schemas";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/preview/[sha256]">) {
  const { sha256 } = await ctx.params;
  if (!SHA256.test(sha256)) return new Response("bad hash", { status: 400 });
  const url = await presignGet(previewKey(sha256), undefined, 3600);
  return new Response(null, { status: 302, headers: { Location: url, "Cache-Control": "private, max-age=1800" } });
}
```

`web/app/api/download/[locationId]/route.ts`:
```ts
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { originalKey, presignGet } from "@/lib/r2";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/download/[locationId]">) {
  const { locationId } = await ctx.params;
  if (!/^\d+$/.test(locationId)) return new Response("bad id", { status: 400 });
  const [row] = await db().query(
    "select l.file_name, f.sha256, f.ext from locations l join files f on f.sha256 = l.sha256 where l.id = $1",
    [Number(locationId)],
  );
  if (!row) return new Response("not found", { status: 404 });
  const url = await presignGet(originalKey(row.sha256, row.ext || ".bin"), row.file_name);
  return new Response(null, { status: 302, headers: { Location: url } });
}
```

- [ ] **Step 4: Run tests and build**

Run: `cd web && npm test && npm run build`
Expected: tests pass; build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(web): search, details, preview and download APIs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Search page

**Files:**
- Create: `web/components/SearchPage.tsx`, `web/components/ResultCard.tsx`, `web/components/DetailsDialog.tsx`
- Modify: `web/app/page.tsx`

**Interfaces:**
- Consumes: `GET /api/search`, `GET /api/file/[sha256]`, `/api/preview/[sha256]`, `/api/download/[locationId]` (Task 8).
- Produces: the page at `/` described in the spec, section "الموقع".

- [ ] **Step 1: Implement the components**

`web/components/ResultCard.tsx`:
```tsx
"use client";

export type SearchResult = {
  sha256: string;
  kind: string;
  previewUrl: string | null;
  locationId: number;
  fileName: string;
  path: string;
  modifiedAt: string;
  matched: string[];
};

export function ResultCard({ result, onOpen }: { result: SearchResult; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="flex flex-col overflow-hidden rounded-lg border text-right hover:shadow">
      <div className="grid aspect-square place-items-center bg-neutral-50">
        {result.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- presigned redirect, not optimizable
          <img src={result.previewUrl} alt={result.fileName} loading="lazy" className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-sm text-neutral-400">بدون معاينة</span>
        )}
      </div>
      <div className="space-y-1 p-2">
        <p className="truncate text-sm font-medium" dir="auto">{result.fileName}</p>
        <p className="text-xs text-neutral-500">{new Date(result.modifiedAt).toLocaleDateString("ar")}</p>
        {result.matched.length > 0 && (
          <p className="flex flex-wrap gap-1">
            {result.matched.map((w) => (
              <mark key={w} className="rounded bg-yellow-200 px-1 text-xs">{w}</mark>
            ))}
          </p>
        )}
      </div>
    </button>
  );
}
```

`web/components/DetailsDialog.tsx`:
```tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Loc = { id: number; sha256: string; fileName: string; path: string; machine: string; modifiedAt: string };
type Details = {
  file: { sha256: string; kind: string; extractStatus: string; textRaw: string; aiText: string | null; aiDescription: string | null; aiKind: string | null };
  locations: Loc[];
  versions: Loc[];
};

export function DetailsDialog({ sha256, onClose }: { sha256: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [details, setDetails] = useState<Details | null>(null);

  useEffect(() => {
    ref.current?.showModal();
    fetch(`/api/file/${sha256}`).then((r) => r.json()).then(setDetails);
  }, [sha256]);

  const main = details?.locations[0];
  return (
    <dialog ref={ref} onClose={onClose} className="w-full max-w-3xl rounded-lg p-0 backdrop:bg-black/50">
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold" dir="auto">{main?.fileName ?? "…"}</h2>
          <button onClick={() => ref.current?.close()} aria-label="إغلاق" className="px-2 text-xl">×</button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/preview/${sha256}`} alt="" className="mx-auto max-h-[50vh] object-contain" />
        {main && (
          <div className="flex flex-wrap items-center gap-2">
            <a href={`/api/download/${main.id}`} className="rounded bg-black px-3 py-2 text-white">تنزيل</a>
            <code className="rounded bg-neutral-100 px-2 py-1 text-xs" dir="ltr">{main.path}</code>
            <button onClick={() => navigator.clipboard.writeText(main.path)} className="text-sm underline">نسخ المسار</button>
          </div>
        )}
        {details?.file.aiDescription && (
          <section>
            <h3 className="text-sm font-bold">الوصف</h3>
            <p className="text-sm">{details.file.aiKind && `${details.file.aiKind} — `}{details.file.aiDescription}</p>
          </section>
        )}
        {(details?.file.textRaw || details?.file.aiText) && (
          <section>
            <h3 className="text-sm font-bold">النص في التصميم</h3>
            <p className="text-sm leading-7">{[details.file.textRaw, details.file.aiText].filter(Boolean).join(" · ")}</p>
          </section>
        )}
        {details && details.versions.length > 0 && (
          <section>
            <h3 className="text-sm font-bold">نسخ أخرى</h3>
            <ul className="text-sm">
              {details.versions.map((v) => (
                <li key={v.id} className="flex gap-2">
                  <a href={`/api/download/${v.id}`} className="underline" dir="auto">{v.fileName}</a>
                  <span className="text-neutral-500">{new Date(v.modifiedAt).toLocaleDateString("ar")}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </dialog>
  );
}
```

`web/components/SearchPage.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { DetailsDialog } from "./DetailsDialog";
import { ResultCard, type SearchResult } from "./ResultCard";

const KINDS = [
  ["", "كل الأنواع"],
  ["cdr", "كوريل"],
  ["psd", "فوتوشوب"],
  ["pdf", "PDF"],
  ["ai", "Illustrator"],
  ["image", "صور"],
] as const;
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR - 2009 }, (_, i) => THIS_YEAR - i);

export function SearchPage() {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const [year, setYear] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      const params = new URLSearchParams({ q, kind, year });
      try {
        const res = await fetch(`/api/search?${params}`, { signal: controller.signal });
        if (res.status === 401) return window.location.assign("/login");
        setResults((await res.json()).results);
      } catch (e) {
        if ((e as Error).name !== "AbortError") throw e;
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, kind, year]);

  return (
    <main className="mx-auto max-w-7xl space-y-4 p-4">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
        placeholder="ابحث بكلمة من التصميم أو وصفه… مثل: سنداً، كرت خطوبة مزخرف"
        className="w-full rounded-lg border px-4 py-3 text-lg"
      />
      <div className="flex gap-2">
        <select value={kind} onChange={(e) => setKind(e.target.value)} className="rounded border px-2 py-1">
          {KINDS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)} className="rounded border px-2 py-1">
          <option value="">كل السنوات</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        {loading && <span className="self-center text-sm text-neutral-500">جارٍ البحث…</span>}
      </div>
      {!loading && results.length === 0 && <p className="text-neutral-500">لا توجد نتائج</p>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {results.map((r) => <ResultCard key={r.sha256} result={r} onOpen={() => setOpen(r.sha256)} />)}
      </div>
      {open && <DetailsDialog sha256={open} onClose={() => setOpen(null)} />}
    </main>
  );
}
```

`web/app/page.tsx`:
```tsx
import { SearchPage } from "@/components/SearchPage";

export default function Home() {
  return <SearchPage />;
}
```

- [ ] **Step 2: Lint and build**

Run: `cd web && npm run lint && npm run build`
Expected: no errors. (Visual check happens in Task 12 with real data.)

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(web): search page with previews, details and download

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Preview descriptions by Claude Code

**Files:**
- Create: `web/app/api/describe/pending/route.ts`, `web/app/api/describe/[sha256]/route.ts`, `uploader/design_uploader/describe.py`, `uploader/DESCRIBE.md`
- Modify: `uploader/design_uploader/main.py` (add two subcommands)
- Test: `uploader/tests/test_describe.py`

**Interfaces:**
- Consumes: `requireApiToken` (Task 5), `describeBody`, `SHA256` (Task 6), `presignGet`, `previewKey` (Task 6), `buildSearchNorm` (Task 4); `Api.pending/download/describe` (Task 7).
- Produces:
  - `GET /api/describe/pending?limit=N` (≤500, bearer) → `{items: [{sha256, fileName, previewUrl}]}` (presigned, 1 hour), oldest first, only `ai_status = 'pending'`.
  - `POST /api/describe/[sha256]` (bearer) `{aiText, aiDescription, aiKind}` → `{ok: true}`; sets `ai_status = 'done'` and rebuilds `search_norm`.
  - `describe.pull(api, out_dir: Path, limit: int) -> int` writes `out_dir/<sha256>.png` and `out_dir/manifest.json` = `[{"sha256", "fileName", "image"}]`.
  - `describe.push(api, jsonl: Path) -> tuple[int, list[str]]` posts each line `{"sha256","aiText","aiDescription","aiKind"}`; returns (sent, errors).
  - CLI: `python -m design_uploader describe-pull --out DIR --limit N`, `python -m design_uploader describe-push FILE`.

- [ ] **Step 1: Write the failing test**

`uploader/tests/test_describe.py`:
```python
import json

from design_uploader import describe


class FakeApi:
    def __init__(self):
        self.sent = []

    def pending(self, limit):
        return [{"sha256": "a" * 64, "fileName": "لارا.cdr", "previewUrl": "https://r2/a"}][:limit]

    def download(self, url):
        return b"\x89PNG"

    def describe(self, sha, body):
        if sha == "b" * 64:
            raise RuntimeError("409")
        self.sent.append((sha, body))


def test_pull_writes_images_and_manifest(tmp_path):
    assert describe.pull(FakeApi(), tmp_path, 10) == 1
    manifest = json.loads((tmp_path / "manifest.json").read_text(encoding="utf-8"))
    assert manifest == [{"sha256": "a" * 64, "fileName": "لارا.cdr", "image": str(tmp_path / f"{'a' * 64}.png")}]
    assert (tmp_path / f"{'a' * 64}.png").read_bytes() == b"\x89PNG"


def test_push_sends_each_line_and_reports_errors(tmp_path):
    lines = [
        {"sha256": "a" * 64, "aiText": "فراس & زينب", "aiDescription": "كرت خطوبة", "aiKind": "كرت"},
        {"sha256": "b" * 64, "aiText": "", "aiDescription": "x", "aiKind": "أخرى"},
    ]
    path = tmp_path / "out.jsonl"
    path.write_text("\n".join(json.dumps(l, ensure_ascii=False) for l in lines) + "\n\n", encoding="utf-8")
    api = FakeApi()
    sent, errors = describe.push(api, path)
    assert sent == 1
    assert api.sent == [("a" * 64, {"aiText": "فراس & زينب", "aiDescription": "كرت خطوبة", "aiKind": "كرت"})]
    assert errors == [f"{'b' * 64}: RuntimeError('409')"]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd uploader && python -m pytest tests/test_describe.py -q`
Expected: FAIL with `ImportError: cannot import name 'describe'`.

- [ ] **Step 3: Implement the uploader side**

`uploader/design_uploader/describe.py`:
```python
"""Move previews to a Claude Code session and its descriptions back to the site."""
import json
from pathlib import Path

FIELDS = ("aiText", "aiDescription", "aiKind")


def pull(api, out_dir: Path, limit: int) -> int:
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest = []
    for item in api.pending(limit):
        image = out_dir / f"{item['sha256']}.png"
        image.write_bytes(api.download(item["previewUrl"]))
        manifest.append({"sha256": item["sha256"], "fileName": item["fileName"], "image": str(image)})
    (out_dir / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
    return len(manifest)


def push(api, jsonl: Path) -> tuple[int, list[str]]:
    sent, errors = 0, []
    for line in jsonl.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        try:
            api.describe(row["sha256"], {k: row.get(k, "") for k in FIELDS})
            sent += 1
        except Exception as e:
            errors.append(f"{row['sha256']}: {e!r}")
    return sent, errors
```

In `uploader/design_uploader/main.py` add after the `upload` subparser:
```python
    pull = sub.add_parser("describe-pull")
    pull.add_argument("--out", type=Path, required=True)
    pull.add_argument("--limit", type=int, default=200)
    push = sub.add_parser("describe-push")
    push.add_argument("file", type=Path)
```
and replace the line `code = cmd_upload(config, getattr(args, "count_only", False))` with:
```python
    if args.command == "describe-pull":
        n = describe.pull(Api(config["site_url"], config["api_token"]), args.out, args.limit)
        print(f"نُزّلت {n} صورة إلى {args.out}")
        code = 0
    elif args.command == "describe-push":
        sent, errors = describe.push(Api(config["site_url"], config["api_token"]), args.file)
        print(f"أُرسل {sent} وصف، {len(errors)} فشل")
        print("\n".join(errors))
        code = 1 if errors else 0
    else:
        code = cmd_upload(config, getattr(args, "count_only", False))
```
with `from . import describe` added to the imports.

- [ ] **Step 4: Implement the web side**

`web/app/api/describe/pending/route.ts`:
```ts
import type { NextRequest } from "next/server";
import { requireApiToken } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { presignGet, previewKey } from "@/lib/r2";

export async function GET(req: NextRequest) {
  const denied = requireApiToken(req);
  if (denied) return denied;
  const limit = Math.min(500, Math.max(1, Number(req.nextUrl.searchParams.get("limit")) || 100));
  const rows = await db().query(
    `select f.sha256, (select file_name from locations l where l.sha256 = f.sha256 order by modified_at desc limit 1) as file_name
     from files f where f.ai_status = 'pending' order by f.created_at limit $1`,
    [limit],
  );
  const items = await Promise.all(
    rows.map(async (r) => ({
      sha256: r.sha256,
      fileName: r.file_name,
      previewUrl: await presignGet(previewKey(r.sha256), undefined, 3600),
    })),
  );
  return Response.json({ items });
}
```

`web/app/api/describe/[sha256]/route.ts`:
```ts
import type { NextRequest } from "next/server";
import { requireApiToken } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { buildSearchNorm } from "@/lib/normalize";
import { describeBody, SHA256 } from "@/lib/schemas";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/describe/[sha256]">) {
  const denied = requireApiToken(req);
  if (denied) return denied;
  const { sha256 } = await ctx.params;
  if (!SHA256.test(sha256)) return Response.json({ error: "bad hash" }, { status: 400 });
  const body = describeBody.safeParse(await req.json());
  if (!body.success) return Response.json({ error: body.error.message }, { status: 400 });
  const sql = db();
  const [file] = await sql.query("select text_raw from files where sha256 = $1", [sha256]);
  if (!file) return Response.json({ error: "not found" }, { status: 404 });
  const { aiText, aiDescription, aiKind } = body.data;
  await sql.query(
    `update files set ai_text = $2, ai_description = $3, ai_kind = $4, ai_status = 'done', search_norm = $5
     where sha256 = $1`,
    [sha256, aiText, aiDescription, aiKind, buildSearchNorm([file.text_raw, aiText, aiDescription, aiKind])],
  );
  return Response.json({ ok: true });
}
```

- [ ] **Step 5: Write `uploader/DESCRIBE.md`**

````markdown
# وصف التصاميم بـ Claude Code

## الخطوات

1. نزّل الصور التي تنتظر الوصف:
   `python -m design_uploader describe-pull --out C:\describe\batch-01 --limit 200`
2. افتح Claude Code وألصق الطلب التالي.
3. أرسل الأوصاف:
   `python -m design_uploader describe-push C:\describe\batch-01\descriptions.jsonl`

## الطلب لـ Claude

Read `C:\describe\batch-01\manifest.json`. For every entry, look at the image file and append
one JSON line to `C:\describe\batch-01\descriptions.jsonl` (UTF-8, `ensure_ascii=False`):

{"sha256": "<from manifest>", "aiText": "...", "aiDescription": "...", "aiKind": "..."}

- `aiText`: every word you can read in the design, exactly as written, Arabic and English,
  separated by spaces. Names, phrases, dates. Empty string if none is readable.
- `aiDescription`: one short Arabic sentence: what the piece is, its shape and layout, the
  decoration style and motifs (e.g. "لوحة خطوبة بإطار مقوّس، خط ديواني، زخرفة ورود وخواتم").
- `aiKind`: one of: كرت، درع، لوحة، علبة، ستيكر، شهادة، بانر، ميدالية، ختم، لوح قص، أخرى.

Do not guess text you cannot read. Do not skip entries; if the image is blank write empty
`aiText` and describe what is visible. For more than 100 images, split the manifest across
subagents, each writing its own `descriptions-<n>.jsonl`, then concatenate.
````

- [ ] **Step 6: Run all tests and build**

Run: `cd uploader && python -m pytest -q` then `cd ../web && npm test && npm run build`
Expected: all pass; build succeeds.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: describe previews with Claude Code via pull/push commands

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Accounts, environment and deploy

This task is mostly done by Omar in the dashboards; the agent prepares values and checks results. The agent never types credentials into web pages.

**Files:**
- Modify: none in code. Creates GitHub repo, Vercel project, Neon database, R2 bucket.

- [ ] **Step 1: Push the repo to GitHub (agent, after Omar approves creating a private repo)**

```bash
cd D:/work/design-search && gh repo create omaraldeek3/design-search --private --source . --push
```

- [ ] **Step 2: Omar creates the accounts (agent gives these steps and waits)**

1. Vercel (Pro): New Project → import `omaraldeek3/design-search` → Root Directory `web` → Deploy (it will fail until env is set; that is fine).
2. In the project: Storage → Create → Neon Postgres → connect to the project. This adds `DATABASE_URL`.
3. Cloudflare: create an account for the shop → R2 → create bucket `design-files` → Manage API tokens → Create token with "Object Read & Write" on `design-files` only. Note Account ID, Access Key ID, Secret Access Key.
4. In Vercel → Settings → Environment Variables (Production + Development), add:
   `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET=design-files`,
   `SITE_PASSWORD` (the shop password Omar chooses),
   `SESSION_SECRET` and `API_TOKEN` (two random values; the agent can generate them with
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and show them once for Omar to paste).

- [ ] **Step 3: Pull env and migrate (agent)**

```bash
cd D:/work/design-search/web && npx vercel link && npx vercel env pull .env.local && npm run migrate
```
Expected: `schema applied`.

- [ ] **Step 4: Redeploy and check login (agent)**

```bash
npx vercel --prod
```
Open the production URL in the built-in browser: `/` redirects to `/login`; a wrong password shows "كلمة المرور غير صحيحة". Ask Omar to type the real password himself; after login the empty search page shows "لا توجد نتائج".

- [ ] **Step 5: Check the token APIs (agent)**

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://<site>/api/ingest/check -H "Content-Type: application/json" -d '{"sha256s":[]}'
```
Expected: `401`. With `-H "Authorization: Bearer $API_TOKEN"` expected: `200`.

---

### Task 12: End-to-end on the 2026 sample, then package for the uncle's PC

**Files:**
- Create: `uploader/install-shortcut.ps1`
- Modify: `uploader/README` section in root `README.md` (how to install on the uncle's PC)

- [ ] **Step 1: Upload the sample**

Set `uploader/config.json` to the real `site_url` and `api_token`, `"machine": "omar-sample"`, `"roots": ["G:\\My Drive\\sumar\\2026"]`.
Run: `cd uploader && python -m design_uploader upload`
Expected: summary with about 600 uploaded, 0 failed (a few `unreadable`/`failed` extraction statuses are fine; those still upload). Run it a second time: everything reported as already uploaded.

- [ ] **Step 2: Verify search by text in the browser**

Log in (Omar types the password) and search each word; record the result counts:
`سنداً` (expect `lara9`, `Lara 5`, `30 lara` and backups), `سندا` (same), `المقادير` (`Lara 21`, `laraa 8`), `ريهام` (`laraa 15`), `سامراء` (`LARA 6` and backups).
Open one result: preview shows, path copies, download gives the original file with its Arabic name and the same SHA-256 as the local file.

- [ ] **Step 3: Describe the Lara previews**

Run: `python -m design_uploader describe-pull --out <scratchpad>\describe\lara --limit 600`
Then, in this Claude Code session, follow `uploader/DESCRIBE.md` for the entries whose file name matches `lara|لارا` first (about 90), and push them with `describe-push`.
Verify in the browser: `خطوبة`, `أميرتي`, `زينب`, `تخرج` now find the designs that have no text of their own (`25 لارا`, `لارا`, `لارا 121`).
Ask Omar before describing the rest of the sample; that is a larger use of his Claude plan.

- [ ] **Step 4: Package the uploader**

Run: `cd uploader && pyinstaller --onefile --console --name design-uploader design_uploader/__main__.py`
Expected: `uploader/dist/design-uploader.exe`. Check: `dist\design-uploader.exe --config config.json upload --count-only` prints the counts.

`uploader/install-shortcut.ps1`:
```powershell
# Run once on the uncle's PC from the folder holding design-uploader.exe and config.json.
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$shell = New-Object -ComObject WScript.Shell
$link = $shell.CreateShortcut((Join-Path ([Environment]::GetFolderPath("Desktop")) "رفع التصاميم الجديدة.lnk"))
$link.TargetPath = Join-Path $here "design-uploader.exe"
$link.Arguments = "upload"
$link.WorkingDirectory = $here
$link.Save()
Write-Output "Shortcut created on the desktop."
```

Add to root `README.md`:
```markdown
## Install on the uncle's PC

1. Copy `design-uploader.exe`, `config.example.json` (renamed `config.json`) and
   `install-shortcut.ps1` to `C:\design-uploader\`.
2. Edit `config.json`: `site_url`, `api_token`, `"machine": "uncle-pc"`, and `roots` = the
   folders that hold the designs.
3. Right-click `install-shortcut.ps1` → Run with PowerShell.
4. First time: run `design-uploader.exe upload --count-only`, send the totals to Omar before
   the full upload, and start the full upload in the evening.
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(uploader): Windows package and desktop shortcut

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

- [ ] **Step 6: Report to Omar**

Give Omar: the site URL, the sample result counts from Step 2, the description results from Step 3, and the install steps for the uncle's PC. The full 50 GB upload and the remaining descriptions each wait for his go-ahead, with the `--count-only` totals and time estimate in hand.
