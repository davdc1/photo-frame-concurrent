"""
Diagnostic script — tests each piece of the pipeline independently.
Run from embedding-worker/ with venv activated:
    python test_pipeline.py
"""
import json
from config import AWS_REGION, SQS_QUEUE_URL, S3_BUCKET, PINECONE_API_KEY, PINECONE_INDEX

print("=== 1. Config loaded ===")
print(f"  AWS_REGION:      {AWS_REGION}")
print(f"  SQS_QUEUE_URL:   {SQS_QUEUE_URL}")
print(f"  S3_BUCKET:       {S3_BUCKET}")
print(f"  PINECONE_API_KEY: {PINECONE_API_KEY[:10]}..." if PINECONE_API_KEY else "  PINECONE_API_KEY: MISSING!")
print(f"  PINECONE_INDEX:  {PINECONE_INDEX}")
print()

# --- Test SQS ---
print("=== 2. Testing SQS (receive) ===")
try:
    from services.sqs_service import receive_messages
    messages = receive_messages()
    print(f"  Messages in queue: {len(messages)}")
    for msg in messages:
        body = json.loads(msg["Body"])
        print(f"    -> photoId={body.get('photoId')}, userId={body.get('userId')}, s3Key={body.get('s3Key')}")
except Exception as e:
    print(f"  ERROR: {e}")
print()

# --- Test Pinecone connection ---
print("=== 3. Testing Pinecone connection ===")
try:
    from pinecone import Pinecone
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index(PINECONE_INDEX)
    stats = index.describe_index_stats()
    print(f"  Index stats: {stats}")
except Exception as e:
    print(f"  ERROR: {e}")
print()

# --- Test embedding generation ---
print("=== 4. Testing CLIP embedding (text) ===")
try:
    from services.embedding_service import generate_text_embedding
    emb = generate_text_embedding("test query")
    print(f"  Embedding length: {len(emb)}")
    print(f"  First 5 values: {emb[:5]}")
except Exception as e:
    print(f"  ERROR: {e}")
print()

# --- If there are messages, try processing one ---
if messages:
    print("=== 5. Testing full pipeline on first message ===")
    msg = messages[0]
    body = json.loads(msg["Body"])
    s3_key = body["s3Key"]
    photo_id = body["photoId"]
    user_id = body["userId"]

    print(f"  Downloading {s3_key} from S3...")
    try:
        from services.s3_service import download_image
        image = download_image(s3_key)
        print(f"  Image downloaded: {image.size}")
    except Exception as e:
        print(f"  S3 download ERROR: {e}")
        image = None

    if image:
        print(f"  Generating embedding...")
        try:
            from services.embedding_service import generate_embedding
            embedding = generate_embedding(image)
            print(f"  Embedding generated: {len(embedding)} dims")
        except Exception as e:
            print(f"  Embedding ERROR: {e}")
            embedding = None

        if embedding:
            print(f"  Storing in Pinecone (photo_{photo_id})...")
            try:
                from services.pinecone_service import store_embedding
                store_embedding(photo_id, user_id, embedding)
                print(f"  SUCCESS! Stored photo_{photo_id} in Pinecone")
            except Exception as e:
                print(f"  Pinecone store ERROR: {e}")

            print(f"  Deleting SQS message...")
            try:
                from services.sqs_service import delete_message
                delete_message(msg["ReceiptHandle"])
                print(f"  SQS message deleted")
            except Exception as e:
                print(f"  SQS delete ERROR: {e}")
else:
    print("=== 5. No messages in queue — upload a photo first, then re-run ===")

print()
print("=== DONE ===")
