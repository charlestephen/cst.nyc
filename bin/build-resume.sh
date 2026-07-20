#!/bin/sh
# Regenerate assets/resume.pdf from resume/index.html.
# Run after any resume content change; CI runs this too, so the deployed PDF
# can never drift from the deployed page.
set -eu

cd "$(dirname "$0")/.."

CHROME=""
for c in \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "$(command -v google-chrome-stable || true)" \
  "$(command -v google-chrome || true)" \
  "$(command -v chromium || true)"
do
  [ -n "$c" ] && [ -x "$c" ] && CHROME="$c" && break
done
[ -n "$CHROME" ] || { echo "build-resume: no Chrome/Chromium found" >&2; exit 1; }

# ponytail: ask the OS for a free port and immediately rebind it. Tiny TOCTOU
# race, but a fixed port collides with whatever else is already serving locally.
PORT=$(python3 -c "import socket; s=socket.socket(); s.bind(('127.0.0.1',0)); print(s.getsockname()[1]); s.close()")
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SRV=$!
trap 'kill "$SRV" 2>/dev/null || true' EXIT

# Chrome renders about:blank if it beats the server to the port.
i=0
until curl -sfo /dev/null "http://127.0.0.1:$PORT/resume/index.html"; do
  i=$((i + 1))
  [ "$i" -gt 50 ] && { echo "build-resume: server never came up" >&2; exit 1; }
  sleep 0.1
done

"$CHROME" --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
  --print-to-pdf="assets/resume.pdf" \
  "http://127.0.0.1:$PORT/resume/index.html" >/dev/null 2>&1

# A blank or truncated render still exits 0, so check the artifact itself.
python3 - <<'EOF'
import re, sys
d = open("assets/resume.pdf", "rb").read()
pages = len(re.findall(rb"/Type\s*/Page[^s]", d))
if pages < 1 or len(d) < 50_000:
    sys.exit(f"build-resume: bad render ({pages} pages, {len(d)} bytes)")
print(f"wrote assets/resume.pdf ({pages} pages, {len(d)//1024}KB)")
EOF
