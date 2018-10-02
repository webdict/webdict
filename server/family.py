from dropix import dropix


def _family_dict():
    from re import split
    fdict = {}
    with open('family.txt', encoding='utf-8') as f:
        for l in (l.strip() for l in f):
            ts = [split(r'\s*=\s*', g) for g in split(r'\s*>\s*', l)]
            for i in range(len(ts)):
                ti, vl = ts[i], [x for g in ts[i+1:] for x in g]
                if len(vl)+len(ti) > 1:
                    for k in range(len(ti)):
                        if ti[k] not in fdict:
                            fdict[ti[k]] = '$'.join(ti[k:]+ti[:k]+vl)
    return fdict


_fdict = _family_dict()


def family(word):
    word = word.lower()
    if word in _fdict:
        return _fdict[word].split('$')
    return dropix(word)
