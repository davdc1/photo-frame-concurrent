import os
from dotenv import load_dotenv

load_dotenv()

AWS_REGION = os.getenv("AWS_REGION") or os.getenv("AWS_S3_REGION")
SQS_QUEUE_URL = os.getenv("SQS_QUEUE_URL")
S3_BUCKET = os.getenv("S3_BUCKET") or os.getenv("AWS_BUCKET")

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX = os.getenv("PINECONE_INDEX")

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_DATABASE = os.getenv("DB_DATABASE")