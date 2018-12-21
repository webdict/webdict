from datetime import timedelta
from secret import UUID, FLAG
from secret import appkey
from flask import request
from flask import session
from flask import jsonify
from flask import Flask
import worker

app = Flask(__name__)
app.secret_key = appkey
app.permanent_session_lifetime = timedelta(days=365)


@app.before_request
def ensure_session():
    if FLAG in session:
        return
    from uuid import uuid4
    session.clear()
    session[UUID] = uuid4().hex
    session[FLAG] = 0


@app.after_request
def add_headers(res):
    origin = request.headers.get('origin', '*')
    res.headers['Access-Control-Allow-Origin'] = origin
    res.headers['Access-Control-Allow-Credentials'] = 'true'
    res.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    session.permanent = True
    return res


@app.route('/')
def index():
    from flask import url_for, redirect
    return redirect(url_for('hello', name='world'))


@app.route('/hello/<name>')
def hello(name):
    return 'Hello, %s!' % name


# flag:
#   0 - 未注册
#   1 - 已登录
#   2 - 开关
#   4 - 高级
#   8 - 超级
#  19 - 管理员(1+2+16)
@app.route('/app/v1/contxt')
def contxt():
    flag = session[FLAG]
    if flag == 0:
        return '{"userflag": 0}'
    if flag == 19:
        data = worker.contxt('')
    else:
        uuid = session[UUID]
        if flag == 1:
            freq = worker.myfreq(uuid)
            if freq > 1000:
                flag = session[FLAG] = 9
            elif freq > 100:
                flag = session[FLAG] = 5
        else:
            flag = session[FLAG] = (flag | 2)-2
        data = worker.contxt(uuid)
    data['userflag'] = flag
    return jsonify(data)


# 模糊搜索
@app.route('/app/v1/search/en/<text>')
def search_en(text):
    if len(text) > 32 or "'" in text:
        return '[]'
    uuid = session[UUID]
    return jsonify(worker.search_en(text, uuid))


# 模糊搜索
@app.route('/app/v1/search/zh/<text>')
def search_zh(text):
    if len(text) > 32 or "'" in text:
        return '[]'
    uuid = session[UUID]
    return jsonify(worker.search_zh(text, uuid))


# 编辑释义
@app.route('/app/v1/define/<word>', methods=['POST'])
def define(word):
    flag = session[FLAG]
    if flag == 0:
        return jsonify(-2)
    try:
        data = request.get_json()
        if flag == 19:
            return worker.define(word, data, '')
        uuid = session[UUID]
        if flag & 2:
            worker.define(word, data, '')
        return worker.define(word, data, uuid)
    except:
        return jsonify(-1)


@app.route('/app/v1/hintme/<username>')
def hintme(username):
    return jsonify(worker.hintme(username))


@app.route('/app/v1/signin', methods=['POST'])
def signin():
    try:
        data = request.get_json()
        name = data['username']
        word = data['password']
        uuid = session[UUID]
        uuid = worker.signin(name, word, uuid)
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
def signup():
    try:
        from re import match
        from record import nextid
        data = request.get_json()
        name = data['username']
        if not match(r'^1([3578]\d|4[579]|66|9[89])\d{8}$', name):
            return jsonify(-2)
        word = data['password']
        hint = data['passhint']
        gender = data.get('gender', 1)
        birday = data.get('birday', 0)
        uuid = session[UUID], nextid()
        worker.signup(
            name,
            word,
            hint,
            uuid,
            gender,
            birday
        )
        session[FLAG] = 1
        return jsonify(1)
    except:
        return jsonify(-1)


@app.route('/app/v1/addnote', methods=['POST'])
def addnote():
    try:
        data = request.get_json()
        note = data['note'].strip()
        if note:
            furl = data['furl']
            uuid = session[UUID]
            worker.addnote(uuid, note, furl)
        return jsonify(1)
    except:
        return jsonify(-1)


@app.route('/app/v1/getnote/<int:page>/<int:size>/<order>')
def getnote(page, size, order):
    offset = (page-1)*size
    if offset >= 1000:
        return jsonify(total=0, data=[])
    if any(x not in ('furl', 'time', 'note') for x in order.split('-')):
        return jsonify(total=0, data=[])
    order = order.replace('-', ', ')
    note = request.args.get('note')
    furl = request.args.get('furl')
    uuid = session[UUID]
    limit = size
    return jsonify(
        worker.getnote(
            uuid,
            note,
            furl,
            order,
            limit,
            offset
        )
    )


@app.route('/app/v1/history/<int:page>/<int:size>/<int:flag>/<int:other>/<operator>/<order>')
def history(page, size, flag, other, operator, order):
    word = request.args.get('word')
    offset = (page-1)*size
    if offset >= (100 if word else 1000):
        return jsonify(total=0, data=[])
    if operator not in ('and', 'or'):
        return jsonify(total=0, data=[])
    if any(x not in ('word', 'time_DESC', 'freq_DESC') for x in order.split('-')):
        return jsonify(total=0, data=[])
    order = order.replace('-', ', ').replace('_', ' ')
    uuid = session[UUID]
    limit = size
    return jsonify(
        worker.history(
            uuid,
            word,
            flag,
            operator,
            other,
            order,
            limit,
            offset
        )
    )


@app.route('/app/v1/reflag/<word>/<int:flag>')
def reflag(word, flag):
    uuid = session[UUID]
    return jsonify(worker.reflag(uuid, word, flag))


@app.route('/app/v1/reinfo/<word>/<info>')
def reinfo(word, info):
    uuid = session[UUID]
    return jsonify(worker.reinfo(uuid, word, info))


@app.route('/app/v1/deflag/<word>')
def deflag(word):
    uuid = session[UUID]
    return jsonify(worker.deflag(uuid, word))


@app.route('/app/v1/status/<int:time>')
def status(time):
    if time < 1543622400:  # 2018-12-01 00:00+08
        return jsonify({})
    flag = session[FLAG]
    if flag < 0:  # permission denied
        return jsonify({})
    return jsonify(worker.status(time))


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
