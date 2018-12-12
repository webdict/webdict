from s.clean_p import clean_p
from s.clean_m import clean_m
from s.exclude import exclude
import re

source = 'table.txt'


def s0():
    with open(source, encoding='utf-8') as r:
        for line in r:
            # 词条：总数
            line = ' '.join(re.split(r'\s+', line.strip()))
            if re.match(r'^#', line):
                # 词条：井号注释
                continue
            regx = r'^([^ ]+) ([^ ]+) \[([^][]+)\] /(.*)/$'
            t, s, p, m = re.match(regx, line).groups()
            if ' ' in t + s:
                # 词条：词条空格
                continue
            if any(ord(c) < 256 for c in t + s):
                # 词条：非纯汉字
                continue
            if 'xx' in p:
                # 词条：未知拼音
                continue
            if not len(t) == len(s) == len(p.split(' ')):
                if len(t) == 1:
                    # 词条：拼音长度
                    continue
                else:
                    p = p.lower()
            else:
                p = clean_p(p, t, s)
            if not p:
                # 词条：非法拼音
                continue
            if re.search(r'\bvariant of\b', m, 2):
                # 词条：异体汉字
                continue
            if exclude(t, s):
                continue
            yield t, s, p, m


def s2():
    udict = dict()
    for t, s, p, m in s0():
        if (t, s) in udict:
            udict[t, s].append((p, m))
        else:
            udict[t, s] = [(p, m)]
    for (t, s), pms in udict.items():
        yield t, s, pms


def s4():
    def add(d, k, v):
        if k in d:
            if v not in d[k]:
                d[k].append(v)
        else:
            d[k] = [v]

    def tspms(t, s, pms):
        tpms = [(f'{p} > {s}', m) for p, m in pms]
        spms = [(f'{p} < {t}', m) for p, m in pms]
        return tpms, spms

    word_mark_dict = {}

    def add_word_mark(word, mark, pms):
        if (word, mark) in word_mark_dict:
            raise Exception('word: %s, mark: %s' % (word, mark))
        else:
            word_mark_dict[word, mark] = pms

    t2s = dict()
    s2t = dict()
    pmd = dict()
    for t, s, pms in s2():
        pmd[(t, s)] = pms
        add(t2s, t, s)
        add(s2t, s, t)
    tsset = set()
    for t, s in pmd:
        ss, ts = t2s[t], s2t[s]
        if len(ss) == 1 and len(ts) == 1:
            # 简繁：一一对应
            pms = pmd[(t, s)]
            if t == s:
                # 简繁相形
                # 简繁：同简同繁
                add_word_mark(t, 'han', pms)
            else:
                # 简繁异形
                tpms, spms = tspms(t, s, pms)
                tpms = [(p, f'@{s}@han-CN') for p, _ in tpms]
                add_word_mark(t, 'han-TW', tpms)
                add_word_mark(s, 'han-CN', spms)
        elif len(ss) > 1 and len(ts) > 1:
            # 简繁：多简多繁
            if (t, 'han-TW') not in tsset:
                tsset.add((t, 'han-TW'))
                _pms = []
                for _s in ss:
                    __pms = pmd[(t, _s)]
                    tpms, _ = tspms(t, _s, __pms)
                    _pms.extend(tpms)
                add_word_mark(t, 'han-TW', _pms)
            if (s, 'han-CN') not in tsset:
                tsset.add((s, 'han-CN'))
                _pms = []
                for _t in ts:
                    __pms = pmd[(_t, s)]
                    _, spms = tspms(_t, s, __pms)
                    _pms.extend(spms)
                add_word_mark(s, 'han-CN', _pms)
        elif len(ss) == 1 and len(ts) > 1:
            # 简繁：一简多繁
            pms = pmd[(t, s)]
            if t == s:
                add_word_mark(t, 'han', pms)
                ts = ts[:]
                ts.remove(t)
            else:
                tpms, _ = tspms(t, s, pms)
                add_word_mark(t, 'han-TW', tpms)
            if (s, 'han-CN') in tsset:
                continue
            tsset.add((s, 'han-CN'))
            _pms = []
            for _t in ts:
                __pms = pmd[(_t, s)]
                _, spms = tspms(_t, s, __pms)
                _pms.extend(spms)
            add_word_mark(s, 'han-CN', _pms)
        elif len(ss) > 1 and len(ts) == 1:
            # 简繁：多简一繁
            pms = pmd[(t, s)]
            if t == s:
                add_word_mark(s, 'han', pms)
                ss = ss[:]
                ss.remove(s)
            else:
                _, spms = tspms(t, s, pms)
                add_word_mark(s, 'han-CN', spms)
            if (t, 'han-TW') in tsset:
                continue
            tsset.add((t, 'han-TW'))
            _pms = []
            for _s in ss:
                __pms = pmd[(t, _s)]
                tpms, _ = tspms(t, _s, __pms)
                _pms.extend(tpms)
            add_word_mark(t, 'han-TW', _pms)
        else:
            raise Exception('简繁：没有对应')

    def clean(mean):
        ms = clean_m(mean.split('/'))
        if ',' in ''.join(ms):
            return '; '.join(ms)
        else:
            return ', '.join(ms)

    for word, mark in word_mark_dict:
        pms = word_mark_dict[word, mark]
        if len(pms) == 1:
            yield word, mark, pms[0][0], clean(pms[0][1])
        else:
            for i, (pinv, mean) in enumerate(pms):
                yield word, mark + '_' + str(i), pinv, clean(mean)


if __name__ == '__main__':
    with open('data.txt', mode='w', encoding='utf-8') as f:
        for word, mark, pinv, mean in s4():
            f.write('\t'.join([word, mark, pinv, mean]) + '\n')
