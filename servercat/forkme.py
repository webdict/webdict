from family import family


def _forkme(word):
    if len(word) < 2:
        if word.lower() == 'a':
            return ['a', 'an']
        return []
    return family(word.lower())


def _split_word(word):
    yield _forkme(word)
    here = 0
    for i in range(len(word)-1, 0, -1):
        if 'A' <= word[i] <= 'Z':
            yield _forkme(word[:i])
            here = i
    if 0 < here:
        yield from _split_word(word[here:])


def _split_text(text):
    def span(text):
        s, e, l = 0, 0, ['']
        while e < len(text):
            if text[e] in '_ -':
                if s == e:
                    l = [x+text[e] for x in l]
                else:
                    n = _forkme(text[s:e])
                    l = [x+m+text[e] for x in l for m in n]
                s = e = e+1
            else:
                e += 1
        if s < len(text):
            n = _forkme(text[s:])
            l = [x+m for x in l for m in n]
        return l

    yield span(text)
    e = len(text)-1
    while e > 0:
        if text[e] in '_ -':
            yield span(text[:e])
        e -= 1


def forkme(string):
    if any(x in string for x in '_ -'):
        yield from _split_text(string)
    else:
        yield from _split_word(string)
