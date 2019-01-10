from datetime import timedelta

from secret import appkey
from secret import UUID
from secret import FLAG
from secret import PSWD

from flask import render_template
from flask import request
from flask import session
from flask import jsonify
from flask import Flask


app = Flask(__name__)
app.secret_key = appkey
app.permanent_session_lifetime = timedelta(days=365)


@app.before_request
def _before_request():
    if FLAG not in session:
        from rankey import rankey
        session.clear()
        session[UUID] = rankey()
        session[FLAG] = 0


@app.after_request
def _after_request(res):
    session.permanent = True
    origin = request.headers.get('origin', '*')
    res.headers['Access-Control-Allow-Origin'] = origin
    res.headers['Access-Control-Allow-Credentials'] = 'true'
    res.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return res


@app.route('/')
def _index():
    return 'hello, world!'


# flag:
#   0 - 未注册
#   1 - 已登录
#   2 - 开关
#   4 - 高级
#   8 - 超级
@app.route('/app/v1/contxt')
def _contxt():
    flag = session[FLAG]
    if flag == 0:
        return jsonify({
            'userflag': 0
        })
    from worker import contxt
    uuid = session[UUID]
    if flag != 1:
        flag = session[FLAG] = (flag | 2)-2
    else:
        from worker import myfreq
        freq = myfreq(uuid)
        if freq > 1000:
            flag = session[FLAG] = 9
        elif freq > 100:
            flag = session[FLAG] = 5
    data = contxt(uuid)
    data['userflag'] = flag
    return jsonify(data)


# 模糊搜索
@app.route('/app/v1/search/en/<text>')
def _search_en(text):
    if len(text) > 32 or "'" in text:
        return jsonify([])
    from worker import search_en
    uuid = session[UUID]
    return jsonify(search_en(text, uuid))


# 模糊搜索
@app.route('/app/v1/search/zh/<text>')
def _search_zh(text):
    if len(text) > 32 or "'" in text:
        return jsonify([])
    from worker import search_zh
    uuid = session[UUID]
    return jsonify(search_zh(text, uuid))


# 编辑释义
@app.route('/app/v1/define/<word>', methods=['POST'])
def _define(word):
    flag = session[FLAG]
    if flag == 0:
        return jsonify(-2)
    try:
        from worker import define
        data = request.get_json()
        if flag & 2 and not define(word, data, ''):
            return jsonify(0)
        uuid = session[UUID]
        return jsonify(define(word, data, uuid))
    except:
        return jsonify(-1)


@app.route('/app/v1/check')
def _check():
    from rankey import rankey
    from worker import signup
    from sender import sendin
    from worker import check
    from matchr import email
    try:
        data = request.get_json()
        username = data['username'].lower()
        if not email(username):
            return jsonify(-2)
        password = check(username)
        if password:
            session[PSWD] = password
            return jsonify(1)
        password = rankey(9)
        if sendin(password, username):
            signup(username, password)
            return jsonify(2)
        return jsonify(0)
    except:
        return jsonify(-1)


@app.route('/app/v1/check/in', methods=['POST'])
def _check_in():
    from worker import signin
    from matchr import email
    from matchr import passd
    try:
        data = request.get_json()
        name = data['username'].lower()
        if not email(name):
            return jsonify(-2)
        word = data['password']
        if not passd(word):
            return jsonify(-2)
        uuid = signin(name, word, session[UUID])
        if not uuid:
            return jsonify(0)
        session[UUID] = uuid
        session[FLAG] = 1
        session.pop(PSWD, None)
        return jsonify(1)
    except:
        return jsonify(-1)


@app.route('/app/v1/check/at', methods=['POST'])
def _check_at():
    from sender import sendat
    from worker import passwd
    from matchr import email
    try:
        data = request.get_json()
        username = data['username'].lower()
        if not email(username):
            return jsonify(-2)
        password = session[PSWD]
        if sendat(password, username):
            passwd(username, password)
        return jsonify(1)
    except:
        return jsonify(-1)


@app.route('/reset/password/<code>')
def _reset_password(code):
    from worker import passwd
    from rankey import rankey
    from sender import sendre
    from signer import loads
    try:
        username, timestamp = loads(code)
        if not timestamp:
            password = rankey(9)
            if sendre(password, username):
                passwd(username, password)
            return render_template(
                'reset_sucess.html',
                username=username
            )
        return render_template(
            'reset_outage.html',
            username=username
        )
    except:
        return render_template(
            'reset_failed.html',
            username=username
        )


@app.route('/app/v1/addnote', methods=['POST'])
def _addnote():
    from worker import addnote
    try:
        data = request.get_json()
        note = data['note'].strip()
        if note:
            furl = data['furl']
            uuid = session[UUID]
            addnote(uuid, note, furl)
        return jsonify(1)
    except:
        return jsonify(-1)


@app.route('/app/v1/getnote/<int:page>/<int:size>/<order>')
def _getnote(page, size, order):
    offset = (page-1)*size
    if offset >= 1000:
        return jsonify(total=0, data=[])
    if any(x not in ('furl', 'time', 'note') for x in order.split('-')):
        return jsonify(total=0, data=[])
    from worker import getnote
    order = order.replace('-', ', ')
    note = request.args.get('note')
    furl = request.args.get('furl')
    uuid = session[UUID]
    limit = size
    return jsonify(getnote(
        uuid,
        note,
        furl,
        order,
        limit,
        offset
    ))


@app.route('/app/v1/history/<int:page>/<int:size>/<int:flag>/<int:other>/<operator>/<order>')
def _history(page, size, flag, other, operator, order):
    word = request.args.get('word')
    offset = (page-1)*size
    if offset >= (100 if word else 1000):
        return jsonify(total=0, data=[])
    if operator not in ('and', 'or'):
        return jsonify(total=0, data=[])
    if any(x not in ('word', 'time_DESC', 'freq_DESC') for x in order.split('-')):
        return jsonify(total=0, data=[])
    from worker import history
    order = order.replace('-', ', ').replace('_', ' ')
    uuid = session[UUID]
    limit = size
    return jsonify(history(
        uuid,
        word,
        flag,
        operator,
        other,
        order,
        limit,
        offset
    ))


@app.route('/app/v1/reflag/<word>/<int:flag>')
def _reflag(word, flag):
    from worker import reflag
    uuid = session[UUID]
    return jsonify(reflag(uuid, word, flag))


@app.route('/app/v1/reinfo/<word>/<info>')
def _reinfo(word, info):
    from worker import reinfo
    uuid = session[UUID]
    return jsonify(reinfo(uuid, word, info))


@app.route('/app/v1/deflag/<word>')
def _deflag(word):
    from worker import deflag
    uuid = session[UUID]
    return jsonify(deflag(uuid, word))


@app.route('/app/v1/status/<int:time>')
def _status(time):
    if time < 1543622400:  # 2018-12-01 00:00+08
        return jsonify({})
    flag = session[FLAG]
    if flag < 0:  # permission denied
        return jsonify({})
    from worker import status
    return jsonify(status(time))


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
