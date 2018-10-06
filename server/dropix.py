def _drop_suffix(words, index):
    word = words[index]
    lord = word.lower()
    if "'" in lord:
        words.append(word[:word.find("'")])
    if '’' in lord:
        words.append(word[:word.find('’')])
    if '-' in lord:
        words.append(word[:word.find('-')])
    if len(lord) > 2 and lord[-1] == lord[-2]:
        words.append(word[:-1])
    if lord.endswith('ies'):
        words.append(word[:-3] + 'y')
    elif lord[-4:] in ['less', 'ness', 'ment', 'able', 'ible', 'ence', 'ance', 'ship']:
        words.append(word[:-4])
    elif lord.endswith('s'):
        words.append(word[:-1])
        if lord.endswith('es'):
            words.append(word[:-2])
    elif lord.endswith('ed'):
        words.append(word[:-1])
        words.append(word[:-2])
    elif lord.endswith('i'):
        words.append(word[:-1] + 'y')
    elif lord.endswith('or'):
        words.append(word[:-2] + 'our')
        words.append(word[:-2])
    elif lord.endswith('er'):
        words.append(word[:-2] + 're')
        words.append(word[:-1])
        words.append(word[:-2])
    elif lord.endswith('men'):
        words.append(word[:-3] + 'man')
    elif lord.endswith('ly'):
        words.append(words[-1] + 'e')
        words.append(word[:-2])
    elif lord.endswith('ing'):
        words.append(word[:-3])
        words.append(words[-1] + 'e')
    elif lord.endswith('al') or lord.endswith('ee'):
        words.append(word[:-2])
    elif lord[-3:] in ['ful', 'ive', 'ise', 'ize']:
        words.append(word[:-3] + 'e')
        words.append(word[:-3])
    elif lord.endswith('ze'):
        words.append(word[:-2] + 'se')
    elif lord.endswith('ion'):
        words.append(word[:-3] + 'e')
        words.append(word[:-3])
        if lord.endswith('tion'):
            words.append(word[:-4] + 'e')
            if lord.endswith('ation') or lord.endswith('ition'):
                words.append(word[:-5] + 'e')
                words.append(word[:-5])
        elif lord.endswith('sion'):
            words.append(word[:-4] + 't')
            words.append(word[:-4] + 'd')
    elif lord.endswith('st'):
        words.append(word[:-2])
        words.append(word[:-3])

    if len(words) > index + 1:
        _drop_suffix(words, index + 1)


def _drop_prefix(words, index):
    word = words[index]
    lord = word.lower()
    if lord[:2] in ('im', 'in', 'un', 'il', 'ac', 're', 'de', 'ex', 'en', 'al'):
        words.append(word[2:])
    elif lord[:3] in ('mis', 'dis'):
        words.append(word[3:])
    if len(words) > index + 1:
        _drop_prefix(words, index + 1)


def dropix(word):
    family = [word]
    _drop_suffix(family, 0)
    _drop_prefix(family, 0)
    words = [word]
    sets = set([word.lower()])
    for word in family[1:]:
        lord = word.lower()
        if lord not in sets and len(word) > 1:
            words.append(word)
            sets.add(lord)
    return words
