'''module docstring'''


# pylint: disable=R0912, R0915
def drop_suffix(wlist: [str], index: int):
    '''function docstring'''
    word = wlist[index]
    low = word.lower()
    if '’' in low:
        wlist.append(word[:word.find('’')])
    if '-' in low:
        wlist.append(word[:word.find('-')])
    if len(low) > 2 and low[-1] == low[-2]:
        wlist.append(word[:-1])
    if low.endswith('ies'):
        wlist.append(word[:-3] + 'y')
    elif low[-4:] in ['less', 'ness', 'ment', 'able', 'ible', 'ence', 'ance', 'ship']:
        wlist.append(word[:-4])
    elif low.endswith('s'):
        wlist.append(word[:-1])
        if low.endswith('es'):
            wlist.append(word[:-2])
    elif low.endswith('ed'):
        wlist.append(word[:-1])
        wlist.append(word[:-2])
    elif low.endswith('i'):
        wlist.append(word[:-1] + 'y')
    elif low.endswith('or'):
        wlist.append(word[:-2] + 'our')
        wlist.append(word[:-2])
    elif low.endswith('er'):
        wlist.append(word[:-2] + 're')
        wlist.append(word[:-1])
        wlist.append(word[:-2])
    elif low.endswith('men'):
        wlist.append(word[:-3] + 'man')
    elif low.endswith('ly'):
        wlist.append(wlist[-1] + 'e')
        wlist.append(word[:-2])
    elif low.endswith('ing'):
        wlist.append(word[:-3])
        wlist.append(wlist[-1] + 'e')
    elif low.endswith('al') or low.endswith('ee'):
        wlist.append(word[:-2])
    elif low[-3:] in ['ful', 'ive', 'ise', 'ize']:
        wlist.append(word[:-3] + 'e')
        wlist.append(word[:-3])
    elif low.endswith('ze'):
        wlist.append(word[:-2] + 'se')
    elif low.endswith('ion'):
        wlist.append(word[:-3] + 'e')
        wlist.append(word[:-3])
        if low.endswith('tion'):
            wlist.append(word[:-4] + 'e')
            if low.endswith('ation') or low.endswith('ition'):
                wlist.append(word[:-5] + 'e')
                wlist.append(word[:-5])
        elif low.endswith('sion'):
            wlist.append(word[:-4] + 't')
            wlist.append(word[:-4] + 'd')
    elif low.endswith('st'):
        wlist.append(word[:-2])
        wlist.append(word[:-3])

    if len(wlist) > index + 1:
        drop_suffix(wlist, index + 1)


def drop_prefix(wlist: [str], index: int):
    '''function docstring'''
    word = wlist[index]
    low = word.lower()
    if low[:2] in ('im', 'in', 'un', 'il', 'ac', 're', 'de', 'ex', 'en', 'al'):
        wlist.append(word[2:])
    elif low[:3] in ('mis', 'dis'):
        wlist.append(word[3:])
    if len(wlist) > index + 1:
        drop_prefix(wlist, index + 1)


def fork_word(word: str):
    '''function docstring'''
    wlist = [word]
    drop_suffix(wlist, 0)
    drop_prefix(wlist, 0)
    return list(filter(lambda x: len(x) > 1, wlist))


__all__ = ['fork_word']
