# gunicorn -c python:config -D server:app
# gunicorn -c python:config server:app
bind = '127.0.0.1:5000'
preload_app = True
user = 'lanx'
threads = 8
