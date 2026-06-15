import logging
import mysql.connector
from config import DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_DATABASE

logger = logging.getLogger(__name__)


def _get_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        port=int(DB_PORT),
        user=DB_USER,
        password=DB_PASS,
        database=DB_DATABASE,
    )


def update_photo_status(photo_id, status):
    """Update the analysis_status column for a given photo_id."""
    conn = None
    cursor = None
    try:
        conn = _get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE photos SET analysis_status = %s WHERE id = %s",
            (status, photo_id),
        )
        conn.commit()
        logger.info("db: photo_id=%s analysis_status set to %s", photo_id, status)
    except Exception as e:
        logger.exception("db: failed to update photo_id=%s status: %s", photo_id, e)
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
