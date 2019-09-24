# gunicorn3 -c config.py -D server:app
# gunicorn3 -c config.py server:app
bind = '127.0.0.1:5000'
preload_app = True
user = 'lanx'
threads = 8
