import utils
import json
import networkx as nx
from itertools import combinations
from harvesttext import HarvestText
from harvesttext.resources import get_qh_sent_dict,get_baidu_stopwords

HT = HarvestText()
stopwords = get_baidu_stopwords()
sdict = get_qh_sent_dict()

def initDict(episode):
    type_dictionary = utils.getHyoukaDictionary()
    mention_ictionary = utils.getHyoukaSynDict(episode)
    #HT.add_typed_words(sdict)
    HT.add_entities(mention_ictionary,type_dictionary)
    return

def getParagraphs(filename):
    fileData = utils.readTxt(filename)
    fileParas = HT.cut_paragraphs(fileData, remove_puncts=True)
    fileSentences = [];
    for item in fileParas:
        fileSentences.append(HT.cut_sentences(item))
    return fileSentences

def getPeopleCnt(paragraphs,filename):
    people_count = {}
    flag = False;
    for paragraph in paragraphs:
        for sentence in paragraph:
            if '「' in sentence:flag = True
            for span,entity in HT.entity_linking(sentence):
                if entity[1] == "#PER#":
                    if entity[0] == '千反田爱瑠' and flag:continue
                    if entity[0] in people_count:
                        people_count[entity[0]] = people_count[entity[0]] + 1
                    else:people_count[entity[0]] = 1
            flag = False
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(people_count, f, ensure_ascii=False)
    f.close()
    return people_count

def buildGraph(paragraphs):
    G = nx.Graph()
    links = {}
    minFreq = 0
    for i,sent in enumerate(paragraphs):
        entitiesInfo = HT.entity_linking(sent)
        entities = set(entity for span,(entity,type) in entitiesInfo)
        for u,v in combinations(entities,2):
            pair = tuple(sorted(u,v))
            if pair not in links:
                links[pair] = 1
            else:
                links[pair] +=1
    for(u,v) in links:
        if links[(u,v)] >= minFreq:
            G.add_edge(u,v,weight = links[(u,v)])
    return G

def buildNetwork(inputfile,outputfile):
    fileData = utils.readTxt(inputfile)
    fileParas = HT.cut_paragraphs(fileData, remove_puncts=True)
    G = HT.build_entity_graph(fileParas)
    #G = buildGraph(fileParas)
    newdict = dict(G.edges.items())
    result = []
    for key in newdict.keys():
        tmp = {}
        tmp["node1"] = key[0]
        tmp["node2"] = key[1]
        tmp["weight"] = newdict[key]["weight"]
        result.append(tmp)
    print(result)
    utils.object2json(result,outputfile)
    return;

def buildEventnet(filename):
    doc = utils.readTxt("./public/历史年表.txt")
    sentences = HT.cut_sentences(doc)
    SVOs = []
    for i,sent in enumerate(sentences):
        SVOs += HT.triple_extraction(sent)
    utils.object2json(SVOs,filename)
    return
