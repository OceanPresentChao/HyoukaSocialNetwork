import json


def json2object(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    f.close()
    return data

def object2json(object, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(object, f, ensure_ascii=False)
    f.close()
    return

def readTxt(filename):
    res = ''
    with open(filename, 'r', encoding='utf-8') as f:
        for line in f.readlines():
            line = line.lstrip()
            res += line
    f.close()
    return res

def arr2Text(arr,filename):
    with open(filename, 'w', encoding='utf-8') as f:
        for sentence in arr:
            f.write(str(sentence) + '\n')
    f.close()
    return

def getHyoukaDictionary():
    with open('public/HyoukaDictionary.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    f.close()
    return data

def getHyoukaSynDict(episode):
    with open('public/HyoukSynonym'+episode+'.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    f.close()
    return data#返回一个字典string-》dist