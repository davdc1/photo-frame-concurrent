import logging
import threading

from pinecone import Pinecone

from config import PINECONE_API_KEY, PINECONE_INDEX

logger = logging.getLogger(__name__)

_lock = threading.Lock()
_index = None


def _get_index():
    global _index
    with _lock:
        if _index is None:
            if not PINECONE_API_KEY or not PINECONE_INDEX:
                raise RuntimeError(
                    "PINECONE_API_KEY and PINECONE_INDEX must be set for embedding storage"
                )
            logger.info("pinecone: initializing client and index %s", PINECONE_INDEX)
            pc = Pinecone(api_key=PINECONE_API_KEY)
            _index = pc.Index(PINECONE_INDEX)
        return _index


def store_embedding(photo_id, user_id, embedding):

    index = _get_index()

    index.upsert(
        vectors=[
            {
                "id": f"photo_{photo_id}",
                "values": embedding,
                "metadata": {
                    "photo_id": photo_id,
                    "user_id": user_id
                }
            }
        ]
    )
