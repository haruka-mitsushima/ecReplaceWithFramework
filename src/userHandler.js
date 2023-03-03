import { DynamoDB } from 'aws-sdk'

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