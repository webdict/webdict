'''module docstring'''
import json

from flask import Flask, request
import cursor

# pylint: disable=C0103
app = Flask(__name__)

headers = {'Access-Control-Allow-Origin': '*'}


@app.route('/q/<text>')
def query(text: str):
    '''function docstring'''
    if "'" in text or text[1:3] not in ('zh', 'en'):
        return '', headers
    han = text[1:3] == 'zh'
    unit = cursor.clist(text[3:]) if han else cursor.wlist(text[3:])
    if not unit:
        return '', headers
    wlist, qword = unit
    data = cursor.query(qword, han)
    if len(wlist) > 1:
        data['family'] = list(map(len, wlist)) if han else wlist
    if han:
        data['cleng'] = len(qword)
    else:
        data['qword'] = qword
    return json.dumps(data), headers


@app.route('/f/<text>')
def form(text: str):
    '''function docstring'''
    word, lang = text[2:], text[:2]
    if "'" in word or lang not in ('zh', 'en'):
        return '', headers
    return json.dumps(cursor.query(word, lang == 'zh')), headers


@app.route('/m/<text>')
def modify(text: str):
    '''function docstring'''
    items = text.split('&&')
    for item in items:
        word, tran = item.split('&', 1)
        if "'" not in word:
            cursor.define(word, tran.replace("'", "''"))
    return ''


@app.route('/d/<text>')
def define(text: str):
    '''function docstring'''
    if not text.startswith('@') or "'" in text:
        return '', headers
    return cursor.check_define(text, set()), headers


@app.route('/s/count')
def count():
    '''function docstring'''
    return cursor.count()


@app.route('/s/json')
def jsons():
    '''function docstring'''
    return json.dumps(cursor.json())


@app.route('/s/reset')
def reset():
    '''function docstring'''
    cursor.reset()
    return '', 204


@app.route('/definition', methods=['POST'])
def post():
    '''function docstring'''
    forms = request.form
    for key in forms.keys():
        if "'" not in key:
            cursor.define(key, forms[key].replace("'", "''"))
    return '', 204
