import { DynamoDB } from 'aws-sdk'

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
