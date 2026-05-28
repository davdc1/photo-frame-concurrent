import logging
import threading

import torch
from transformers import CLIPProcessor, CLIPModel

logger = logging.getLogger(__name__)

_load_lock = threading.Lock()
_inference_lock = threading.Lock()
_model = None
_processor = None


def ensure_model_loaded():
    global _model, _processor
    with _load_lock:
        if _model is None:
            logger.info("CLIP model load starting (openai/clip-vit-base-patch32)")
            _model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
            _processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
            logger.info("CLIP model load complete")
    return _model, _processor


def generate_embedding(image):
    model, processor = ensure_model_loaded()

    inputs = processor(images=image, return_tensors="pt")

    with _inference_lock:
        with torch.no_grad():
            outputs = model.vision_model(**inputs)
            image_features = model.visual_projection(outputs.pooler_output)

    embedding = image_features.squeeze(0)

    embedding = embedding / embedding.norm()

    return embedding.tolist()


def generate_text_embedding(text):
    model, processor = ensure_model_loaded()

    inputs = processor(text=[text], return_tensors="pt", padding=True)

    with _inference_lock:
        with torch.no_grad():
            outputs = model.text_model(**inputs)
            text_features = model.text_projection(outputs.pooler_output)

    embedding = text_features.squeeze(0)

    embedding = embedding / embedding.norm()

    return embedding.tolist()
