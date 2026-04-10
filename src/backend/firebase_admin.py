import firebase_admin
from firebase_admin import credentials, db, firestore, storage
import os
import json

# Path to your service account key
SERVICE_ACCOUNT_KEY_PATH = os.path.join(
    os.path.dirname(__file__),
    '../nutrigrid-18e29-firebase-adminsdk-fbsvc-845f820d88.json'
)

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    firebase_admin.initialize_app(cred, {
        'projectId': 'nutrigrid-18e29',
    })

# Get Firebase services
db_firestore = firestore.client()
storage_bucket = storage.bucket()

def get_firestore():
    """Get Firestore client"""
    return db_firestore

def get_storage():
    """Get Storage bucket"""
    return storage_bucket
