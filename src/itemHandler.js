import { DynamoDB, CloudSearchDomain } from 'aws-sdk'

export async function wordSearch(event, context) {
    const requestBody = JSON.parse(event.body)
    const cloudsearchdomain = new CloudSearchDomain({
    endpoint: 'search-search-test-t27wmxmekvnhrlwpraangrfwfu.ap-northeast-1.cloudsearch.amazonaws.com',
    });
    
    const start = (parseInt(requestBody.page) - 1) * parseInt(requestBody.take)
    
    const result = await cloudsearchdomain.search({
        query: requestBody.keyword,
        sort: `${requestBody.orderBy} ${requestBody.order}`,
        sort: `${requestBody.orderBy} ${requestBody.order}`,
        size: parseInt(requestBody.take),
        start: start
    }).promise()
    
    const array = result.hits.hit.map((item) => {
        return {
            id: item.fields.id[0],
            fesName: item.fields.fesname[0],
            itemImage: item.fields.itemimage[0],
            keywords: item.fields.keywords,
            twoDaysPrice: item.fields.twodaysprice,
            sevenDaysPrice: item.fields.sevendaysprice,
            artist: item.fields.artist[0],
            releaseDate: item.fields.releasedate[0],
            playTime: item.fields.playtime[0],
            categories: item.fields.categories,
            itemDetail: item.fields.itemdetail[0],
        }
    })
        return array
}

export async function cloudSearch(event, context) {
    const requestBody = JSON.parse(event.body)
    const cloudsearchdomain = new CloudSearchDomain({
    endpoint: 'search-search-test-t27wmxmekvnhrlwpraangrfwfu.ap-northeast-1.cloudsearch.amazonaws.com',
    });
    
    const start = (parseInt(requestBody.page) - 1) * parseInt(requestBody.take)
    
    const result = await cloudsearchdomain.search({
        query: requestBody.keyword,
        filterQuery:`categories:${requestBody.genre}`,
        sort: `${requestBody.orderBy} ${requestBody.order}`,
        size: parseInt(requestBody.take),
        start: start
    }).promise()
    
    const array = result.hits.hit.map((item) => {
        return {
            id: item.fields.id[0],
            fesName: item.fields.fesname[0],
            itemImage: item.fields.itemimage[0],
            keywords: item.fields.keywords,
            twoDaysPrice: item.fields.twodaysprice,
            sevenDaysPrice: item.fields.sevendaysprice,
            artist: item.fields.artist[0],
            releaseDate: item.fields.releasedate[0],
            playTime: item.fields.playtime[0],
            categories: item.fields.categories,
            itemDetail: item.fields.itemdetail[0],
        }
    })
    
    if(requestBody.keyword.length === 0){
        return []
    } else {
        return array
    }
}

export async function search(event, context) {
    const requestBody = JSON.parse(event.body)
    const documentClient = new DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        region: 'ap-northeast-1'
    })
    
    const genreResult = await documentClient.scan({
        TableName: 'items',
        ExpressionAttributeValues: {
            ':topic' : parseInt(requestBody.genre)
        },
        FilterExpression: 'contains (categories, :topic)',
    }).promise()
    
    const result = genreResult.Items
    
    const newArray = new Map(result.map(o => [o.id, o]))
    
    const searchResult = Array.from(newArray.values())
    
    if(requestBody.orderBy === 'itemId') {
        searchResult.sort((a, b) => b.id - a.id)
    } else {
        if(requestBody.order === 'asc') {
            searchResult.sort((a, b) => a.twoDaysPrice - b.twoDaysPrice)
        } else {
            searchResult.sort((a, b) => b.twoDaysPrice - a.twoDaysPrice)
        }
    }
    
    const startIndex = (requestBody.page - 1) * requestBody.take
    
    const returnItem = searchResult.slice(startIndex, startIndex + requestBody.take)
    
    return returnItem
}

export async function getNewItems(event, context) {
    const documentClient = new DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        region: 'ap-northeast-1'
    })
    const newItems = await documentClient.scan({
        TableName: "items",
        Limit: 10
    }).promise()
    
    return newItems.Items
}

export async function getAllItems(event, context) {
    const documentClient = new DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        region: 'ap-northeast-1'
    })
    const result = await documentClient.scan({
        TableName: "items",
    }).promise()
    
    return result.Items
}

export async function preTop(event, context) {
    const genre = event.queryStringParameters.genre
    const documentClient = new DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        region: 'ap-northeast-1'
    })
    const newItems = await documentClient.scan({
        TableName: "items",
        Limit: 10
    }).promise()
    const genreItems = await documentClient.scan({
        TableName: "items",
        ExpressionAttributeValues: {
            ':topic' : parseInt(genre)
        },
        FilterExpression: 'contains (categories, :topic)',
    }).promise()
    
    return {newItems: newItems.Items, genreItems: genreItems.Items.slice(-9)}
}

export async function getItemByGenre(event, context) {
    const genre = event.queryStringParameters.genre
    const documentClient = new DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        region: 'ap-northeast-1'
    })
    const result = await documentClient.scan({
        TableName: "items",
        ExpressionAttributeValues: {
            ':topic' : parseInt(genre)
        },
        FilterExpression: 'contains (categories, :topic)',
    }).promise()
    
    return result.Items
}

export async function getItems(event, context) {
    const documentClient = new DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        region: 'ap-northeast-1'
    })
    const result = await documentClient.scan({
        TableName: "items"
    }).promise()
    
    return result.Items
}

export async function getItemById(event, context) {
    const id = event.queryStringParameters.itemId
    const documentClient = new DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        region: 'ap-northeast-1'
    })
    const result = await documentClient.get({
        TableName: "items",
        Key: { "id": id }
    }).promise()
    
    return result.Item
}
