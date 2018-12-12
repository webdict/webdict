def tranform(fp):
    for line in fp:
        if "'" in line:
            raise Exception("`'` in line: " + line.strip())
        ps = [p.strip() for p in line.split('\t')]
        yield ['"%s"' % p.replace('"', '""') for p in ps]


files = {
    'EngData/data.txt': 'eng.txt',
    'HanData/data.txt': 'han.txt',
    'YueData/data.txt': 'yue.txt'
}
meand = {}
for old, new in files.items():
    with open(old, encoding='utf-8') as r:
        with open(new, mode='w', encoding='utf-8') as w:
            for line in tranform(r):
                *data, mean = line
                data.append('""')
                data.append('0\n')
                meand[data[0], data[1]] = mean
                w.write('\t'.join(data))
with open('mean.txt', mode='w', encoding='utf-8') as w:
    for (word, mark), mean in meand.items():
        data = [word, mark, '""', mean, '0\n']
        w.write('\t'.join(data))
