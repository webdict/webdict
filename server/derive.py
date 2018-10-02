from family import family


def _derive(word):
    return family(word.lower())


def _split_word(word):
    yield _derive(word)
    s, e = 0, 2
    while e < len(word):
        if e-s > 1 and 'A' <= word[e] <= 'Z' and 'a' <= word[e-1] <= 'z':
            yield _derive(word[s:e])
            s = e
    if s:
        yield _derive(word[s:])


def _split_text(text):
    def span(text):
        s, e, l = 0, 0, ['']
        while e < len(text):
            if text[e] in '_ -':
                if s == e:
                    l = [x+text[e] for x in l]
                else:
                    n = _derive(text[s:e])
                    l = [x+m+text[e] for x in l for m in n]
                s = e = e+1
            else:
                e += 1
        if s < len(text):
            n = _derive(text[s:])
            l = [x+m for x in l for m in n]
        return l

    yield span(text)
    e = len(text)-1
    while e > 0:
        if text[e] in '_ -':
            yield span(text[:e])
        e -= 1


def derive(string):
    if any(x in string for x in '_ -'):
        yield from _split_text(string)
    else:
        yield from _split_word(string)
