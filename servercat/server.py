from datetime import timedelta

from semail import semail
from secret import appkey
from secret import UUID
from secret import FLAG

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
#  19 - 管理员(1+2+16)
@app.route('/app/v1/contxt')
def _contxt():
    flag = session[FLAG]
    if flag == 0:
        return jsonify({
            'userflag': 0
        })
    from worker import contxt
    if flag == 19:
        data = contxt('')
    else:
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
        if flag == 19:
            return jsonify(define(word, data, ''))
        if flag & 2 and not define(word, data, ''):
            return jsonify(0)
        uuid = session[UUID]
        return jsonify(define(word, data, uuid))
    except:
        return jsonify(-1)


@app.route('/app/v1/hintme/<username>')
def _hintme(username):
    from worker import hintme
    return jsonify(hintme(username))


@app.route('/app/v1/signin', methods=['POST'])
def _signin():
    from worker import signin
    try:
        data = request.get_json()
        name = data['username']
        word = data['password']
        uuid = session[UUID]
        uuid = signin(name, word, uuid)
        if uuid is None:
            return jsonify(0)
        if uuid:
            session[UUID] = uuid
            session[FLAG] = 1
        else:
            session[FLAG] = 19
        return jsonify(1)
    except:
        return jsonify(-1)


@app.route('/app/v1/signup', methods=['POST'])
def _signup():
    from record import nextid
    from worker import signup
    from signer import dumps
    from re import match
    try:
        data = request.get_json()
        username = data['username'].lower()
        # if not match(r'^1([3578]\d|4[579]|66|9[89])\d{8}$', username):
        if not match(r'^[-._a-z0-9]+@(?:[-a-z0-9]+\.)+[a-z]+$', username):
            return jsonify(-2)
        password = data['password']
        passhint = data['passhint']
        gender = data.get('gender', 1)
        birday = data.get('birday', 0)
        uuid = session[UUID], nextid()
        signup(
            username,
            password,
            passhint,
            uuid,
            gender,
            birday
        )
        session[FLAG] = 1
        code = dumps(username)
        return jsonify(semail(
            f'http://dict.ngolin.com/verify/{code}',
            username
        ))
    except:
        return jsonify(-1)


@app.route('/verify/<code>')
def _verify(code):
    from worker import verify
    from signer import loads
    from signer import dumps
    try:
        username, timestamp = loads(code)
        if not timestamp:
            verify(username)
            return render_template('verify_sucess.html', username=username)
        code = dumps(username)
        try:
            if semail(f'http://dict.ngolin.com/verify/{code}', username):
                return render_template('verify_retry.html', username=username)
            raise Exception()
        except:
            return render_template('verify_later.html', username=username)
    except:
        return 404


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
