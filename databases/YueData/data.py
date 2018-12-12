from re import search
from re import match
from re import split
from re import sub


def bubble():
    from json import load
    with open('data.json', encoding='utf-8') as f:
        for rad in load(f).values():
            for cat in rad.values():
                for han, data in cat.items():
                    if type(data) is dict:
                        yield han, data['音節詞例'], data['英譯']


def spread(han, yues, mean):
    def test(m):
        if search(r'\[\d+\.\.\]', m):
            return True
        ms = m.split(', ')
        return len(ms) > 1 and all(han in x for x in ms)

    def tidy(m):
        return split(r'\[\d+\.\.\]', m)[0]

    if len(yues) == 1:
        yue, _m = yues[0]
        yield yue.lower(), tidy(mean or _m)
        return
    yuel, yued = [], {}
    for y, m in yues:
        y = y.lower()
        _match = match('「.([a-z0-9A-Z]+)」的?異讀字', m)
        if _match:
            yue = _match.group(1).lower()
            if yue not in yued:
                yued[yue] = {yue: 1}
            yued[yue][y] = 1
        else:
            yuel.append((y, mean if test(m) else m))
    for y, m in yuel:
        if y in yued:
            yield ', '.join(yued[y]), tidy(m)
        else:
            yield y, tidy(m)


def unique():
    udict = {}
    for han, b, c in bubble():
        for yue, mean in spread(han, b, c):
            if han in udict:
                udict[han].append((yue, mean))
            else:
                udict[han] = [(yue, mean)]
    for han, yms in udict.items():
        if len(yms) == 1:
            yue, mean = yms[0]
            yield han, 'yue-HK', yue, mean
        else:
            for i, (yue, mean) in enumerate(yms):
                yield han, 'yue-HK_' + str(i), yue, mean


with open('data.txt', mode='w', encoding='utf-8') as f:
    for ql in unique():
        line = '\t'.join(ql) + '\n'
        f.write(sub(' +', ' ', line.replace("'", '’')))
