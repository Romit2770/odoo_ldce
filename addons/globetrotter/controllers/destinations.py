# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from .common import json_response, parse_json_body

class DestinationsApiController(http.Controller):

    @http.route('/api/destinations', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def list_destinations(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        domain = [('status', '=', 'active')]
        query = kwargs.get('q') or kwargs.get('search')
        if query:
            domain.append('|')
            domain.append(('name', 'ilike', query))
            domain.append(('description', 'ilike', query))

        cities = request.env['globetrotter.city'].sudo().search(domain, order='name asc')
        return json_response(data=[c.to_dict() for c in cities], success=True)

    @http.route('/api/destinations/<string:identifier>', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def get_destination(self, identifier, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        domain = ['|', ('code', '=', identifier), ('id', '=', int(identifier) if identifier.isdigit() else 0)]
        city = request.env['globetrotter.city'].sudo().search(domain, limit=1)
        if not city:
            return json_response(success=False, error='Destination city not found.', code='NOT_FOUND', status=404)

        data = city.to_dict()
        data['activities'] = [a.to_dict() for a in city.activity_ids]
        return json_response(data=data, success=True)

    @http.route('/api/destinations/<string:identifier>/toggle-save', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def toggle_save_destination(self, identifier, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        domain = ['|', ('code', '=', identifier), ('id', '=', int(identifier) if identifier.isdigit() else 0)]
        city = request.env['globetrotter.city'].sudo().search(domain, limit=1)
        if not city:
            return json_response(success=False, error='Destination city not found.', code='NOT_FOUND', status=404)

        user = request.env.user if request.session.uid and not request.env.user._is_public() else request.env.ref('base.user_admin')
        
        is_saved = city.id in user.saved_city_ids.ids
        if is_saved:
            user.sudo().write({'saved_city_ids': [(3, city.id)]})
            saved_now = False
        else:
            user.sudo().write({'saved_city_ids': [(4, city.id)]})
            saved_now = True

        return json_response(
            data={
                'cityId': city.code or str(city.id),
                'saved': saved_now,
                'savedDestinationIds': [c.code or str(c.id) for c in user.saved_city_ids],
                'savedCount': len(user.saved_city_ids),
            },
            success=True
        )

    @http.route('/api/destinations/saved', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def get_saved_destinations(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        user = request.env.user if request.session.uid and not request.env.user._is_public() else request.env.ref('base.user_admin')
        return json_response(data=[c.to_dict() for c in user.saved_city_ids], success=True)
