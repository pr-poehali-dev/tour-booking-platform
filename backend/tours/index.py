'''
Business: Tours catalog API with filtering and search
Args: event - dict with httpMethod, queryStringParameters
      context - object with attributes: request_id, function_name
Returns: HTTP response with tours list and metadata
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

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    
    try:
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
            FROM tours t
            WHERE {where_sql}
        '''
        cursor.execute(count_query, query_params)
        total_count = cursor.fetchone()['total']
        
        tours_query = f'''
            SELECT 
                t.*,
                u.name as guide_name,
                u.avatar_url as guide_avatar
            FROM tours t
            JOIN users u ON t.guide_id = u.id
            WHERE {where_sql}
            ORDER BY t.created_at DESC
            LIMIT %s OFFSET %s
        '''
        tours_query_params = query_params + [limit, offset]
        
        cursor.execute(tours_query, tours_query_params)
        tours = cursor.fetchall()
        
        cursor.execute('''
            SELECT DISTINCT city FROM tours WHERE status = 'active' ORDER BY city
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
    
    finally:
        conn.close()