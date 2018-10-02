def _cursor():
    from sqlite3 import connect
    con = connect('vocab.db', check_same_thread=False)
    return con.cursor()


cursor = _cursor()
