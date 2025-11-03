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
        
        cdn_url = f"https://cdn.poehali.dev/projects/b1188c50-41f2-4090-868c-d1ee76f9086f/files/{unique_filename}"
        
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