export function getUniqueArrayValues(arrayData) {
  return [...new Set(arrayData)]
}

export const convertToArray = (x) => Array.isArray(x) ? x : [x]

export async function getToken(username, password) {

  const url = `https://${process.env.COLECTICA_REPOSITORY_HOSTNAME}/token/createtoken`;

  const options = {
    method: 'POST',
    body: JSON.stringify({ "username": username, "password": password }),
    headers: { 'Content-Type': 'application/json' }
  }

  try {

    const res = await fetch(url, options)

    const retVal = res.status === 200 ? await res.json() : "";

    return retVal
  } catch (error) {
    console.log(`Error: authentication token generation request to ${url} failed. ${error.message}, ${error.cause}${error.cause.code}`)
  }
}

export async function executePostRequestWithToken(url, token, requestBody) {

  const options = {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
  }

  var res;

  try {
    res = await fetch(url, options);
  } catch (error) {
    throw new Error(`Error: API call to ${url} failed! ${error.message}, ${error.cause}, ${error.cause.code}`);
  }

  try {
    if (res.status === 200) return await res.json()

    else if (res.status === 401) throw new Error(`Authentication against API at ${url} failed!`)

    else throw new Error(`Error: API call to ${url} failed!`);

  } catch (error) {

    throw error
  }
}

export async function executeGetRequest(url, token) {

  const options = {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token },
    signal: AbortSignal.timeout(50000)
  }

  try {
    const res = await fetch(url, options);

    if (res.status === 200) return await res.json()
    else return ({ Status: res.status, Results: [] })

  } catch (error) {
    console.log(`Error: API call to ${url} failed! ${error.message}, ${error.cause}, ${error.cause.code}`)
  }

}

export async function executeGetRequestWithoutToken(url) {

  const options = {
    method: 'GET',
    signal: AbortSignal.timeout(50000)
  }

  try {
    const res = await fetch(url, options);
    return await res;
  } catch (error) {
    console.log(`Error: API call to ${url} failed! ${error.message}, ${error.cause}, ${error.cause.code}`)
  }

}

export async function executePostRequestWithoutToken(url, requestBody) {

  const options = {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: { 'Content-Type': 'application/json' }

  }

  try {
    const res = await fetch(url, options);
    return await res;
  } catch (error) {
    console.log(`Error: API call to ${url} failed! ${error.message}, ${error.cause}, ${error.cause.code}`)
  }

}

export function constructQueryBodyForGettingAllItems(type, maxResults=0, resultOffset=0, returnIdentifiersOnly='True') {
  return {
    "ItemTypes": [type],
    "searchTerms": [''],
    "MaxResults": maxResults,
    "resultOffset": resultOffset,
    "searchDepricatedItems": 'False',
    "searchLatestVersion": 'True',
    "returnIdentifiersOnly": returnIdentifiersOnly
  }
}

export function getJsonQueryForGettingReferencingItems(agency_id, item_id, version, typeOfItem) {
  return {
    "itemTypes": [typeOfItem],
    "targetItem": {
      "agencyId": agency_id,
      "identifier": item_id,
      "version": version
    },
    "useDistinctResultItem": 'True'
  }
}

export async function getRelatedItems(agency_id, item_id, version, typeOfItem, token, url) {
  const queryBody = getJsonQueryForGettingReferencingItems(agency_id, item_id, version, typeOfItem)
  const response = await executePostRequestWithToken(url,
    token,
    queryBody)
  return response
}

export async function retrieveDataInBatches(url, token, initialOffset, batchSize, returnIdentifiersOnly='True') {
  var allResults=[]
  var a ={"Results": []}
  var offset = initialOffset
  
  while(offset == initialOffset || a['Results'].length==batchSize || a['Results'].length==0) {
    a=await executePostRequestWithToken(url,
    token,
    constructQueryBodyForGettingAllItems("683889c6-f74b-4d5e-92ed-908c0a42bb2d", 
      batchSize, offset, returnIdentifiersOnly))
  allResults=allResults.concat(a['Results'])
  offset=offset+10000
  }

  return {'Results': allResults}
}
