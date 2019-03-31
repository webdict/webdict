from threading import Lock
from secret import appstr
try:
    with open('.record.by', mode='rb') as f:
        record = list(f.read())
except:
    from random import randrange
    record = [randrange(0, 62) for _ in range(9)]

lock = Lock()


def nextid():
    def increment(i=0):
        if i == 9:
            return 1
        n = record[i]+increment(i+1)
        a, record[i] = divmod(n, 62)
        return a
    with lock:
        if increment():
            print('record index may overflow')
        with open('.record.by', mode='wb') as f:
            f.write(bytes(record))
        return ''.join(appstr[i] for i in record)
