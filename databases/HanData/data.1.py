from s.counter import Counter
from s.clean_p import clean_p
from s.clean_m import clean_m
from s.exclude import exclude
import re

pinvd = dict()
meand = dict()
wordl = list()


def pinvd_add(key, val):
    if key in pinvd:
        pinvd[key].extend(val)
    else:
        wordl.append(key)
        pinvd[key] = val


def meand_add(key, val):
    if key in meand:
        meand[key].extend(val)
    else:
        meand[key] = val


counter = Counter()


def print_counter():
    d = dict()
    l = list()
    m = 0
    for key, val in counter:
        head, body = key.split('：')
        m = max((m, len(head), len(body)))
        if head in d:
            d[head].append((body, val))
        else:
            l.append(head)
            d[head] = [(body, val)]

    def fill(head):
        return '　' * (m - len(head)) + head

    for head in l:
        content = d[head]
        content.sort(key=lambda x: -x[1])
        print(fill(head))
        for body, val in content:
            print(fill(body), val)
        print()


source = 's0.txt'


def s0():
    with open(source, encoding='utf-8') as r:
        for line in r:
            counter.add('词条：总数')
            line = ' '.join(re.split(r'\s+', line.strip()))
            if re.match(r'^#', line):
                counter.add('词条：井号注释')
                continue  # safe 30
            regx = r'^([^ ]+) ([^ ]+) \[([^][]+)\] /(.*)/$'
            t, s, p, m = re.match(regx, line).groups()
            if ' ' in t + s:
                counter.add('词条：词条空格')
                continue  # safe 0
            if any(ord(c) < 256 for c in t + s):
                counter.add('词条：非纯汉字')
                continue  # safe 17
            if 'xx' in p:
                counter.add('词条：未知拼音')
                continue  # safe 30
            if not len(t) == len(s) == len(p.split(' ')):
                if len(t) == 1:
                    counter.add('词条：拼音长度')
                    continue  # safe 13
                else:
                    p = p.lower()  # safe 3
            else:
                p = clean_p(p, t, s)
            if not p:
                counter.add('词条：非法拼音')
                continue  # safe 5
            if re.search(r'\bjapanese variant of\b', m, 2) and '/' not in m:
                counter.add('词条：日本汉字')
                continue  # safe 178
            if re.search(r'\bold variant of\b', m, 2) and '/' not in m:
                counter.add('词条：旧体汉字')
                continue  # safe 548
            if exclude(t, s):
                continue
            yield t, s, p, m


def s1():
    def reason(x):
        return counter.add(x)

    for t, s, p, m in s0():
        ms = m.split('/')
        counter.add('释义：总数', len(ms))
        yield t, s, p, clean_m(ms, reason)


def s2():
    udict = dict()
    ulist = list()
    for t, s, p, m in s1():
        if (t, s) in udict:
            ps, ms = udict[(t, s)]
            if p not in ps:
                ps.append(p)
            if m not in ms:
                ms.append(m)
        else:
            udict[(t, s)] = [p] if p else [], [m] if m else []
            ulist.append((t, s))
    for t, s in ulist:
        ps, ms = udict[(t, s)]
        yield t, s, ps, ms


def s3():
    def test(m):
        return not any(n[0] == '@' for n in m)

    for t, s, ps, ms in s2():
        _ms = [m for m in ms if test(m)]
        if len(ms) == 1 and not _ms:
            _t, _s = ms[0]
            if '@' + t != _t:
                pinvd_add((t, 'han-TW'), ps)
                meand_add((t, 'han-TW'), [[_t + '@han-TW']])
            if '@' + s != _s:
                pinvd_add((s, 'han-CN'), ps)
                meand_add((s, 'han-CN'), [[_s + '@han-CN']])
        else:
            yield t, s, ps, _ms


def s4():
    def add(d, k, v):
        if k in d:
            if v not in d[k]:
                d[k].append(v)
        else:
            d[k] = [v]

    def tsps(t, s, ps):
        if len(t) != 1:
            return ps, ps
        tps = [f'{p} > {s}' for p in ps]
        sps = [f'{p} < {t}' for p in ps]
        return tps, sps

    t2s = dict()
    s2t = dict()
    pms = dict()
    tsl = list()
    for t, s, ps, ms in s3():
        pms[(t, s)] = ps, ms
        tsl.append((t, s))
        add(t2s, t, s)
        add(s2t, s, t)
    tsset = set()
    for t, s in tsl:
        ss, ts = t2s[t], s2t[s]
        if len(ss) == 1 and len(ts) == 1:
            ps, ms = pms[(t, s)]
            if t == s:
                counter.add('简繁：同简同繁')
                pinvd_add((t, 'han'), ps)
                meand_add((t, 'han'), ms)
            else:
                counter.add('简繁：一简一繁')
                if len(t) == 1:
                    counter.add('简繁：字简字繁')
                else:
                    counter.add('简繁：词简词繁')
                tps, sps = tsps(t, s, ps)
                pinvd_add((t, 'han-TW'), tps)
                meand_add((t, 'han-TW'), [[f'@{s}@han-CN']])
                pinvd_add((s, 'han-CN'), sps)
                meand_add((s, 'han-CN'), ms)
        elif len(ss) > 1 and len(ts) > 1:
            counter.add('简繁：多简多繁')
            if (t, 'han-TW') not in tsset:
                tsset.add((t, 'han-TW'))
                _ps, _ms = [], []
                for _s in ss:
                    __ps, __ms = pms[(t, _s)]
                    tps, _ = tsps(t, _s, __ps)
                    _ps.extend(tps)
                    _ms.extend(__ms)
                pinvd_add((t, 'han-TW'), _ps)
                meand_add((t, 'han-TW'), _ms)
            if (s, 'han-CN') not in tsset:
                tsset.add((s, 'han-CN'))
                _ps, _ms = [], []
                for _t in ts:
                    __ps, __ms = pms[(_t, s)]
                    _, sps = tsps(_t, s, __ps)
                    _ps.extend(sps)
                    _ms.extend(__ms)
                pinvd_add((s, 'han-CN'), _ps)
                meand_add((s, 'han-CN'), _ms)
        elif len(ss) == 1 and len(ts) > 1:
            counter.add('简繁：一简多繁')
            ps, ms = pms[(t, s)]
            tps, _ = tsps(t, s, ps)
            pinvd_add((t, 'han-TW'), tps)
            meand_add((t, 'han-TW'), ms)
            if (s, 'han-CN') in tsset:
                continue
            tsset.add((s, 'han-CN'))
            _ps, _ms = [], []
            for _t in ts:
                __ps, __ms = pms[(_t, s)]
                _, sps = tsps(_t, s, __ps)
                _ps.extend(sps)
                _ms.extend(__ms)
            pinvd_add((s, 'han-CN'), _ps)
            meand_add((s, 'han-CN'), _ms)
        elif len(ss) > 1 and len(ts) == 1:
            counter.add('简繁：多简一繁')
            ps, ms = pms[(t, s)]
            _, sps = tsps(t, s, ps)
            pinvd_add((s, 'han-CN'), sps)
            meand_add((s, 'han-CN'), ms)
            if (t, 'han-TW') in tsset:
                continue
            tsset.add((t, 'han-TW'))
            _ps, _ms = [], []
            for _s in ss:
                __ps, __ms = pms[(t, _s)]
                tps, _ = tsps(t, _s, __ps)
                _ps.extend(tps)
                _ms.extend(__ms)
            pinvd_add((t, 'han-TW'), _ps)
            meand_add((t, 'han-TW'), _ms)
        else:
            counter.add('简繁：没有对应')
    for w, l in wordl:
        ps = pinvd[(w, l)]
        ms = meand[(w, l + '')]
        yield w, l, ps, ms


def s5():
    def list_of_str(los):
        if not isinstance(los, list):
            return False
        return all(isinstance(s, str) for s in los)

    def fl(los):
        return [s for s in (s.strip() for s in los) if s]

    for w, l, ps, ms in s4():
        if not list_of_str(ps):
            print(w, l, ps)
            raise Exception('ps: not [str]')
        if not all(list_of_str(m) for m in ms):
            print(w, l, ms)
            raise Exception('ms: not [[str]]')
        yield w, l, fl(ps), [m for m in (fl(m) for m in ms) if m]


def s6():
    for w, l, ps, ms in s5():
        p = ', '.join(ps)
        m = '; '.join(', '.join(m) for m in ms)
        yield w, l, p, m


if __name__ == '__main__':
    # from argparse import ArgumentParser
    # parser = ArgumentParser()
    # parser.add_argument('dest', help='dest file')
    # args = parser.parse_args()
    with open('data.txt', mode='w', encoding='utf-8') as f:
        for w, l, p, m in s6():
            ql = [w, l, p, m, '0']
            f.write('\t'.join(ql) + '\n')
