from base64 import b64encode
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from requests import get
from json import dump


def get_rad(href):
    try:
        src = urljoin(url, href)
        b64 = b64encode(get(src).content)
        rad = 'data:image/gif;base64,' + b64.decode('ascii')
        return rad
    except:
        from time import sleep
        sleep(1)
        return get_rad(href)


url = 'http://humanum.arts.cuhk.edu.hk/Lexis/lexi-can/classified.php?st=0'

r = get(url)
r.encoding = 'big5'
soup = BeautifulSoup(r.text, 'html5lib')

trs = soup.find('table').find_all('tr')
contents = {}

ths = {
    i: th.get_text().strip()
    for i, th in enumerate(trs[0].find_all('th')) if i
}
for tr in trs[1:]:
    rad = None
    for i, td in enumerate(tr.find_all('td')):
        if i == 0:
            rad = get_rad(td.find('img').get('src'))
            contents[rad] = {}
        else:
            contents[rad][ths[i]] = {}
            for a in td.find_all('a'):
                text = a.get_text().strip()
                href = urljoin(url, a.get('href').strip())
                contents[rad][ths[i]][text] = href
                print(text)

with open('contents.json', mode='w', encoding='utf-8') as f:
    dump(contents, f, ensure_ascii=False, indent=2)
