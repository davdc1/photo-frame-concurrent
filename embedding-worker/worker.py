import logging
import time

from services.sqs_service import receive_messages, delete_message, parse_message
from services.s3_service import download_image
from services.embedding_service import generate_embedding
from services.pinecone_service import store_embedding
from services.db_service import update_photo_status

logger = logging.getLogger(__name__)


def process_message(message):

    body = parse_message(message)

    photo_id = body["photoId"]
    user_id = body["userId"]
    s3_key = body["s3Key"]

    logger.info("sqs: processing photo_id=%s", photo_id)

    image = download_image(s3_key)

    embedding = generate_embedding(image)

    store_embedding(photo_id, user_id, embedding)

    update_photo_status(photo_id, "COMPLETED")

    delete_message(message["ReceiptHandle"])

    logger.info("sqs: completed photo_id=%s", photo_id)


def worker_loop():

    logger.info("sqs worker_loop: started")

    while True:

        messages = receive_messages()

        if not messages:
            time.sleep(2)
            continue

        for message in messages:
            try:
                process_message(message)
            except Exception as e:
                logger.exception("sqs: error processing message: %s", e)
                body = parse_message(message)
                update_photo_status(body.get("photoId"), "FAILED")


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    worker_loop()