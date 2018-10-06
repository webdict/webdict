from flask import request
from flask import Flask
from json import dumps
import worker



app = Flask(__name__)


@app.after_request
def add_headers(res):
    origin = request.headers.get('origin', '*')
    res.headers['Access-Control-Allow-Origin'] = origin
    res.headers['Access-Control-Allow-Credentials'] = 'true'
    res.headers['Content-Type'] = 'application/json'
    return res


@app.route('/dict/api/v1/search/<lang>/<text>')
def search(lang, text):
    if lang == 'en':
        return dumps(worker.search_en(text), ensure_ascii=False)
    elif lang == 'zh':
        return dumps(worker.search_zh(text), ensure_ascii=False)
    return '[]'


@app.route('/dict/api/v1/lookup/<lang>/<word>')
def lookup(lang, word):
    if lang == 'en':
        return '{}'
    elif lang == 'zh':
        return '{}'
    return '{}'


@app.route('/q/<text>')
def query(text: str):
    if "'" in text or text[1:3] not in ('zh', 'en'):
        return ''
    han = text[1:3] == 'zh'
    unit = worker.clist(text[3:]) if han else worker.wlist(text[3:])
    if not unit:
        return ''
    wlist, qword = unit
    data = worker.query(qword, han)
    if len(wlist) > 1:
        data['family'] = list(map(len, wlist)) if han else wlist
    if han:
        data['cleng'] = len(qword)
    else:
        data['qword'] = qword
    return dumps(data)


@app.route('/f/<text>')
def form(text: str):
    word, lang = text[2:], text[:2]
    if "'" in word or lang not in ('zh', 'en'):
        return ''
    return dumps(worker.query(word, lang == 'zh'))


@app.route('/m/<text>')
def modify(text: str):
    items = text.split('&&')
    for item in items:
        word, tran = item.split('&', 1)
        if "'" not in word:
            worker.define(word, tran.replace("'", "''"))
    return ''


@app.route('/d/<text>')
def define(text: str):
    if not text.startswith('@') or "'" in text:
        return ''
    return worker.check_define(text, set())


@app.route('/definition', methods=['POST'])
def post():
    forms = request.form
    for key in forms.keys():
        if "'" not in key:
            worker.define(key, forms[key].replace("'", "''"))
    return ''


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
