import time


class Counter:
    def __init__(self):
        self.count = 0
        self.time = time.time()

    def update(self):
        self.count += 1
        self.time = time.time()
    
    def reset(self):
        self.count = 0

    def __s_str(self, second: int, ago='ago'):
        if second == 0:
            return ago
        if second == 1:
            return 'one second ago'
        return str(second) + ' seconds ago'

    def __m_str(self, minute: int):
        if minute == 0:
            return ''
        if minute == 1:
            return 'one minute '
        return str(minute) + ' minutes '

    def how_long_ago(self):
        second = round(time.time() - self.time)
        if second < 60:
            return self.__s_str(second, 'now')
        minute = second // 60
        second = second % 60
        if minute < 60:
            return self.__m_str(minute) + self.__s_str(second)
        hour = minute // 60
        minute = minute % 60
        tail = self.__m_str(minute) + self.__s_str(second)
        if hour == 1:
            return 'one hour ' + tail
        return str(hour) + ' hours ' + tail

    def html(self):
        return '''\
<!DOCTYPE html>\
<html lang="en">\
<head>\
<meta charset="UTF-8">\
<meta name="viewport" content="width=device-width, initial-scale=1.0">\
<meta http-equiv="X-UA-Compatible" content="ie=edge">\
<title>webdict Status</title>\
</head>\
<body>\
<h6 align="center">%d @ %s</h6>\
</body>\
</html>\
''' % (self.count, self.how_long_ago())


__all__ = ['Counter']
