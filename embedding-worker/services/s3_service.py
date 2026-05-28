import boto3
from config import AWS_REGION, S3_BUCKET
from PIL import Image
import io

s3 = boto3.client("s3", region_name=AWS_REGION)


def download_image(key):
    response = s3.get_object(
        Bucket=S3_BUCKET,
        Key=key
    )

    image_bytes = response["Body"].read()

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    return image