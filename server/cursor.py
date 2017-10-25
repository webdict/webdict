import sqlite3
from razor import fork_word
from family import family
from counter import Counter

con = sqlite3.connect('vocab.db')
cur = con.cursor()

count = Counter()

def clist(text: str):
    res = cur.execute(
        "SELECT word FROM pinv_table WHERE word LIKE '%s%%' AND word <= '%s'" % (text[:1], text))
    ser = set(res.fetchall())
    if not ser:
        return None
    l = []
    for i in range(len(text), 0, -1):
        if (text[:i],) in ser:
            l.append(text[:i])
    return l, l[0] if l else None


def wlist(text: str):
    text = text[:text.index(' ')] if ' 'in text else text
    l = family(text)
    if l:
        return l, l[-1]
    l = fork_word(text)
    res = cur.execute(
        "SELECT lower(word) FROM pron_table WHERE word COLLATE NOCASE IN('%s')" % "', '".join(l))
    ser = set(res.fetchall())
    ls = []
    for word in l:
        if word and (word.lower(),) in ser:
            ls.append(word)
    return ls, ls[0] if ls else None


def defin(word: str):
    one = cur.execute(
        "SELECT defin FROM defin_table WHERE word = '%s'" % word).fetchone()
    if one:
        if one[0].startswith('@'):
            return defin(one[0][1:])
        return one[0]
    return None


def pinvin(pinv: str, suffix: str = ''):
    if pinv.startswith('@'):
        one = cur.execute(
            "SELECT pinvin FROM pinv_table WHERE word = '%s'" % pinv[1:]).fetchone()
        if one:
            return pinvin(one[0], ' « ' + pinv[1:] + suffix)
    return pinv + suffix


def query(word: str, cleng: bool):
    trans = defin(word)
    data = {'trans': trans} if trans else dict()
    sql = "SELECT pinvin FROM pinv_table WHERE word = '%s'" % word if cleng else "SELECT pronuk, pos, pronus FROM pron_table WHERE word COLLATE NOCASE = '%s'" % word
    res = cur.execute(sql)
    count.update()
    data['count'] = count.count
    if cleng:
        data['poses'] = [pinvin(res.fetchone()[0])]
        return data
    data['poses'] = []
    for row in res:
        data['poses'].append(row[0] + '$$' + row[1] + '$$' + row[2])
    return data


def check_define(word: str, links: set):
    if "'" in word:
        return ''
    links.add(word)
    one = cur.execute(
        "SELECT defin FROM defin_table WHERE word = '%s'" % word[1:]).fetchone()
    return '' if not one or one[0] in links else check_define(one[0], links) if one[0].startswith('@') else one[0]


def define(word: str, tran: str):
    if not tran.startswith('@') or check_define(tran, set()):
        cur.execute(
            "INSERT OR REPLACE INTO defin_table(word, defin) VALUES('%s', '%s')" % (word, tran))

def count():
    return count.html()

def reset():
    count.reset()

__all__ = ['wlist', 'clist', 'query', 'define',
           'check_define', 'count']
