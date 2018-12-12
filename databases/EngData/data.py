with open('mean.txt', encoding='utf-8') as f:
    meand = {}
    for line in f:
        line = line.strip() + '\t'
        word, mean = line.split('\t')[:2]
        meand[word] = mean
with open('data.txt', mode='w', encoding='utf-8') as w:
    with open('pron.txt', encoding='utf-8') as r:
        for line in r:
            ps = line.split('\t')[:-1]
            ps.append(meand.get(ps[0], ''))
            w.write('\t'.join(ps) + '\n')
