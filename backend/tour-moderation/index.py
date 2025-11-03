import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Approve or reject tours by admin
    Args: event with tour_id, action (approve/reject), reason (optional)
    Returns: Success status
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_str = event.get('body', '{}')
    if not body_str or body_str == '':
        body_str = '{}'
    
    body_data = json.loads(body_str)
    tour_id = body_data.get('tour_id')
    action = body_data.get('action')
    reason = body_data.get('reason', '')
    
    if not tour_id or not action:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'tour_id and action are required'})
        }
    
    if action not in ['approve', 'reject']:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'action must be approve or reject'})
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
    
    if action == 'approve':
        new_status = 'active'
        instant_booking = 'true'
    else:
        new_status = 'rejected'
        instant_booking = 'false'
    
    query = f"""
        UPDATE t_p71176016_tour_booking_platfor.tours
        SET status = '{new_status}',
            instant_booking = {instant_booking},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = {tour_id}
    """
    
    cur.execute(query)
    conn.commit()
    
    cur.close()
    conn.close()
    
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