import json
import os
import psycopg2
from datetime import datetime
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get tour availability by date - free slots count
    Args: event with tour_id in queryStringParameters
    Returns: dates with available slots count
    '''
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
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    params = event.get('queryStringParameters') or {}
    tour_id = params.get('tour_id')
    
    if not tour_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'tour_id is required'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database configuration missing'})
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    # Get tour max_guests (simple query protocol)
    query1 = f"SELECT max_guests FROM t_p71176016_tour_booking_platfor.tours WHERE id = {tour_id}"
    cur.execute(query1)
    tour_row = cur.fetchone()
    
    if not tour_row:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Tour not found'})
        }
    
    max_guests = tour_row[0] or 8
    
    # Get all bookings for this tour grouped by date (simple query protocol)
    query2 = f"""
        SELECT booking_date, SUM(guests_count) as total_booked
        FROM t_p71176016_tour_booking_platfor.bookings
        WHERE tour_id = {tour_id}
          AND status IN ('pending', 'confirmed')
          AND booking_date >= CURRENT_DATE
        GROUP BY booking_date
        ORDER BY booking_date
    """
    cur.execute(query2)
    
    bookings = cur.fetchall()
    cur.close()
    conn.close()
    
    # Build response with available slots
    availability = {}
    for booking_date, total_booked in bookings:
        date_str = booking_date.isoformat()
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