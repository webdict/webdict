from multiprocessing.dummy import Pool
from requests import get
from parser import parse
from json import load
from json import dump
with open('data.json', encoding='utf-8') as f:
    data = load(f)


def get_html(url, count=0):
    try:
        r = get(url)
        r.encoding = 'big5'
        return r.text
    except:
        if count > 4:
            raise Exception()
        return get_html(url, count + 1)


def do(rad):
    _data = {}
    for key in data[rad]:
        _data[key] = {}
        for han, url in data[rad][key].items():
            if type(url) is str and url.startswith('http'):
                try:
                    _data[key][han] = parse(get_html(url))
                    print(han, url)
                except:
                    _data[key][han] = url
            else:
                _data[key][han] = url
    data[rad] = _data


with Pool() as pool:
    pool.map(do, data)
    pool.close()
    pool.join()
    with open('data.json', mode='w', encoding='utf-8') as f:
        dump(data, f, ensure_ascii=False, indent=2)
