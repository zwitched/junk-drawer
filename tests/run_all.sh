#!/usr/bin/env bash
# Runs every browser test. Needs: pip install playwright && python -m playwright install chromium
cd "$(dirname "$0")"
fail=0
for t in test_core.py test_mechanics.py test_modes.py test_layout.py test_perf.py test_bot.py test_http.py; do
  [ -f "$t" ] || continue
  echo "== $t"; python3 "$t" > "/tmp/jd_$t.log" 2>&1 || fail=1
  grep -E "^(BAD|SUMMARY|ERRORS)" "/tmp/jd_$t.log"
done
exit $fail
