'''
Business: Chat and notifications API for tour booking platform
Args: event - dict with httpMethod, body, queryStringParameters, headers
      context - object with attributes: request_id, function_name
Returns: HTTP response with chat messages, notifications, or operation status
'''

import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise ValueError('DATABASE_URL environment variable is not set')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    
    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'messages')
    
    conn = get_db_connection()
    
    try:
        if method == 'GET':
            if action == 'messages':
                booking_id = params.get('booking_id')
                if not booking_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'booking_id required'}),
                        'isBase64Encoded': False
                    }
                
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT cm.*, u.name as sender_name, u.avatar_url as sender_avatar
                    FROM chat_messages cm
                    JOIN users u ON cm.sender_id = u.id
                    WHERE cm.booking_id = %s
                    ORDER BY cm.created_at ASC
                ''', (booking_id,))
                messages = cursor.fetchall()
                cursor.close()
                
                result = []
                for msg in messages:
                    result.append({
                        'id': msg['id'],
                        'booking_id': msg['booking_id'],
                        'sender_id': msg['sender_id'],
                        'sender_name': msg['sender_name'],
                        'sender_avatar': msg['sender_avatar'],
                        'message': msg['message'],
                        'is_read': msg['is_read'],
                        'created_at': msg['created_at'].isoformat() if msg['created_at'] else None
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'messages': result}),
                    'isBase64Encoded': False
                }
            
            elif action == 'notifications':
                if not user_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'X-User-Id header required'}),
                        'isBase64Encoded': False
                    }
                
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT * FROM notifications
                    WHERE user_id = %s
                    ORDER BY created_at DESC
                    LIMIT 50
                ''', (user_id,))
                notifications = cursor.fetchall()
                cursor.close()
                
                result = []
                for notif in notifications:
                    result.append({
                        'id': notif['id'],
                        'type': notif['type'],
                        'title': notif['title'],
                        'message': notif['message'],
                        'link': notif['link'],
                        'is_read': notif['is_read'],
                        'created_at': notif['created_at'].isoformat() if notif['created_at'] else None
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'notifications': result}),
                    'isBase64Encoded': False
                }
            
            elif action == 'unread_count':
                if not user_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'X-User-Id header required'}),
                        'isBase64Encoded': False
                    }
                
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT COUNT(*) as count FROM notifications
                    WHERE user_id = %s AND is_read = false
                ''', (user_id,))
                result = cursor.fetchone()
                cursor.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'unread_count': result['count']}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            if action == 'send_message':
                booking_id = body_data.get('booking_id')
                sender_id = body_data.get('sender_id')
                message = body_data.get('message')
                
                if not all([booking_id, sender_id, message]):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'booking_id, sender_id, and message required'}),
                        'isBase64Encoded': False
                    }
                
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO chat_messages (booking_id, sender_id, message)
                    VALUES (%s, %s, %s)
                    RETURNING id, created_at
                ''', (booking_id, sender_id, message))
                result = cursor.fetchone()
                
                cursor.execute('''
                    SELECT guide_id, client_id FROM bookings WHERE id = %s
                ''', (booking_id,))
                booking = cursor.fetchone()
                
                receiver_id = booking['guide_id'] if int(sender_id) == booking['client_id'] else booking['client_id']
                
                cursor.execute('''
                    INSERT INTO notifications (user_id, type, title, message, link)
                    VALUES (%s, %s, %s, %s, %s)
                ''', (
                    receiver_id,
                    'message',
                    'Новое сообщение',
                    message[:100],
                    f'/booking/{booking_id}'
                ))
                
                conn.commit()
                cursor.close()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'id': result['id'],
                        'created_at': result['created_at'].isoformat() if result['created_at'] else None
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'create_notification':
                user_id_target = body_data.get('user_id')
                notif_type = body_data.get('type')
                title = body_data.get('title')
                message = body_data.get('message')
                link = body_data.get('link')
                
                if not all([user_id_target, notif_type, title, message]):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'user_id, type, title, and message required'}),
                        'isBase64Encoded': False
                    }
                
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO notifications (user_id, type, title, message, link)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id, created_at
                ''', (user_id_target, notif_type, title, message, link))
                result = cursor.fetchone()
                conn.commit()
                cursor.close()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'id': result['id'],
                        'created_at': result['created_at'].isoformat() if result['created_at'] else None
                    }),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            
            if action == 'mark_read':
                notification_id = body_data.get('notification_id')
                
                if not notification_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'notification_id required'}),
                        'isBase64Encoded': False
                    }
                
                cursor = conn.cursor()
                cursor.execute('''
                    UPDATE notifications SET is_read = true WHERE id = %s
                ''', (notification_id,))
                conn.commit()
                cursor.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            elif action == 'mark_all_read':
                if not user_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'X-User-Id header required'}),
                        'isBase64Encoded': False
                    }
                
                cursor = conn.cursor()
                cursor.execute('''
                    UPDATE notifications SET is_read = true WHERE user_id = %s
                ''', (user_id,))
                conn.commit()
                cursor.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        conn.close()
