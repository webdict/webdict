from functools import lru_cache
from sqlite3 import connect
from threading import RLock
from forkme import forkme
from record import nextid

############################################################


database = connect('vocab.db', check_same_thread=False)
cursor = database.cursor()
lock = RLock()


############################################################


def _q(word): return word.replace("'", "''")


############################################################


def _simulate(word, lang):
    from random import randint
    info = 'Info for '+word
    flag = randint(1, (1 << (12-lang))-1)
    return info, flag


def _history(langflag):
    def history(search):
        def decorator(text, uuid):
            with lock:
                result = search(text, uuid)
                if result and uuid:
                    words = [r['word'] for r in result]
                    word = _q(text if text in words else words[0])
                    sql = (
                        "SELECT freq, flag "
                        "FROM hist_tab "
                        "WHERE uuid = '%s' AND word = '%s'"
                    )
                    cursor.execute(sql % (uuid, word))
                    one = cursor.fetchone()
                    if one:
                        freq, flag = one
                        sql = (
                            "UPDATE hist_tab "
                            "SET freq = %d, time = strftime('%%s','now') "
                            "WHERE uuid = '%s' AND word = '%s'"
                        )
                        data = freq+1, uuid, word
                        cursor.execute(sql % data)
                        database.commit()
                        if flag & 4:
                            return []
                    else:
                        freq = 1
                        sql = "SELECT info, flag FROM flag_tab WHERE word = '%s'"
                        cursor.execute(sql % word)
                        one = cursor.fetchone() or _simulate(word, langflag)  # or ('', 0)
                        info, flag = _q(one[0]), (one[1] << 3)+langflag
                        sql = (
                            "INSERT INTO hist_tab "
                            "VALUES('%s', '%s', '%s', %d, %d, strftime('%%s','now'))"
                        )
                        # ...111: ...[remove][favour][zh]
                        data = uuid, word, info, flag, freq,
                        cursor.execute(sql % data)
                        database.commit()
                return result
        return decorator
    return history


############################################################


def _mean(word, mark, uuid):
    sql = (
        "SELECT mean FROM mean_tab "
        "WHERE word = '%s' AND mark = '%s' "
        "AND uuid IN('', '%s') "
        "ORDER BY time DESC LIMIT 1"
    )
    cursor.execute(sql % (_q(word), mark, uuid))
    one = cursor.fetchone()
    if not one:
        return ''
    mean = one[0]
    if mean.startswith('@'):
        pair = mean[1:].split('@', 1)
        # `@word@mark`, `@mark` is optional
        pair.append(mark)
        return _mean(pair[0], pair[1], uuid)
    return mean


############################################################


def _prond(words):
    where = "', '".join(_q(w) for w in words)
    sql = (
        "SELECT word, mark, pronuk, pronus "
        "FROM pron_tab WHERE word COLLATE NOCASE IN('%s')"
    )
    cursor.execute(sql % where)
    return cursor.fetchall()


@lru_cache(maxsize=1024)  # cache_clear
def _search_en(text):
    for words in forkme(text):
        items = _prond(words)
        if items:
            return words, items
    return [], []


@_history(langflag=0)
def search_en(text, uuid):
    words, items = _search_en(text)
    prond = {}
    for word, mark, pronuk, pronus in items:
        data = [pronuk, pronus, _mean(word, mark, uuid)]
        if word not in prond:
            prond[word] = {mark: data}
        else:
            prond[word][mark] = data
    return [{
        'word': word,
        'data': prond[word]
    } for word in words if word in prond]


############################################################


@lru_cache(maxsize=1024)  # cache_clear
def _search_zh(text):
    words = [text[:e] for e in range(len(text), 0, -1)]
    where = "', '".join(_q(w) for w in words)
    sql = "SELECT word, mark, pinv FROM pinv_tab WHERE word IN('%s')"
    # assert: "'" quoted in where
    cursor.execute(sql % where)
    items = cursor.fetchall()
    return items and words, items


@_history(langflag=1)
def search_zh(text, uuid):
    words, items = _search_zh(text)
    pinvd = {}
    for word, mark, pinv in items:
        data = [pinv, _mean(word, mark, uuid)]
        if word not in pinvd:
            pinvd[word] = {mark: data}
        else:
            pinvd[word][mark] = data
    return [{
        'word': word,
        'data': pinvd[word]
    } for word in words if word in pinvd]


############################################################


def _mean_ok(word, mark, uuid, mean, link=None):
    if link == None:
        link = {(word, mark)}
    if not mean.startswith('@'):
        return True
    if mean == '@':
        return False
    ms = mean[1:].split('@', 1)
    if len(ms) < 2:
        ms.append(mark)
    word, mark = ms
    if "'" in mark or (word, mark) in link:
        return False
    link.add((word, mark))
    sql = (
        "SELECT mean FROM mean_tab "
        "WHERE word = '%s' AND mark = '%s' AND uuid IN('', '%s') "
        "ORDER BY time DESC LIMIT 1"
    )
    cursor.execute(sql % (_q(word), mark, uuid))
    one = cursor.fetchone()
    return one and _mean_ok(word, mark, uuid, one[0], link)


def define(word, data, uuid):
    with lock, database:
        changed = 0
        for mark, mean in data.items():
            if "'" in mark:
                continue
            if not mean:
                sql = "DELETE FROM mean_tab WHERE word = '%s' AND mark = '%s' AND uuid = '%s'"
                args = _q(word), mark, uuid
                cursor.execute(sql % args)
                changed += 1
                continue
            if not _mean_ok(word, mark, uuid, mean):
                continue
            sql = "INSERT INTO mean_tab VALUES('%s', '%s', '%s', '%s', strftime('%%s','now'))"
            args = _q(word), mark, uuid, _q(mean)
            cursor.execute(sql % args)
            changed += 1
        return changed


############################################################


def check(username):
    with lock:
        sql = "SELECT password FROM user_tab WHERE username = '%s'"
        cursor.execute(sql % username)
        one = cursor.fetchone()
        return one and one[0]


############################################################

def passwd(username, password):
    '''
    set password of username
    '''
    with lock, database:
        sql = "UPDATE user_tab SET password = '%s' WHERE username = '%s'"
        cursor.execute(sql % (username, password))

############################################################


def signin(username, password, oldid):
    with lock, database:
        sql = "SELECT useruuid FROM user_tab WHERE username = '%s' AND password = '%s'"
        cursor.execute(sql % (username, password))
        one = cursor.fetchone()
        if not one:
            return None
        newid = one[0] or nextid()
        sql = (
            "UPDATE user_tab SET useruuid = '%s', "
            "lasttime = strftime('%%s','now') "
            "WHERE username = '%s'"
        )
        cursor.execute(sql % (newid, username))
        sql = "UPDATE hist_tab SET uuid = '%s' WHERE uuid = '%s'"
        cursor.execute(sql % (newid, oldid))
        sql = "UPDATE note_tab SET uuid = '%s' WHERE uuid = '%s'"
        cursor.execute(sql % (newid, oldid))
        return newid


############################################################


def signup(name, word):
    with lock, database:
        sql = (
            "INSERT OR IGNORE INTO user_tab "
            "VALUES('%s', '%s', '', strftime('%%s','now'), 0)"
        )
        cursor.execute(sql % (name, word))


############################################################


def addnote(uuid, note, furl):
    with lock, database:
        sql = "INSERT INTO note_tab VALUES('%s', '%s', '%s', strftime('%%s','now'))"
        data = uuid, _q(note), _q(furl)
        cursor.execute(sql % data)


############################################################


def getnote(uuid, note, furl, order, limit, offset):
    with lock:
        _note = " AND note LIKE '%%%s%%'" % _q(note) if note else ''
        _furl = " AND furl LIKE '%%%s%%'" % _q(furl) if furl else ''
        sql = "SELECT min(count(*), 1000) FROM note_tab WHERE uuid = '%s'%s%s"
        cursor.execute(sql % (uuid, _note, _furl))
        total = cursor.fetchone()[0]
        sql = (
            "SELECT note, furl, time "
            "FROM note_tab WHERE uuid = '%s'%s%s "
            "ORDER BY %s LIMIT %d OFFSET %d"
        )
        data = uuid, _note, _furl, order, limit, offset
        cursor.execute(sql % data)
        return {'total': total, 'data': cursor.fetchall()}


############################################################


def myfreq(uuid):
    with lock:
        sql = "SELECT max(freq) FROM hist_tab WHERE uuid = '%s'"
        cursor.execute(sql)
        one = cursor.fetchone()
        return one[0] if one else 0


############################################################


def contxt(uuid):
    with lock:
        keys = ['username', 'jointime', 'lasttime']
        sql = "SELECT %s FROM user_tab WHERE useruuid = '%s'"
        cursor.execute(sql % (', '.join(keys), uuid))
        return {k: v for k, v in zip(keys, cursor.fetchone())}


############################################################


def history(uuid, word, flag, operator, other, order, limit, offset):
    with lock:
        if operator == 'and':
            data = flag, (flag & 7) if other else flag
            flag = '(flag & %d) = %d' % data
        elif operator == 'or':
            lang = flag & 1
            data = lang, flag, '>=' if other else '>', lang
            flag = '(flag & 1) = %d AND (flag & %d) %s %d' % data
        else:
            raise Exception('Unknown operator: ' + str(operator))
        if word:
            _word = " AND word COLLATE NOCASE LIKE '%s%%'" % _q(word)
            count = 100
        else:
            _word, count = '', 1000
        sql = "SELECT min(count(*), %d) FROM hist_tab WHERE uuid = '%s'%s AND %s"
        cursor.execute(sql % (count, uuid, _word, flag))
        total = cursor.fetchone()[0]
        sql = (
            "SELECT word, info, flag, freq, time "
            "FROM hist_tab WHERE uuid = '%s'%s AND %s "
            "ORDER BY %s LIMIT %d OFFSET %d"
        )
        cursor.execute(sql % (uuid, _word, flag, order, limit, offset))
        return {'total': total, 'data': cursor.fetchall()}


############################################################


def reflag(uuid, word, flag):
    with lock, database:
        sql = "UPDATE hist_tab SET flag = %d WHERE uuid = '%s' AND word = '%s'"
        cursor.execute(sql % (flag, uuid, _q(word)))
        return 1


############################################################


def reinfo(uuid, word, info):
    with lock, database:
        sql = "UPDATE hist_tab SET info = '%s' WHERE uuid = '%s' AND word = '%s'"
        cursor.execute(sql % (_q(info), uuid, _q(word)))
        return 1


############################################################


def deflag(uuid, word):
    with lock, database:
        sql = "SELECT info, flag FROM flag_tab WHERE word = '%s'"
        cursor.execute(sql % _q(word))
        info, flag = cursor.fetchone() or ('', 0)
        data = _q(info), flag << 3, uuid, _q(word)
        sql = (
            "UPDATE hist_tab SET info = '%s', "
            "flag = (flag & 1) + %d "
            "WHERE uuid = '%s' AND word = '%s'"
        )
        cursor.execute(sql % data)
        return {
            'info': info,
            'flag': flag
        }


############################################################


def _get_count(table, what='count(*)', which='time'):
    @lru_cache(maxsize=64)
    def count(time):
        with lock:
            sql = 'SELECT %s FROM %s WHERE %s < %d'
            cursor.execute(sql % (what, table, which, time))
            return cursor.fetchone()[0] or 0

    def timer(stamp):
        rem = stamp % (24*3600)
        if rem == 0:
            yield stamp
            stamp -= 24*3600
        elif rem < 60:
            yield stamp
            stamp -= rem
        elif rem < 10*60:
            yield stamp-rem % 60
            stamp -= rem
        else:
            yield stamp-rem % (10*60)
            stamp -= rem
        for _ in range(59):
            yield stamp
            stamp -= 24*3600

    return lambda time: [count(t) for t in timer(time)]


_count = {
    'user': _get_count('user_tab', which='jointime'),
    'hist': _get_count('hist_tab', what='sum(freq)'),
    'pron': _get_count('pron_tab'),
    'pinv': _get_count('pinv_tab'),
    'mean': _get_count('mean_tab'),
    'note': _get_count('note_tab')
}


def status(time):
    return {
        key: count(time)
        for key, count in _count.items()
    }
