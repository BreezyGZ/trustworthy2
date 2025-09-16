import abrHelpers

def query(abn=None, acn=None, name=None, business_name=None):
    abns = []
    if not abn is None:
        abns.append(abn)
    if not acn is None:
        abns.append(abrHelpers.abrSearchACN(acn=acn))
    
    matches = []
    if not name is None:

        matches += abrHelpers.abrSearchName(name=name, option="legalName")
    if not business_name is None:
        matches += abrHelpers.abrSearchName(name=business_name, option="businessName")

    print(matches)
    abns += findBestMatches(matches)
    print(abns)

'''
Trims and sorts a list of abns to find best match; 
weighs a person name match as heavy as a business name, may change weighting in future

Assumes that an abn will appear at most twice for accurate sorting    
Args:
    abn_list (List[(abn: string, percent: int)]): 
        A list of unsorted abns, with how closely they match the query
    
Returns:
    The 20 highest matching abns
'''
def findBestMatches(abn_list):
    freq = {}
    for abn, percent in abn_list:
        if abn in freq:
            freq[abn][0] += 1
            freq[abn][1] = (freq[abn][1] * (freq[abn][0] - 1) + percent) / freq[abn][0]
        else:
            freq[abn] = [1, percent]

    sorted_abns = sorted(freq.items(), key=lambda x: (x[1][0], x[1][1]), reverse=True)
    print(freq)
    return [abn for abn, _ in sorted_abns[:20]]


query(business_name="trustworthy", name="esther")