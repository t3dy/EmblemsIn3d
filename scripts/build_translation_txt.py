import io, os, re, datetime

SRC = 'translation/en'
OUT = 'HPTranslation.txt'

files = [f for f in os.listdir(SRC) if re.match(r'page_\d+\.md$', f)]
files.sort(key=lambda f: int(re.search(r'(\d+)', f).group(1)))

pages = []
chapters = []           # (page_no, chapter label) in order of first appearance
words = 0

for f in files:
    n = int(re.search(r'(\d+)', f).group(1))
    body = io.open(os.path.join(SRC, f), encoding='utf-8').read().replace('\r\n', '\n').strip()
    # the per-page heading looks like: "# Page 193 — Chapter XVII"
    m = re.match(r'#\s*Page\s*\d+\s*[—-]\s*(.+)', body.split('\n', 1)[0])
    chap = m.group(1).strip() if m else None
    if chap and (not chapters or chapters[-1][1] != chap):
        chapters.append((n, chap))
    # strip the markdown heading line; keep everything else verbatim
    rest = body.split('\n', 1)[1].strip() if '\n' in body else ''
    words += len(rest.split())
    pages.append((n, chap, rest))

stamp = datetime.date.today().isoformat()
first, last = pages[0][0], pages[-1][0]

head = []
head.append('HYPNEROTOMACHIA POLIPHILI')
head.append('The Strife of Love in a Dream')
head.append('')
head.append('Francesco Colonna, Venice: Aldus Manutius, 1499')
head.append('')
head.append('A NEW ENGLISH TRANSLATION')
head.append('=' * 72)
head.append('')
head.append('This file is the complete text of the translation made for the Emblems in 3D')
head.append('project: chapters XVII to XXXVIII, Book II, and the epitaphs - that is, the')
head.append('entire remainder of the book from the point where Robert Dallington\'s 1592')
head.append('English (the only prior public-domain translation) stops, on page 193, to the')
head.append('Aldine colophon on page 467.')
head.append('')
head.append('Dallington covers the first half; it is not reproduced here.')
head.append('')
head.append('  Pages      %d-%d  (%d pages)' % (first, last, len(pages)))
head.append('  Words      %s' % f'{words:,}')
head.append('  Chapters   XVII-XXXVIII, Book II, the Epitaph and the errata leaf'
            ' (%d headings; see CONTENTS)' % len(chapters))
head.append('  Generated  %s' % stamp)
head.append('')
head.append('LICENCE: dedicated to the public domain under CC0 1.0 Universal.')
head.append('         https://creativecommons.org/publicdomain/zero/1.0/')
head.append('         You may copy, modify and distribute this text, even commercially,')
head.append('         without asking permission.')
head.append('')
head.append('Page numbers follow the 1499 edition as paginated by the project; each page')
head.append('is marked so any passage can be checked against the facsimile.')
head.append('')
head.append('=' * 72)
head.append('')
head.append('CONTENTS')
head.append('')
for n, c in chapters:
    head.append('  p.%-4d  %s' % (n, c))
head.append('')
head.append('=' * 72)
head.append('')
head.append('')

out = ['\n'.join(head)]
cur = None
for n, chap, body in pages:
    if chap and chap != cur:
        cur = chap
        out.append('\n\n' + '-' * 72 + '\n' + chap.upper() + '\n' + '-' * 72 + '\n\n')
    out.append('[p. %d]\n\n%s\n\n' % (n, body))

text = ''.join(out).rstrip() + '\n'
io.open(OUT, 'w', encoding='utf-8', newline='\r\n').write(text)

print('wrote %s' % OUT)
print('  pages    %d (%d-%d)' % (len(pages), first, last))
print('  words    %s' % f'{words:,}')
print('  chapters %d' % len(chapters))
print('  bytes    %s' % f'{os.path.getsize(OUT):,}')
