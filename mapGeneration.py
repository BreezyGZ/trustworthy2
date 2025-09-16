import csv
# import numpy as np
import json
from abrHelpers import abrSearchABN, abrSearchName

class Business:
    def __init__(self, name, abn, acn=None):
        self.name = name
        self.abn = int(abn)
        if acn:
            self.acn = int(acn)
        else:
            self.acn = None
    
    def __hash__(self):
        return hash(self.abn)

    def __eq__(self, other):
        return self.abn == other.abn

    def __str__(self):
        return '{' + f"Name: {self.name}, ABN: {self.abn}, ACN: {self.acn}" + '}'
    def __repr__(self):
        return self.__str__()

def serialize_business_dict(data):
    result = {}
    for parent, children in data.items():
        parent_key = f"{parent.name} (ABN: {parent.abn}, ACN: {parent.acn})"
        child_list = [f"{c.name} (ABN: {c.abn}, ACN: {c.acn})" for c in children]
        result[parent_key] = child_list
    return result

if __name__ == "__main__":
    parentCompanyDict = {}
    with open('construction_names.csv', mode='r') as file:
        csv_reader = csv.DictReader(file)
        for i, row in enumerate(csv_reader):
            name = row["Business Name"]
            abn = row["ABN"]
            acn = row["ACN"]

            if not name:
                print(f"No name {i}")
            if not abn:
                abn, acn = abrSearchName(name)
            elif not acn:
                acn = abrSearchABN(abn)[1]

            child = Business(name=name, abn=abn, acn=acn)

            parent = row["Controlling Corporation Name"]
            parentABN = row["Controlling Corporation ABN"]
            parentACN = row["Controlling Corporation ACN"]

            # cleans up parent data if one or more fields are missing
            if not (parent or parentABN or parentACN):
                continue
            elif (parent and parentABN and parentACN):
                pass
            else:
                if not (parent or parentACN):
                    parent, parentACN = abrSearchABN(parentABN)
                elif not parent:
                    parent = abrSearchABN(parentABN)[0]
                elif not (parentABN or parentACN):
                    parentABN, parentACN = abrSearchName(parent)
                elif not parentACN:
                    parentACN = abrSearchABN(parentABN)[1]
                elif not parentABN:
                    parentABN = abrSearchName(parent)[0]
            # print(f"{(parent, parentABN, parentACN)}")
            parentBusiness = Business(name=parent, abn=parentABN, acn=parentACN)

            if parentBusiness in parentCompanyDict:
                parentCompanyDict[parentBusiness].add(child)
            else:
                parentCompanyDict[parentBusiness] = {child}
            
            # if i == 68991:
            #     # print(f"Business name: {row["Business Name"]}, Parent Company: {row["Controlling Corporation Name"]}")
            #     print(child)
    clean_dict = serialize_business_dict(parentCompanyDict)
    with open("output.json", "w") as f:
        json.dump(clean_dict, f, indent=2)
    # print(parentCompanyDict)


