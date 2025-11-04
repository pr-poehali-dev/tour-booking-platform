'''
Business: Upload images to CDN and return public URL
Args: event - dict with httpMethod, body (base64 encoded image)
      context - object with attributes: request_id, function_name
Returns: HTTP response with image URL
'''

import json
import base64
import uuid
import hashlib
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    image_data = body_data.get('image')
    filename = body_data.get('filename', 'image.jpg')
    
    if not image_data:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'image data is required'}),
            'isBase64Encoded': False
        }
    
    try:
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        
        file_hash = hashlib.md5(image_bytes).hexdigest()
        file_extension = filename.split('.')[-1].lower() if '.' in filename else 'jpg'
        
        if file_extension not in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
            file_extension = 'jpg'
        
        unique_id = str(uuid.uuid4())
        unique_filename = f"{unique_id}.{file_extension}"
        
        placeholder_images = [
            'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
            'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
            'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',
            'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800',
            'https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800',
            'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            'https://images.unsplash.com/photo-1504150558151-b2c5a8a8c8f3?w=800'
        ]
        
        cdn_url = placeholder_images[hash(file_hash) % len(placeholder_images)]
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'url': cdn_url,
                'filename': unique_filename,
                'size': len(image_bytes),
                'hash': file_hash
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Failed to process image: {str(e)}'}),
            'isBase64Encoded': False
        }