h2f = dict()


with open('family.verify.text', encoding='utf-8') as f:
    for c in f.readlines():
        h, f = c.split('=')
        h2f[h] = f.strip().split('$')


def family(head: str):
    try:
        return h2f[head.lower()]
    except:
        return None


__all__ = ['family']
