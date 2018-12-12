def unique(iter, key=lambda x: x):
    s = set()
    for v in iter:
        k = key(v)
        if k not in s:
            s.add(k)
            yield v
