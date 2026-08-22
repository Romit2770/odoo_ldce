# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from .common import json_response, parse_json_body

class SharingApiController(http.Controller):

    def _find_trip(self, identifier):
        domain = []
        if identifier.isdigit():
            domain = ['|', ('id', '=', int(identifier)), ('code', '=', identifier)]
        else:
            domain = [('code', '=', identifier)]
        return request.env['globetrotter.trip'].sudo().search(domain, limit=1)

    @http.route('/api/trips/<string:identifier>/share', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def create_or_get_share(self, identifier, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        trip = self._find_trip(identifier)
        if not trip:
            return json_response(success=False, error='Trip not found.', code='NOT_FOUND', status=404)

        body = parse_json_body(request)
        visibility = body.get('visibility', 'link')

        existing = request.env['globetrotter.shared_trip'].sudo().search([('trip_id', '=', trip.id), ('active', '=', True)], limit=1)
        if existing:
            if visibility != existing.visibility:
                existing.sudo().write({'visibility': visibility})
            return json_response(data=existing.to_dict(), success=True)

        user = request.env.user if request.session.uid and not request.env.user._is_public() else request.env.ref('base.user_admin')
        share_rec = request.env['globetrotter.shared_trip'].sudo().create({
            'trip_id': trip.id,
            'visibility': visibility,
            'created_by': user.id,
        })

        return json_response(data=share_rec.to_dict(), success=True, status=201)

    @http.route('/api/shared/<string:share_id>', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def get_shared_trip(self, share_id, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        share_rec = request.env['globetrotter.shared_trip'].sudo().search([('share_id', '=', share_id), ('active', '=', True)], limit=1)
        if not share_rec:
            return json_response(success=False, error='Shared trip not found or expired.', code='NOT_FOUND', status=404)

        share_rec.sudo().write({'view_count': share_rec.view_count + 1})
        return json_response(data=share_rec.to_dict(), success=True)

    @http.route('/api/shared/<string:share_id>/clone', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def clone_shared_trip(self, share_id, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        share_rec = request.env['globetrotter.shared_trip'].sudo().search([('share_id', '=', share_id), ('active', '=', True)], limit=1)
        if not share_rec:
            return json_response(success=False, error='Shared trip not found.', code='NOT_FOUND', status=404)

        user = request.env.user if request.session.uid and not request.env.user._is_public() else request.env.ref('base.user_admin')
        cloned_trip = share_rec.clone_to_user(user)

        return json_response(
            data={
                'message': f"Trip cloned successfully as '{cloned_trip.name}'",
                'trip': cloned_trip.to_dict(full=True),
                'newTripId': str(cloned_trip.id),
            },
            success=True,
            status=201
        )
