from derive import derive
from cursor import cursor


def clist(text: str):
    sql = "SELECT word FROM pinv_table WHERE word LIKE '%s%%' AND word <= '%s'"
    cursor.execute(sql % (text[:1], text))
    ser = set(cursor)
    if not ser:
        return None
    l = []
    for i in range(len(text), 0, -1):
        if (text[:i],) in ser:
            l.append(text[:i])
    return (l, l[0]) if l else None


def wlist(text: str):
    for family in derive(text):
        if family:
            return family, family[0]
    return None


def defin(word: str):
    sql = "SELECT defin FROM defin_table WHERE word = '%s'"
    cursor.execute(sql % word)
    one = cursor.fetchone()
    if one:
        if one[0].startswith('@'):
            return defin(one[0][1:])
        return one[0]
    return None


def pinvin(pinv: str, suffix: str = ''):
    if pinv.startswith('@'):
        sql = "SELECT pinvin FROM pinv_table WHERE word = '%s'"
        cursor.execute(sql % pinv[1:]).fetchone()
        one = cursor.fetchone()
        if one:
            return pinvin(one[0], ' « ' + pinv[1:] + suffix)
    return pinv + suffix


def _pinv(pinv: str, suffix: str = ''):
    if pinv.startswith('@'):
        sql = "SELECT pinvin FROM pinv_table WHERE word = '%s'"
        cursor.execute(sql % pinv[1:]).fetchone()
        one = cursor.fetchone()
        if one:
            return _pinv(one[0], ' « ' + pinv[1:] + suffix)
    return pinv + suffix


def _mean(word):
    sql = "SELECT defin FROM defin_table WHERE word = '%s'"
    cursor.execute(sql % word)
    try:
        mean = cursor.fetchone()[0]
        if mean.startswith('@'):
            return _mean(mean[1:])
        return mean
    except:
        return None


def _meand(where):
    sql = "SELECT word, defin FROM defin_table WHERE word COLLATE NOCASE IN('%s')"
    cursor.execute(sql % where)
    meand = {}
    for word, mean in cursor.fetchall():
        if mean.startswith('@'):
            meand[word] = _mean(mean[1:])
        else:
            meand[word] = mean
    return meand


def _pinvd(where):
    sql = "SELECT word, 'han' AS lang, pinvin FROM pinv_table WHERE word IN('%s')"
    cursor.execute(sql % where)
    pinvd = {}
    for word, lang, pinv in cursor.fetchall():
        if word not in pinvd:
            pinvd[word] = {lang: _pinv(pinv)}
        else:
            pinvd[word][lang] = _pinv(pinv)
    return pinvd


def search_zh(text):
    words = [text[:e] for e in range(len(text), 0, -1)]
    where = "', '".join(w.replace("'", "''") for w in words)
    pinvd = _pinvd(where)
    meand = _meand(where)
    items = []
    for word in words:
        pinv = pinvd.get(word, None)
        mean = meand.get(word, None)
        if pinv or mean:
            items.append({
                'word': word,
                'pron': pinv,
                'mean': mean
            })
    return items


def _prond(where):
    sql = "SELECT word, pronuk, pos, pronus FROM pron_table WHERE word COLLATE NOCASE IN('%s')"
    cursor.execute(sql % where)
    prond = {}
    for word, pronuk, pos, pronus in cursor.fetchall():
        if word.lower() not in prond:
            prond[word.lower()] = {word: {pos: [pronuk, pronus]}}
        elif word not in prond[word.lower()]:
            prond[word.lower()][word] = {pos: [pronuk, pronus]}
        else:
            prond[word.lower()][word][pos] = [pronuk, pronus]
    return prond


def _search_en(words):
    where = "', '".join(w.replace("'", "''") for w in words)
    prond = _prond(where)
    meand = {}
    for word, mean in _meand(where).items():
        if word.lower() not in meand:
            meand[word.lower()] = {word: mean}
        else:
            meand[word.lower()][word] = mean
    items = []
    for word in words:
        pron = prond.get(word.lower(), {})
        mean = meand.get(word.lower(), {})
        if pron:
            if word in pron:
                items.append({
                    'word': word,
                    'pron': pron.pop(word),
                    'mean': mean.get(word, None)
                })
            items.extend({
                'word': w,
                'pron': p,
                'mean': mean.get(w, None)
            } for w, p in pron.items())
        elif mean:
            if word in mean:
                items.append({
                    'word': word,
                    'pron': None,
                    'mean': mean.pop(word)
                })
            items.extend({
                'word': w,
                'pron': None,
                'mean': m
            } for w, m in mean.items())
    return items


def search_en(text):
    for words in derive(text):
        items = _search_en(words)
        if items:
            return items
    return []


def query(word: str, cleng: bool):
    trans = defin(word)
    data = {'trans': trans} if trans else dict()
    sql = "SELECT pinvin FROM pinv_table WHERE word = '%s'" if cleng else "SELECT pronuk, pos, pronus FROM pron_table WHERE word COLLATE NOCASE = '%s'"
    cursor.execute(sql % word)
    if cleng:
        data['poses'] = [pinvin(cursor.fetchone()[0])]
        return data
    data['poses'] = []
    for row in cursor:
        data['poses'].append(row[0] + '$$' + row[1] + '$$' + row[2])
    return data


def check_define(word: str, links: set):
    if "'" in word:
        return ''
    links.add(word)
    sql = "SELECT defin FROM defin_table WHERE word = '%s'"
    cursor.execute(sql % word[1:])
    one = cursor.fetchone()
    return '' if not one or one[0] in links else check_define(one[0], links) if one[0].startswith('@') else one[0]


def define(word: str, tran: str):
    if not tran.startswith('@') or check_define(tran, set()):
        sql = "INSERT OR REPLACE INTO defin_table(word, defin) VALUES('%s', '%s')"
        cursor.execute(sql % (word, tran))
