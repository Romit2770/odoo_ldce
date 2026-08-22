# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from .common import json_response

class ActivitiesApiController(http.Controller):

    @http.route('/api/activities', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def list_activities(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        domain = [('status', '=', 'active')]
        city_param = kwargs.get('city')
        if city_param:
            city_rec = request.env['globetrotter.city'].sudo().search(['|', ('code', '=', city_param), ('name', 'ilike', city_param)], limit=1)
            if city_rec:
                domain.append(('city_id', '=', city_rec.id))

        category_param = kwargs.get('category')
        if category_param and category_param != 'All':
            domain.append(('category', '=', category_param))

        query = kwargs.get('q') or kwargs.get('search')
        if query:
            domain.append('|')
            domain.append(('name', 'ilike', query))
            domain.append(('description', 'ilike', query))

        activities = request.env['globetrotter.activity'].sudo().search(domain, order='city_id asc, name asc')
        return json_response(data=[a.to_dict() for a in activities], success=True)

    @http.route('/api/activities/<int:activity_id>', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def get_activity(self, activity_id, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        act = request.env['globetrotter.activity'].sudo().browse(activity_id)
        if not act.exists():
            return json_response(success=False, error='Activity not found.', code='NOT_FOUND', status=404)

        return json_response(data=act.to_dict(), success=True)
