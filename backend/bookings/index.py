'''
Business: Bookings management API for tour booking platform
Args: event - dict with httpMethod, body, queryStringParameters, headers
      context - object with attributes: request_id, function_name
Returns: HTTP response with booking data or operation status
'''

import json
import os
from typing import Dict, Any
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
    
    conn = get_db_connection()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            action = params.get('action', 'list')
            
            if action == 'tour_dates':
                tour_id = params.get('tour_id')
                if not tour_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'tour_id required'}),
                        'isBase64Encoded': False
                    }
                
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT date, available_slots 
                    FROM tour_dates 
                    WHERE tour_id = %s AND date >= CURRENT_DATE
                    ORDER BY date ASC
                ''', (tour_id,))
                dates = cursor.fetchall()
                cursor.close()
                
                result = [{'date': d['date'].isoformat(), 'available_slots': d['available_slots']} for d in dates]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'dates': result}),
                    'isBase64Encoded': False
                }
            
            elif action == 'user_bookings':
                headers = event.get('headers', {})
                user_id = headers.get('X-User-Id') or headers.get('x-user-id')
                
                if not user_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'X-User-Id header required'}),
                        'isBase64Encoded': False
                    }
                
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT b.*, t.title as tour_title, t.city, t.image_url,
                           g.name as guide_name, g.avatar_url as guide_avatar
                    FROM bookings b
                    JOIN tours t ON b.tour_id = t.id
                    JOIN users g ON b.guide_id = g.id
                    WHERE b.client_id = %s
                    ORDER BY b.booking_date DESC
                ''', (user_id,))
                bookings = cursor.fetchall()
                cursor.close()
                
                result = []
                for booking in bookings:
                    result.append({
                        'id': booking['id'],
                        'tour_id': booking['tour_id'],
                        'tour_title': booking['tour_title'],
                        'city': booking['city'],
                        'image_url': booking['image_url'],
                        'guide_name': booking['guide_name'],
                        'guide_avatar': booking['guide_avatar'],
                        'booking_date': booking['booking_date'].isoformat() if booking['booking_date'] else None,
                        'guests_count': booking['guests_count'],
                        'total_price': float(booking['total_price']),
                        'status': booking['status'],
                        'created_at': booking['created_at'].isoformat() if booking['created_at'] else None
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'bookings': result}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            tour_id = body_data.get('tour_id')
            client_id = body_data.get('client_id')
            booking_date = body_data.get('booking_date')
            guests_count = body_data.get('guests_count', 1)
            client_name = body_data.get('client_name')
            client_telegram = body_data.get('client_telegram')
            
            if not all([tour_id, client_id, booking_date, client_name]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'tour_id, client_id, booking_date, and client_name required'}),
                    'isBase64Encoded': False
                }
            
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT guide_id, price, instant_booking FROM tours WHERE id = %s
            ''', (tour_id,))
            tour = cursor.fetchone()
            
            if not tour:
                cursor.close()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Tour not found'}),
                    'isBase64Encoded': False
                }
            
            total_price = float(tour['price']) * guests_count
            status = 'confirmed' if tour['instant_booking'] else 'pending'
            
            cursor.execute('''
                INSERT INTO bookings (
                    tour_id, client_id, guide_id, booking_date, 
                    guests_count, total_price, status, client_name, client_telegram
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, created_at
            ''', (
                tour_id, client_id, tour['guide_id'], booking_date,
                guests_count, total_price, status, client_name, client_telegram
            ))
            result = cursor.fetchone()
            booking_id = result['id']
            
            cursor.execute('''
                INSERT INTO notifications (user_id, type, title, message, link)
                VALUES (%s, %s, %s, %s, %s)
            ''', (
                tour['guide_id'],
                'booking',
                'Новое бронирование' if status == 'pending' else 'Подтверждено бронирование',
                f'{client_name} забронировал тур на {booking_date}',
                '/guide'
            ))
            
            cursor.execute('''
                INSERT INTO notifications (user_id, type, title, message, link)
                VALUES (%s, %s, %s, %s, %s)
            ''', (
                client_id,
                'booking',
                'Бронирование создано',
                f'Ваше бронирование {"подтверждено" if status == "confirmed" else "ожидает подтверждения"}',
                '/client'
            ))
            
            conn.commit()
            cursor.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'id': booking_id,
                    'status': status,
                    'total_price': total_price,
                    'created_at': result['created_at'].isoformat() if result['created_at'] else None
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            
            booking_id = body_data.get('booking_id')
            action = body_data.get('action')
            
            if not all([booking_id, action]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'booking_id and action required'}),
                    'isBase64Encoded': False
                }
            
            cursor = conn.cursor()
            
            if action == 'confirm':
                cursor.execute('''
                    UPDATE bookings SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING client_id
                ''', (booking_id,))
                result = cursor.fetchone()
                
                if result:
                    cursor.execute('''
                        INSERT INTO notifications (user_id, type, title, message, link)
                        VALUES (%s, %s, %s, %s, %s)
                    ''', (
                        result['client_id'],
                        'booking',
                        'Бронирование подтверждено',
                        'Гид подтвердил ваше бронирование',
                        '/client'
                    ))
                
            elif action == 'cancel':
                cursor.execute('''
                    UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING client_id
                ''', (booking_id,))
                result = cursor.fetchone()
                
                if result:
                    cursor.execute('''
                        INSERT INTO notifications (user_id, type, title, message, link)
                        VALUES (%s, %s, %s, %s, %s)
                    ''', (
                        result['client_id'],
                        'booking',
                        'Бронирование отменено',
                        'Гид отменил ваше бронирование',
                        '/client'
                    ))
            
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
