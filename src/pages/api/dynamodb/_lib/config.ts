// Create service client module using ES6 syntax.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// Set the AWS Region.
const REGION = "us-west-2"; //e.g. "us-east-1"
// Create an Amazon DynamoDB service client object.

const ddbClient = new DynamoDBClient({
region: REGION,
credentials: {
  accessKeyId: import.meta.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "",
  secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY||process.env.AWS_SECRET_ACCESS_KEY || "",
}
});

export { ddbClient };