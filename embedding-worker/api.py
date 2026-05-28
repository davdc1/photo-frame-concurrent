import logging
import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from pydantic import BaseModel

from services.embedding_service import generate_text_embedding

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Do not load CLIP here: it can exceed Fly's HTTP health-check timeout (2s) while the
    # socket is still useless for real work. CLIP loads on first /embed-text or SQS job via
    # ensure_model_loaded() in embedding_service.
    logger.info("FastAPI lifespan: starting SQS worker thread (CLIP will load on first use)")
    from worker import worker_loop

    worker_thread = threading.Thread(target=worker_loop, daemon=True, name="sqs-worker")
    worker_thread.start()
    logger.info("FastAPI lifespan: startup complete")

    yield

    logger.info("FastAPI lifespan: shutdown")


app = FastAPI(lifespan=lifespan)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    if request.url.path == "/health":
        logger.debug("request received path=/health method=%s", request.method)
    else:
        logger.info("request received path=%s method=%s", request.url.path, request.method)
    response = await call_next(request)
    if request.url.path == "/health":
        logger.debug("response sent path=/health status=%s", response.status_code)
    else:
        logger.info(
            "response sent path=%s status=%s",
            request.url.path,
            response.status_code,
        )
    return response


class TextQuery(BaseModel):
    text: str


@app.post("/embed-text")
def embed_text(query: TextQuery):
    logger.info("embed-text: embedding generation start text_len=%s", len(query.text or ""))
    embedding = generate_text_embedding(query.text)
    logger.info("embed-text: embedding generation done dim=%s", len(embedding))
    return {"embedding": embedding}


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    logger.info("process startup: loading FastAPI app and binding uvicorn")

    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
    )
