const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE = "Orders";

// CREATE
module.exports.createOrder = async (event) => {
  const data = JSON.parse(event.body);
  const order = {
    id: uuidv4(),
    customer_name: data.customer_name,
    product_id: data.product_id,
    quantity: data.quantity,
    total_price: data.total_price,
    status: data.status,
    order_date: data.order_date,
  };
  await dynamoDb.put({ TableName: TABLE, Item: order }).promise();
  return {
    statusCode: 201,
    body: JSON.stringify(order),
  };
};

// READ
module.exports.getOrder = async (event) => {
  const { id } = event.pathParameters;
  const result = await dynamoDb.get({ TableName: TABLE, Key: { id } }).promise();
  return result.Item
    ? { statusCode: 200, body: JSON.stringify(result.Item) }
    : { statusCode: 404, body: JSON.stringify({ error: "Pedido no encontrado" }) };
};

// UPDATE
module.exports.updateOrder = async (event) => {
  const { id } = event.pathParameters;
  const data = JSON.parse(event.body);
  const params = {
    TableName: TABLE,
    Key: { id },
    UpdateExpression: `set customer_name = :n, product_id = :p, quantity = :q, total_price = :t, status = :s, order_date = :d`,
    ExpressionAttributeValues: {
      ":n": data.customer_name,
      ":p": data.product_id,
      ":q": data.quantity,
      ":t": data.total_price,
      ":s": data.status,
      ":d": data.order_date,
    },
    ReturnValues: "ALL_NEW",
  };
  const result = await dynamoDb.update(params).promise();
  return { statusCode: 200, body: JSON.stringify(result.Attributes) };
};

// DELETE
module.exports.deleteOrder = async (event) => {
  const { id } = event.pathParameters;
  await dynamoDb.delete({ TableName: TABLE, Key: { id } }).promise();
  return { statusCode: 200, body: JSON.stringify({ message: "Pedido eliminado" }) };
};

// LIST
module.exports.listOrders = async () => {
  const result = await dynamoDb.scan({ TableName: TABLE }).promise();
  return { statusCode: 200, body: JSON.stringify(result.Items) };
};
