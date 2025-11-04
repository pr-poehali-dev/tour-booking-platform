'''
Business: User authentication and profile management
Args: event with httpMethod, body (action, user data), queryStringParameters
Returns: HTTP response with user data or error
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib
from typing import Dict, Any

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

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
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            user_id = event.get('queryStringParameters', {}).get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute("""
                SELECT 
                    id, name, email, role, avatar_url, telegram, phone,
                    bio, languages, city, experience_years, specialization,
                    interests, email_notifications, telegram_notifications,
                    created_at
                FROM t_p71176016_tour_booking_platfor.users
                WHERE id = %s
            """, (int(user_id),))
            
            user = cursor.fetchone()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(user), default=str),
                'isBase64Encoded': False
            }
        
        if method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id required'}),
                    'isBase64Encoded': False
                }
            
            update_fields = []
            values = []
            
            field_mapping = {
                'name': 'name',
                'email': 'email',
                'avatar_url': 'avatar_url',
                'phone': 'phone',
                'telegram': 'telegram',
                'city': 'city',
                'bio': 'bio',
                'languages': 'languages',
                'specialization': 'specialization',
                'interests': 'interests'
            }
            
            for field_name, db_column in field_mapping.items():
                if field_name in body_data:
                    update_fields.append(f'{db_column} = %s')
                    values.append(body_data[field_name])
            
            if 'experience_years' in body_data:
                update_fields.append('experience_years = %s')
                values.append(int(body_data['experience_years']))
            
            if 'email_notifications' in body_data:
                update_fields.append('email_notifications = %s')
                values.append(body_data['email_notifications'])
            
            if 'telegram_notifications' in body_data:
                update_fields.append('telegram_notifications = %s')
                values.append(body_data['telegram_notifications'])
            
            if not update_fields:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'No fields to update'}),
                    'isBase64Encoded': False
                }
            
            values.append(int(user_id))
            query = f"""
                UPDATE t_p71176016_tour_booking_platfor.users
                SET {', '.join(update_fields)}
                WHERE id = %s
                RETURNING id
            """
            
            cursor.execute(query, values)
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'Profile updated'}),
                'isBase64Encoded': False
            }
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action', 'register')
            
            if action == 'register':
                name = body_data.get('name', '').strip()
                email = body_data.get('email', '').strip().lower()
                password = body_data.get('password', '')
                role = body_data.get('role', 'client')
                phone = body_data.get('phone', '')
                bio = body_data.get('bio', '')
                languages = body_data.get('languages', '')
                
                if not name or not email or not password:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Name, email and password are required'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    "SELECT id FROM t_p71176016_tour_booking_platfor.users WHERE email = %s",
                    (email,)
                )
                existing = cursor.fetchone()
                
                if existing:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Email already registered'}),
                        'isBase64Encoded': False
                    }
                
                password_hash = hash_password(password)
                
                cursor.execute(
                    """INSERT INTO t_p71176016_tour_booking_platfor.users 
                    (name, email, password_hash, role, phone, bio, languages) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s) 
                    RETURNING id, name, email, role""",
                    (name, email, password_hash, role, phone, bio, languages)
                )
                user = cursor.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'user': dict(user)
                    })
                }
            
            elif action == 'login':
                email = body_data.get('email', '').strip().lower()
                password = body_data.get('password', '')
                
                if not email or not password:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Email and password are required'}),
                        'isBase64Encoded': False
                    }
                
                password_hash = hash_password(password)
                
                cursor.execute(
                    """SELECT id, name, email, role FROM t_p71176016_tour_booking_platfor.users 
                    WHERE email = %s AND password_hash = %s""",
                    (email, password_hash)
                )
                user = cursor.fetchone()
                
                if not user:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid credentials'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'user': dict(user)
                    })
                }
            
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid action'}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()
