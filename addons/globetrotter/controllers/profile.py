# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from .common import json_response, parse_json_body

class ProfileApiController(http.Controller):

    @http.route('/api/profile', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def get_profile(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        user = request.env.user if request.session.uid and not request.env.user._is_public() else request.env.ref('base.user_admin')
        return json_response(data=user.get_traveler_profile(), success=True)

    @http.route('/api/profile/preferences', type='http', auth='public', methods=['PUT', 'OPTIONS'], csrf=False)
    def update_preferences(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        user = request.env.user if request.session.uid and not request.env.user._is_public() else request.env.ref('base.user_admin')
        body = parse_json_body(request)

        pref = user.globetrotter_preference_ids[:1]
        if not pref:
            pref = request.env['globetrotter.user_preference'].sudo().create({'user_id': user.id})

        vals = {}
        if 'currency' in body:
            vals['currency'] = body['currency']
        if 'language' in body:
            vals['language'] = body['language']
        if 'travelStyle' in body:
            vals['travel_style'] = body['travelStyle']
        if 'budgetPreference' in body:
            vals['budget_preference'] = body['budgetPreference']
        if 'emailNotifications' in body:
            vals['email_notifications'] = bool(body['emailNotifications'])
        if 'tripReminders' in body:
            vals['trip_reminders'] = bool(body['tripReminders'])
        if 'budgetAlerts' in body:
            vals['budget_alerts'] = bool(body['budgetAlerts'])

        pref.sudo().write(vals)
        return json_response(data=user.get_traveler_profile(), success=True)
