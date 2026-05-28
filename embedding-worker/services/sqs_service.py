import boto3
import json
from config import AWS_REGION, SQS_QUEUE_URL

sqs = boto3.client("sqs", region_name=AWS_REGION)


def receive_messages():
    response = sqs.receive_message(
        QueueUrl=SQS_QUEUE_URL,
        MaxNumberOfMessages=5,
        WaitTimeSeconds=20
    )

    return response.get("Messages", [])


def delete_message(receipt_handle):
    sqs.delete_message(
        QueueUrl=SQS_QUEUE_URL,
        ReceiptHandle=receipt_handle
    )


def parse_message(message):
    body = json.loads(message["Body"])
    return body