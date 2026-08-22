# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from .common import json_response, parse_json_body, require_auth

class AuthApiController(http.Controller):

    @http.route('/api/auth/register', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def register(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        body = parse_json_body(request)
        name = body.get('name') or body.get('displayName')
        email = body.get('email')
        password = body.get('password')

        if not name or not email or not password:
            return json_response(
                success=False,
                error='Name, email, and password are required for registration.',
                code='VALIDATION_ERROR',
                status=400
            )

        # Check existing user
        existing = request.env['res.users'].sudo().search([('login', '=', email)], limit=1)
        if existing:
            return json_response(
                success=False,
                error='An account with this email address already exists.',
                code='USER_ALREADY_EXISTS',
                status=409
            )

        # Create user
        try:
            traveler_group = request.env.ref('globetrotter.group_traveler', raise_if_not_found=False)
            groups = [(4, traveler_group.id)] if traveler_group else []
            user = request.env['res.users'].sudo().create({
                'name': name,
                'login': email,
                'email': email,
                'password': password,
                'groups_id': groups,
            })
            
            # Create default user preference
            request.env['globetrotter.user_preference'].sudo().create({
                'user_id': user.id,
                'currency': 'INR',
                'language': 'en',
                'travel_style': 'Adventure',
                'budget_preference': 'Balanced',
            })

            # Audit log
            request.env['globetrotter.audit_log'].sudo().log_event(
                action='REGISTER',
                model_name='res.users',
                record_id=user.id,
                description=f'New traveler registered: {email}',
                user_id=user.id
            )

            # Authenticate session
            request.session.authenticate(request.db, email, password)

            return json_response(
                data=user.get_traveler_profile(),
                success=True,
                status=201
            )
        except Exception as e:
            return json_response(
                success=False,
                error=str(e),
                code='REGISTRATION_FAILED',
                status=500
            )

    @http.route('/api/auth/login', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def login(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        body = parse_json_body(request)
        login = body.get('email') or body.get('login')
        password = body.get('password')

        if not login or not password:
            return json_response(
                success=False,
                error='Email and password are required.',
                code='VALIDATION_ERROR',
                status=400
            )

        try:
            uid = request.session.authenticate(request.db, login, password)
            if not uid:
                return json_response(
                    success=False,
                    error='Invalid email or password.',
                    code='INVALID_CREDENTIALS',
                    status=401
                )
            
            user = request.env['res.users'].sudo().browse(uid)
            request.env['globetrotter.audit_log'].sudo().log_event(
                action='LOGIN',
                model_name='res.users',
                record_id=user.id,
                description=f'User logged in: {login}',
                user_id=user.id
            )

            return json_response(
                data=user.get_traveler_profile(),
                success=True
            )
        except Exception as e:
            return json_response(
                success=False,
                error='Invalid credentials or authentication failure.',
                code='AUTH_ERROR',
                status=401
            )

    @http.route('/api/auth/logout', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def logout(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        try:
            if request.session.uid:
                request.env['globetrotter.audit_log'].sudo().log_event(
                    action='LOGOUT',
                    model_name='res.users',
                    record_id=request.session.uid,
                    description='User logged out',
                    user_id=request.session.uid
                )
            request.session.logout(keep_db=True)
            return json_response(data={'loggedOut': True}, success=True)
        except Exception as e:
            return json_response(data={'loggedOut': True}, success=True)

    @http.route('/api/auth/me', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def get_current_user(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        if not request.session.uid or request.env.user._is_public():
            # Return demo traveler profile for non-authenticated preview/demo state
            demo_user = request.env.ref('base.user_admin', raise_if_not_found=False)
            if demo_user:
                return json_response(data=demo_user.get_traveler_profile(), success=True)
            return json_response(
                data={
                    'id': 1,
                    'name': 'Demo Traveler',
                    'email': 'traveler@globetrotter.internal',
                    'role': 'traveler',
                    'savedDestinationsCount': 2,
                    'savedDestinationIds': ['jaipur', 'udaipur'],
                    'tripsCount': 1,
                    'preferences': {
                        'currency': 'INR',
                        'language': 'en',
                        'travelStyle': 'Adventure',
                        'budgetPreference': 'Balanced',
                    }
                },
                success=True
            )

        return json_response(data=request.env.user.get_traveler_profile(), success=True)

    @http.route('/api/auth/reset-password', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def reset_password(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        body = parse_json_body(request)
        email = body.get('email')

        if not email:
            return json_response(
                success=False,
                error='Email address is required.',
                code='VALIDATION_ERROR',
                status=400
            )

        user = request.env['res.users'].sudo().search([('login', '=', email)], limit=1)
        if user:
            request.env['globetrotter.audit_log'].sudo().log_event(
                action='PASSWORD_RESET_REQUEST',
                model_name='res.users',
                record_id=user.id,
                description=f'Password reset requested for {email}',
                user_id=user.id
            )

        # Always return success response for security (avoid user enumeration)
        return json_response(
            data={'message': 'If an account exists with this email, reset instructions have been sent.'},
            success=True
        )
