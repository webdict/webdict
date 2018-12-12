from secret import appstr
with open('record.txt', encoding='utf-8') as f:
    record = [int(x) for x in f.read().strip().split(' ')]


def _write_record():
    with open('record.txt', mode='w') as f:
        f.write(' '.join(str(x) for x in record))


def _incre_record():
    def move(i):
        if i == 9:
            return 1
        n = record[i]+move(i+1)
        if n > 61:
            if i == 0:
                raise IndexError('record index out of range')
            record[i] = n-62
            return 1
        record[i] = n
        return 0
    move(0)
