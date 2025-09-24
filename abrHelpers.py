# uses abr web services to find acn (if exists) based on abn, returns None if business doesn't have an acn
# def abrSearchABN(abn):
#     return ("Trustworthy subcontractor solutions", None)

# # uses abr web services to find abn and acn (if exists) based on a business name
# def abrSearchName(name):
#     return (59537738403, None)

import requests
import xml.etree.ElementTree as ET
import json
import urllib
import datetime

# GUID for accessing the web services
GUID = "d6c41993-5ce1-41cd-a671-a7249e243efb"
ABR_URL = "https://abr.business.gov.au/"
ELEM_PREFIX = "{http://abr.business.gov.au/ABRXMLSearchRPC/literalTypes}"
ACN_PREFIX = '{http://abr.business.gov.au/ABRXMLSearch/}'
''' 
Information provided by this path:
History of business/trading names (trading names are generally obsolete), people tied to this abn, asicNumber, state, Periods of Active/Cancelled, 
Available on this path but not returned by this function: Public/Private Company, Postcode, Individual/Company (I think(?) already determined by existance of acn or not)
'''
def abrSearchABN(abn):
    includeHistoricalDetails = "Y"
    path = f"abrxmlsearchRPC/AbrXmlSearch.asmx/SearchByABNv201205?searchString={abn}&includeHistoricalDetails={includeHistoricalDetails}&authenticationGuid={GUID}"
    outputDict = {}
    # try:
    response = requests.get(ABR_URL + path, timeout=10)
    response.raise_for_status()
    # print(response.content)

    data = ET.fromstring(response.content)[1].findall(f"{ELEM_PREFIX}businessEntity201205")[0]
    tradingNamesElem = data.findall(f"{ELEM_PREFIX}mainTradingName")
    businessNamesElem = data.findall(f"{ELEM_PREFIX}businessName")
    legalNamesElem = data.findall(f"{ELEM_PREFIX}legalName")
    asicElem = data.find(f"{ELEM_PREFIX}ASICNumber")
    addressElem = data.findall(f"{ELEM_PREFIX}mainBusinessPhysicalAddress")

    statusTimeline = []
    statusElem = data.findall(f"{ELEM_PREFIX}entityStatus")
    for status in statusElem:
        effFrom = status.find(f"{ELEM_PREFIX}effectiveFrom")
        effTo = status.find(f"{ELEM_PREFIX}effectiveTo")
        if effTo is None:
            date = (effFrom.text, "Present")
        else:
            date = (effFrom.text, effTo.text)
        statusTimeline.append((status.find(f"{ELEM_PREFIX}entityStatusCode").text, date))
        # print(status.find(f"{ELEM_PREFIX}entityStatusCode").text)

    # print(data)
    # for child in data:
    #     print(child.tag, child.attrib)


    tradingNames = []
    for name in tradingNamesElem:
        effFrom = name.find(f"{ELEM_PREFIX}effectiveFrom")
        effTo = name.find(f"{ELEM_PREFIX}effectiveTo")
        if effTo is None:
            date = (effFrom.text, "Present")
        else:
            date = (effFrom.text, effTo.text)
        
        orgName = name.find(f"{ELEM_PREFIX}organisationName").text
        tradingNames.append((orgName, date))
    
    businessNames = []
    for name in businessNamesElem:
        effFrom = name.find(f"{ELEM_PREFIX}effectiveFrom")
        effTo = name.find(f"{ELEM_PREFIX}effectiveTo")
        if effTo is None:
            date = (effFrom.text, "Present")
        else:
            date = (effFrom.text, effTo.text)
        
        orgName = name.find(f"{ELEM_PREFIX}organisationName").text
        businessNames.append((orgName, date))
    
    legalNames = []
    for name in legalNamesElem:
        effFrom = name.find(f"{ELEM_PREFIX}effectiveFrom")
        effTo = name.find(f"{ELEM_PREFIX}effectiveTo")
        if effTo is None:
            date = (effFrom.text, "Present")
        else:
            date = (effFrom.text, effTo.text)
        givenName = name.find(f"{ELEM_PREFIX}givenName").text
        otherGivenName = name.find(f"{ELEM_PREFIX}otherGivenName").text
        otherGivenName = ' ' + otherGivenName if otherGivenName else ''
        familyName = name.find(f"{ELEM_PREFIX}familyName").text
        personName = f'{givenName}{otherGivenName} {familyName}'
        legalNames.append((personName, date))
    
    states = set()
    for address in addressElem:
        # print(address.tag, address.attrib)

        states.add(address.find(f"{ELEM_PREFIX}stateCode").text)

    # print(asicElem.tag)
    acn = None
    if not asicElem is None:
        acn = asicElem.text
    outputDict["businessNames"] = businessNames
    outputDict["tradingNames"] = tradingNames
    outputDict["relavantPeople"] = legalNames
    outputDict["statusTimeline"] = statusTimeline
    outputDict["states"] = states
    outputDict["acn"] = acn
    return outputDict

    # except:
    #     print("oopies")
def abrSearchName(name, option="businessName"):
    """
    Uses ABR web services to find ABN based on a name.
    
    Args:
        name (str): query string
        option (str): "businessName" if query is the business name, "legalName" if query is for the registered person for the business
        
    Returns:
        abn (string): The Australian Business Number
    """
    
    path = "abrxmlsearchRPC/AbrXmlSearch.asmx/ABRSearchByNameAdvancedSimpleProtocol2017"

    business_name = "Y" if option == "businessName" else "N"
    legal_name = "Y" if option == "personName" else "N"
    states_query = "&NSW=&SA=&ACT=&VIC=&WA=&NT=&QLD=&TAS=" # change when scaling up
    query = f"?name={urllib.parse.quote_plus(name)}&postcode=&legalName={legal_name}&tradingName={business_name}&businessName={business_name}&activeABNsOnly=Y{states_query}&authenticationGuid={GUID}&searchWidth=&minimumScore=&maxSearchResults="
    
    response = requests.get(ABR_URL + path + query, timeout=10)
    print(ABR_URL + path + query)
    response.raise_for_status()
    # print(response.content)

    # data = ET.fromstring(response.content)[1].findall(f"response")[0]
    data = ET.fromstring(response.content)[1].findall(f"{ELEM_PREFIX}searchResultsList")[0]
    resultsElem = data.findall(f"{ELEM_PREFIX}searchResultsRecord")

    abns = {}
    for result in resultsElem:
        # result also contains postcode/state
        abn = result.find(f"{ELEM_PREFIX}ABN").find(f"{ELEM_PREFIX}identifierValue").text
        names_to_check = ["businessName", "legalName", "mainName", "mainTradingName", "otherTradingName"]
        score = None
        for name_type in names_to_check:
            element = result.find(f"{ELEM_PREFIX}{name_type}")
            # print(element)
            if not element is None:
                score = element.find(f"{ELEM_PREFIX}score").text
                break 
        if score is None:
            for child in result:
                print(child.tag)
        if not abn in abns:
            abns[abn] = int(score) # if error here check parent tag is included in names_to_check, it will be one of the printed tags in line 164
            
        # abns.append((abn, int(score))) # if error here check parent tag is included in names_to_check, it will be one of the printed tags in line 164
            
    return list(abns.items())
    



'https://abr.business.gov.au/abrxmlsearch/AbrXmlSearch.asmx/SearchByASICv201408?searchString=166+205+938&includeHistoricalDetails=Y&authenticationGuid=d6c41993-5ce1-41cd-a671-a7249e243efb'
def abrSearchACN(acn):
    path = 'abrxmlsearch/AbrXmlSearch.asmx/SearchByASICv201408'
    query = f'?searchString={acn}&includeHistoricalDetails=Y&authenticationGuid={GUID}'
    response = requests.get(ABR_URL + path + query, timeout=10)
    # print(ABR_URL + path + query)
    response.raise_for_status()
    

    data = ET.fromstring(response.content)[1].findall(f"{ACN_PREFIX}businessEntity201408")[0]
    abnElem = data.find(f"{ACN_PREFIX}ABN")

    for elem in abnElem:
        print(elem.tag)


    return

abrSearchACN(166205938)