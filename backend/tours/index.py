'''
Business: Tours API - catalog, availability, moderation
Args: event - dict with httpMethod, queryStringParameters, body
      context - object with attributes: request_id, function_name
Returns: HTTP response with tours data or operation result
'''

import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise ValueError('DATABASE_URL environment variable is not set')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handle_catalog(event: Dict[str, Any], conn) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    
    city = params.get('city')
    min_price = params.get('min_price')
    max_price = params.get('max_price')
    search = params.get('search')
    limit = int(params.get('limit', '50'))
    offset = int(params.get('offset', '0'))
    
    where_clauses = ["t.status = 'active'"]
    query_params: List[Any] = []
    
    if city:
        where_clauses.append('t.city = %s')
        query_params.append(city)
    
    if min_price:
        where_clauses.append('t.price >= %s')
        query_params.append(float(min_price))
    
    if max_price:
        where_clauses.append('t.price <= %s')
        query_params.append(float(max_price))
    
    if search:
        where_clauses.append('(t.title ILIKE %s OR t.short_description ILIKE %s)')
        query_params.append(f'%{search}%')
        query_params.append(f'%{search}%')
    
    where_sql = ' AND '.join(where_clauses)
    
    cursor = conn.cursor()
    
    count_query = f'''
        SELECT COUNT(*) as total
        FROM t_p71176016_tour_booking_platfor.tours t
        WHERE {where_sql}
    '''
    cursor.execute(count_query, query_params)
    total_count = cursor.fetchone()['total']
    
    tours_query = f'''
        SELECT 
            t.*,
            u.name as guide_name,
            u.avatar_url as guide_avatar
        FROM t_p71176016_tour_booking_platfor.tours t
        JOIN t_p71176016_tour_booking_platfor.users u ON t.guide_id = u.id
        WHERE {where_sql}
        ORDER BY t.created_at DESC
        LIMIT %s OFFSET %s
    '''
    tours_query_params = query_params + [limit, offset]
    
    cursor.execute(tours_query, tours_query_params)
    tours = cursor.fetchall()
    
    cursor.execute('''
        SELECT DISTINCT city FROM t_p71176016_tour_booking_platfor.tours WHERE status = 'active' ORDER BY city
    ''')
    cities = [row['city'] for row in cursor.fetchall()]
    
    cursor.close()
    
    result = []
    for tour in tours:
        result.append({
            'id': tour['id'],
            'title': tour['title'],
            'city': tour['city'],
            'price': float(tour['price']),
            'duration': tour['duration'],
            'short_description': tour['short_description'],
            'full_description': tour['full_description'],
            'image_url': tour['image_url'],
            'rating': float(tour['rating']) if tour['rating'] else 0,
            'reviews_count': tour['reviews_count'],
            'guide_name': tour['guide_name'],
            'guide_avatar': tour['guide_avatar'],
            'instant_booking': tour['instant_booking']
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'tours': result,
            'total': total_count,
            'cities': cities,
            'limit': limit,
            'offset': offset
        }),
        'isBase64Encoded': False
    }

def handle_availability(event: Dict[str, Any], conn) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    tour_id = params.get('tour_id')
    
    if not tour_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'tour_id is required'}),
            'isBase64Encoded': False
        }
    
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT max_guests FROM t_p71176016_tour_booking_platfor.tours WHERE id = %s",
        (tour_id,)
    )
    tour_row = cursor.fetchone()
    
    if not tour_row:
        cursor.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Tour not found'}),
            'isBase64Encoded': False
        }
    
    max_guests = tour_row['max_guests'] or 8
    
    cursor.execute(
        """SELECT booking_date, SUM(guests_count) as total_booked
        FROM t_p71176016_tour_booking_platfor.bookings
        WHERE tour_id = %s
          AND status IN ('pending', 'confirmed')
          AND booking_date >= CURRENT_DATE
        GROUP BY booking_date
        ORDER BY booking_date""",
        (tour_id,)
    )
    
    bookings = cursor.fetchall()
    cursor.close()
    
    availability = {}
    for row in bookings:
        date_str = row['booking_date'].isoformat()
        total_booked = row['total_booked']
        available = max_guests - total_booked
        availability[date_str] = max(0, available)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'tour_id': int(tour_id),
            'max_guests': max_guests,
            'availability': availability
        })
    }

def handle_create_tour(event: Dict[str, Any], conn) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    
    required_fields = ['title', 'city', 'price', 'duration', 'short_description', 'full_description']
    for field in required_fields:
        if not body_data.get(field):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'{field} is required'}),
                'isBase64Encoded': False
            }
    
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO t_p71176016_tour_booking_platfor.tours (
            title, city, country, price, duration, 
            short_description, full_description, 
            image_url, guide_id, status, instant_booking,
            rating, reviews_count, max_guests
        ) VALUES (
            %s, %s, %s, %s, %s, 
            %s, %s, 
            %s, 1, 'pending', %s,
            0, 0, 10
        ) RETURNING id
    """, (
        body_data['title'],
        body_data['city'],
        body_data.get('country', ''),
        float(body_data['price']),
        int(body_data['duration']),
        body_data['short_description'],
        body_data['full_description'],
        body_data.get('image_url', ''),
        body_data.get('instant_booking', False)
    ))
    
    tour_id = cursor.fetchone()['id']
    conn.commit()
    cursor.close()
    
    return {
        'statusCode': 201,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'tour_id': tour_id,
            'message': 'Tour created successfully'
        })
    }

def handle_moderation(event: Dict[str, Any], conn) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    tour_id = body_data.get('tour_id')
    action = body_data.get('action')
    
    if not tour_id or not action:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'tour_id and action are required'}),
            'isBase64Encoded': False
        }
    
    if action not in ['approve', 'reject']:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'action must be approve or reject'}),
            'isBase64Encoded': False
        }
    
    cursor = conn.cursor()
    
    if action == 'approve':
        new_status = 'active'
        instant_booking = True
    else:
        new_status = 'rejected'
        instant_booking = False
    
    cursor.execute(
        """UPDATE t_p71176016_tour_booking_platfor.tours
        SET status = %s,
            instant_booking = %s,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = %s""",
        (new_status, instant_booking, tour_id)
    )
    conn.commit()
    cursor.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'tour_id': tour_id,
            'action': action,
            'new_status': new_status
        })
    }

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    
    try:
        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'catalog')
        
        if method == 'GET':
            if action == 'availability':
                return handle_availability(event, conn)
            else:
                return handle_catalog(event, conn)
        
        elif method == 'POST':
            if action == 'moderate':
                return handle_moderation(event, conn)
            else:
                return handle_create_tour(event, conn)
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        conn.close()