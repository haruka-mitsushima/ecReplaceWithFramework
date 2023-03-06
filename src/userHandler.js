import { DynamoDB } from 'aws-sdk'

export async function selectRentalHistories(event, context) {
    const id = event.queryStringParameters.userId
    const documentClient = new DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        region: 'ap-northeast-1'
    })
    const result = await documentClient.get({
        TableName: 'users',
        Key: {
            'id': id
        }
    }).promise()
    
    if(result.Item){
        return { rental: result.Item.rentalHistories }
    } else {
        return { rental: [] }
    }
    
    
}

export async function selectCart(event, context) {
    const id = event.queryStringParameters.userId
    const documentClient = new DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        region: 'ap-northeast-1'
    })
    const result = await documentClient.get({
        TableName: 'users',
        Key: {
            'id': id
        }
    }).promise()
    
    return result.Item.userCarts
}

export async function addLogedinCart(event, context) {
    const id = event.queryStringParameters.userId
    const requestBody = JSON.parse(event.body)
    const documentClient = new DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        region: 'ap-northeast-1'
    })
    const user = await documentClient.get({
        TableName: 'users',
        Key: {
            'id': id
        },
    }).promise()
    
    const currentCart = user.Item.userCarts
    
    let cartId = parseInt(currentCart.slice(-1)[0].id)
    
    const newItems = requestBody.sessionCart.map((item) => {
        cartId += 1
        return {
          "id": cartId,
          "itemName":item.itemName,
          "rentalPeriod": item.rentalPeriod,
          "price": item.price,
          "itemImage": item.itemImage,
          "itemId": item.itemId
        }
    })
    
    currentCart.push(...newItems)
    
    const result = await documentClient.update({
        TableName: 'users',
        Key: {
            'id': id
        },
        ExpressionAttributeNames: {
          "#AT": "userCarts"
          }, 
        ExpressionAttributeValues: {
            ":t": currentCart
        }, 
        UpdateExpression: "SET #AT = :t",
        ReturnValues: 'ALL_NEW'
    }).promise()
    
    return user.Item.userCarts
}

export async function addCart(event, context) {
    const id = event.queryStringParameters.userId
    const requestBody = JSON.parse(event.body)
    const documentClient = new DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        region: 'ap-northeast-1'
    })
    const user = await documentClient.get({
        TableName: 'users',
        Key: {
            'id': id
        },
    }).promise()
    
    const currentCart = user.Item.userCarts
    
    const cartId = parseInt(currentCart.slice(-1)[0].id) + 1
    
    const newItem = {
      "id": cartId,
      "itemName":requestBody.itemName,
      "rentalPeriod": requestBody.rentalPeriod,
      "price": requestBody.price,
      "itemImage": requestBody.itemImage,
      "itemId": requestBody.itemId
    }
    
    currentCart.push(newItem)
    
    const result = await documentClient.update({
        TableName: 'users',
        Key: {
            'id': id
        },
        ExpressionAttributeNames: {
          "#AT": "userCarts"
          }, 
        ExpressionAttributeValues: {
            ":t": currentCart
        }, 
        UpdateExpression: "SET #AT = :t",
        ReturnValues: 'ALL_NEW'
    }).promise()
    
    return { isAdd: true }
}

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
        KeyConditionExpression: 'id = :m',
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