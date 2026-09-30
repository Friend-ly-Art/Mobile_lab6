"""Щадящая минификация файлов этого проекта. Python 3, без пакетов.
JS: удаляем блочные комментарии и отступы, сохраняя переносы строк
для безопасности автоматической расстановки точек с запятой.
Обработчик рассчитан на исходники этого проекта, а не на произвольный JS.
"""
from pathlib import Path
import re
import shutil
import json
ROOT = Path(__file__).resolve().parent
SRC, OUT = ROOT / 'src', ROOT / 'dist'
OUT.mkdir(exist_ok=True)
report = []
for src in sorted(SRC.rglob('*')):
    if not src.is_file():
        continue
    dst = OUT / src.relative_to(SRC)
    dst.parent.mkdir(parents=True, exist_ok=True)
    if src.suffix in {'.html', '.css', '.js'}:
        text = src.read_text(encoding='utf-8')
        if src.suffix == '.html':
            text = re.sub(r'<!--[\s\S]*?-->', '', text)
            text = re.sub(r'>\s+<', '><', text).strip()
        elif src.suffix == '.css':
            text = re.sub(r'/\*[\s\S]*?\*/', '', text)
            text = re.sub(r'\s+', ' ', text)
            text = re.sub(r'\s*([{}:;,])\s*', r'\1', text).strip()
        else:
            text = re.sub(r'/\*[\s\S]*?\*/', '', text)
            text = '\n'.join(line.strip() for line in text.splitlines() if line.strip())
        dst.write_text(text, encoding='utf-8')
        report.append({'file': str(src.relative_to(SRC)), 'before':src.stat().st_size, 'after':dst.stat().st_size})
    else:
        shutil.copy2(src, dst)
(OUT / '.nojekyll').touch()
(ROOT / 'minification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
before, after = sum(i['before'] for i in report), sum(i['after'] for i in report)
print(f'HTML/CSS/JS: {before} -> {after} bytes; saved {(before-after)/before:.1%}')
