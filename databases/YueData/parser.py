from bs4 import BeautifulSoup
from requests import get


def parse_table(table):
    data = {}
    tds = [
        td.get_text().strip() for tr in table.find_all('tr')
        for td in tr.find_all('td')
    ]
    for i in range(len(tds)):
        if tds[i].endswith(':') and i + 1 < len(tds):
            data[tds[i][:-1]] = tds[i + 1]
    return data


def parse_table_1(table):
    trs = table.find_all('tr')[1:]
    data = []
    for tr in trs:
        tds = [td.get_text().strip() for td in tr.find_all('td')]
        data.append([tds[0], tds[-1]])
    return data


def parse(html):
    soup = BeautifulSoup(html, 'html5lib')
    tables = soup.find_all('table')
    data = {}
    data.update(parse_table(tables[0]))
    data.update(parse_table(tables[-2]))
    data.update(parse_table(tables[-1]))
    data['音節詞例'] = parse_table_1(tables[1])
    return data
