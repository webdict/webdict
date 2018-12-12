from multiprocessing import Lock as MLock
from threading import Lock as TLock
from string import ascii_letters
from string import digits
from random import sample
from random import choice
from random import seed
from time import sleep
from time import time

letters = sample(digits+ascii_letters, 62)

tlock, mlock, prev = TLock(), MLock(), 0


def random():
    global prev
    with mlock, tlock:
        now = time()
        if prev+8 > now:
            now += 8
            sleep(8)
        prev = now
        return ''.join(choice(letters) for _ in range(9))


if __name__ == '__main__':
    keys = set()
    for _ in range(1000000):
        key = random()
        if key in keys:
            raise Exception(key)
        keys.add(key)
