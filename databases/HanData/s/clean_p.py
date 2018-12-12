import re


def pinyin(p, strict=False):
    flag = 0 if strict else 2
    r1 = r'[aeiouv]'
    r2 = r'^[bcdfghjklmnpqrstwxyz]?h?[vui]?[aeo]?[uio]?([rn]|ng)?[1-5]$'
    return re.search(r1, p, flag) and re.match(r2, p, flag)


def clean_p(pinv, t, s):
    t, s = t.replace('、', '，'), s.replace('、', '，')
    pinv = pinv.replace('u:', 'v').replace(',', '，')
    ps = []
    flag = -1
    for i, p in enumerate(pinv.split(' ')):
        if not p:
            continue
        if pinyin(p):
            ps.append([p.lower()])
            flag = 0
        elif p.lower() == 'r5':
            ps.append(['er5'])
            flag = 0
        elif t[i] == s[i] == p:
            # EDIT: 21三體綜合症 502膠 美國51區 雙11
            p = p if re.match('[A-Z0-9]', p, 2) else '_'
            if flag == 1:
                ps[-1].append(p)
            else:
                ps.append([p])
                flag = 1
        else:
            return None

    def join(x):
        if len(x) == 1:
            return x[0]
        r = ''.join(x)
        if pinyin(r, True):
            return ' '.join(x)
        return r
    return ' '.join(join(x) for x in ps)
