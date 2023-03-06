import { DynamoDB } from 'aws-sdk'

export async function login(event, context) {
    const requestBody = JSON.parse(event.body)
    const documentClient = new DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        region: 'ap-northeast-1'
    })
    const result = await documentClient.query({
        ExpressionAttributeValues: {
            ':m': requestBody.mailAddress,
            ':pw': requestBody.password
        },
        KeyConditionExpression: 'mailAddress = :m',
        FilterExpression: 'contains (password, :pw)',
        TableName: 'users'
    }).promise()
    
    return result.Items
}

export async function getUserById(event, content) {
    const id = event.queryStringParameters.id
    const documentClient = new DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        region: 'ap-northeast-1'
    })
    
    const result = await documentClient.get({
        TableName: "users",
        Key: { "id": id }
    }).promise()
    
    delete result.Item.password
    
    return result.Item
}