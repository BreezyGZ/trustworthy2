import requests


response = requests.get('''https://verify.licence.nsw.gov.au/home/Trades/results?&licenceGroupCode=Trades&status=[{"value":"Cancelled","label":"Cancelled"},{"value":"Current","label":"Current"},{"value":"Deregulated - No longer issued","label":"Deregulated - No longer issued"},{"value":"Expired","label":"Expired"},{"value":"Surrendered","label":"Surrendered"},{"value":"Suspended","label":"Suspended"}]&search=james&licenceClasses=[]&locationID=[]&isAdvancedSearch=true''')
response.raise_for_status()
print(response.content)