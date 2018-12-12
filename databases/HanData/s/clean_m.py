from itertools import accumulate, takewhile
import re


def unique(iter, key=lambda x: x):
    s = set()
    for v in iter:
        k = key(v)
        if k not in s:
            s.add(k)
            yield v


def len_limit(ol, limit=48):
    ol = sorted((len(x), i, x) for i, x in enumerate(unique(ol)))
    while True:
        nl = accumulate(ol, lambda a, b: (a[0] + b[0], b[1], b[2]))
        nl = takewhile(lambda x: x[0] < limit, nl)
        nl = sorted(nl, key=lambda x: x[1])
        # if len(nl) > 4:
        #     ol = ol[len(nl) - 4:]
        #     continue
        if len(nl) > 4:
            nl = nl[-4:]
        return [x[2] for x in sorted(nl, key=lambda x: x[1])]


def clean_m(ms):
    def filter(n):
        if re.search(r'\bvariant of\b', n, 2):
            return False
        if n.startswith('@'):
            return False
        if all(ord(i) < 256 or i in '‘’' for i in n):
            return True
        return False

    return len_limit([n for n in unique(ms) if filter(n)])
