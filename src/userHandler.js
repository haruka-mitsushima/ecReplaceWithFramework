import { DynamoDB } from 'aws-sdk'

export async function updateRentalHistory(event, context) {
    const userId = event.queryStringParameters.userId
    const rentalHistoryId = event.queryStringParameters.rentalHistoryId
    const requestBody = JSON.parse(event.body)
    const documentClient = new DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        region: 'ap-northeast-1'
    })
    const user = await documentClient.get({
        TableName: 'users',
        Key: {
            'id': userId
        },
        AttributesToGet: [
            'rentalHistories',
        ],
    }).promise()
    
    const newRentalHistory = user.Item.rentalHistories
    
    const updateItem = newRentalHistory.filter(item => item.id === parseInt(rentalHistoryId))
    const currentItem = newRentalHistory.filter(item => item.id !== parseInt(rentalHistoryId))
    
    updateItem[0].rentalStart = requestBody.rentalStart
    updateItem[0].rentalEnd = requestBody.rentalEnd
    
    currentItem.push(...updateItem)
    
    currentItem.sort((a, b) => a.id - b.id)
    
    const result = await documentClient.update({
        TableName: 'users',
        Key: {
            'id': userId
        },
        UpdateExpression: 'set rentalHistories = :t',
        ExpressionAttributeValues: {
            ':t' : currentItem,
        },
        ReturnValues: 'ALL_NEW'
    }).promise()
    
    return JSON.stringify(result)
}

export async function addRentalHistory(event, context) {
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
        }
    }).promise()
    
    const newRentalHistory = user.Item.rentalHistories
    
    let cartId = 0
    
    if(newRentalHistory.length === 0){
        cartId = 0
    } else {
        cartId = parseInt(newRentalHistory.slice(-1)[0].id)
    }
    
    const newItems = requestBody.addItem.map((item) => {
        cartId += 1
        item.id = cartId
        item.itemId = parseInt(item.itemId)
        return item
    })
    
    newRentalHistory.push(...newItems)
    
    const userCarts = []
    
    const result = await documentClient.update({
        TableName: 'users',
        Key: {
            'id': id
        },
        UpdateExpression: 'set rentalHistories = :t, userCarts = :s',
        ExpressionAttributeValues: {
            ':t' : newRentalHistory,
            ':s' : userCarts
        },
        ReturnValues: 'ALL_NEW'
    }).promise()
    
    return {message: 'success'}
}

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
    
    let errorFlg = false;
    if (!result.Item.userCarts) {
      errorFlg = true;
      return { errorFlg };
    } else {
      return { cart: result.Item.userCarts, errorFlg };
    }
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
    
    let cartId = 0
    
    if(currentCart.length === 0){
        cartId = 0
    } else {
        cartId = parseInt(currentCart.slice(-1)[0].id)   
    }
    
    const newItems = requestBody.sessionCart.map((item) => {
        cartId += 1
        return {
          "id": cartId,
          "itemName":item.itemName,
          "rentalPeriod": item.rentalPeriod,
          "price": item.price,
          "itemImage": item.itemImage,
          "itemId": parseInt(item.itemId)
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
    
    let cartId = 0
    
    if(currentCart.length === 0){
        cartId = 1
    } else {
        cartId = parseInt(currentCart.slice(-1)[0].id) + 1
    }
    
    const newItem = {
      "id": cartId,
      "itemName":requestBody.itemName,
      "rentalPeriod": requestBody.rentalPeriod,
      "price": requestBody.price,
      "itemImage": requestBody.itemImage,
      "itemId": parseInt(requestBody.itemId)
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

export async function deleteCart(event, context) {
    const userId = event.queryStringParameters.userId
    const cartId = event.queryStringParameters.cartId
    const documentClient = new DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        region: 'ap-northeast-1'
    })
    
    const user = await documentClient.get({
        TableName: 'users',
        Key: {
            'id': userId
        },
    }).promise()
    
    const currentCarts = user.Item.userCarts
    
    const newCarts = currentCarts.filter(cart => cart.id !== parseInt(cartId))
    
     const result = await documentClient.update({
        TableName: 'users',
        Key: {
            'id': userId
        },
        ExpressionAttributeNames: {
          "#AT": "userCarts"
          }, 
        ExpressionAttributeValues: {
            ":t": newCarts
        }, 
        UpdateExpression: "SET #AT = :t",
        ReturnValues: 'ALL_NEW'
    }).promise()
    
    return result.Items
}

export async function login(event, context) {
    const requestBody = JSON.parse(event.body)
    const documentClient = new DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        region: 'ap-northeast-1'
    })
    const users = await documentClient.query({
        ExpressionAttributeValues: {
            ':m': requestBody.mailAddress,
        },
        KeyConditionExpression: 'id = :m',
        TableName: 'users'
    }).promise()
    
    const result = users.Items.filter((user) => user.password === requestBody.password)
    
    if(result.length === 1){
        delete result[0].password
        return result[0]
    } else {
        return {message: 'error'}
    }
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