import HyoukaCore
import utils
baseURL = "./public/"
resultURL = "./results/"
episode = "第3卷"
person = "千反田"
HyoukaCore.initDict(episode)
paragraphs = HyoukaCore.getParagraphs(baseURL+person+"3"+".txt")

peoplecnt = HyoukaCore.getPeopleCnt(paragraphs,resultURL+"peopleCnt"+episode+person+".json")
#HyoukaCore.buildEventnet(resultURL+"历史年表.json")
HyoukaCore.buildNetwork(baseURL+person+"3"+".txt", resultURL + "社交网络" + episode +person+".json")