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
