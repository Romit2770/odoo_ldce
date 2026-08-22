# -*- coding: utf-8 -*-
import json
import logging
from odoo.http import Response
from odoo.exceptions import AccessError, ValidationError, UserError

_logger = logging.getLogger(__name__)

def json_response(data=None, success=True, error=None, code=None, status=200):
    """Produces a clean, standardized JSON response envelope."""
    payload = {
        'success': success,
        'data': data if success else None,
        'error': {
            'message': error or 'An unexpected error occurred.',
            'code': code or ('SUCCESS' if success else 'SERVER_ERROR'),
        } if not success else None
    }
    return Response(
        json.dumps(payload),
        status=status,
        headers=[
            ('Content-Type', 'application/json'),
            ('Access-Control-Allow-Origin', '*'),
            ('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'),
            ('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With'),
        ]
    )

def parse_json_body(request):
    """Extracts and decodes JSON from request body."""
    try:
        if request.httprequest.data:
            return json.loads(request.httprequest.data.decode('utf-8'))
        return {}
    except Exception as e:
        _logger.warning('Failed to parse JSON body: %s', e)
        return {}

def require_auth(request):
    """Verifies that the session user is authenticated and not public."""
    if not request.session.uid or request.env.user._is_public():
        return False, json_response(
            success=False,
            error='Authentication required to access this resource.',
            code='UNAUTHORIZED',
            status=401
        )
    return True, None

def require_admin(request):
    """Verifies that the session user is a GlobeTrotter administrator."""
    is_authed, err_resp = require_auth(request)
    if not is_authed:
        return False, err_resp
    
    if not request.env.user.has_group('globetrotter.group_admin'):
        return False, json_response(
            success=False,
            error='Administrator privileges required.',
            code='FORBIDDEN',
            status=403
        )
    return True, None
