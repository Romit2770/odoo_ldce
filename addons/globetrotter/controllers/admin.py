# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from .common import json_response, parse_json_body, require_admin

class AdminApiController(http.Controller):

    @http.route('/api/admin/overview', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def admin_overview(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        total_users = request.env['res.users'].sudo().search_count([])
        total_trips = request.env['globetrotter.trip'].sudo().search_count([])
        total_cities = request.env['globetrotter.city'].sudo().search_count([('status', '=', 'active')])
        total_activities = request.env['globetrotter.activity'].sudo().search_count([('status', '=', 'active')])
        shared_count = request.env['globetrotter.shared_trip'].sudo().search_count([('active', '=', True)])

        recent_trips = request.env['globetrotter.trip'].sudo().search([], order='create_date desc', limit=5)
        popular_cities = request.env['globetrotter.city'].sudo().search([('status', '=', 'active')], order='activity_count desc', limit=4)

        return json_response(
            data={
                'stats': {
                    'totalUsers': total_users,
                    'totalTrips': total_trips,
                    'totalDestinations': total_cities,
                    'totalActivities': total_activities,
                    'sharedTripsCount': shared_count,
                    'activeItineraries': total_trips,
                },
                'recentTrips': [t.to_dict(full=False) for t in recent_trips],
                'popularDestinations': [c.to_dict() for c in popular_cities],
            },
            success=True
        )

    @http.route('/api/admin/users', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def admin_users(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        users = request.env['res.users'].sudo().search([], order='create_date desc')
        user_list = []
        for u in users:
            pref = u.globetrotter_preference_ids[:1]
            user_list.append({
                'id': u.id,
                'name': u.name,
                'email': u.login,
                'role': 'admin' if u.has_group('globetrotter.group_admin') else 'traveler',
                'tripsCount': len(u.trip_ids),
                'savedCount': len(u.saved_city_ids),
                'travelStyle': pref.travel_style if pref else 'Adventure',
                'createdAt': u.create_date.isoformat() if u.create_date else None,
            })
        return json_response(data=user_list, success=True)

    @http.route('/api/admin/trips', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def admin_trips(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        trips = request.env['globetrotter.trip'].sudo().search([], order='create_date desc')
        return json_response(data=[t.to_dict(full=False) for t in trips], success=True)

    @http.route('/api/admin/cities', type='http', auth='public', methods=['GET', 'POST', 'OPTIONS'], csrf=False)
    def admin_cities(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        if request.httprequest.method == 'GET':
            cities = request.env['globetrotter.city'].sudo().search([], order='name asc')
            return json_response(data=[c.to_dict() for c in cities], success=True)

        if request.httprequest.method == 'POST':
            body = parse_json_body(request)
            name = body.get('name')
            code = body.get('code') or name.lower().replace(' ', '-')
            if not name:
                return json_response(success=False, error='City name is required.', code='VALIDATION_ERROR', status=400)

            city = request.env['globetrotter.city'].sudo().create({
                'name': name,
                'code': code,
                'country': body.get('country', 'India'),
                'region': body.get('region', 'India'),
                'description': body.get('description', ''),
                'cost_index': body.get('costIndex', 'Balanced'),
                'popularity': body.get('popularity', 'Curated Destination'),
                'season': body.get('season', 'All year'),
                'accent': body.get('accent', 'teal'),
                'status': body.get('status', 'active'),
            })
            return json_response(data=city.to_dict(), success=True, status=201)

    @http.route('/api/admin/cities/<int:city_id>', type='http', auth='public', methods=['PUT', 'DELETE', 'OPTIONS'], csrf=False)
    def admin_city_detail(self, city_id, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        city = request.env['globetrotter.city'].sudo().browse(city_id)
        if not city.exists():
            return json_response(success=False, error='City not found.', code='NOT_FOUND', status=404)

        if request.httprequest.method == 'DELETE':
            city.unlink()
            return json_response(data={'deletedCityId': city_id}, success=True)

        body = parse_json_body(request)
        vals = {}
        for k, field_name in [('name', 'name'), ('country', 'country'), ('region', 'region'), ('description', 'description'), ('costIndex', 'cost_index'), ('season', 'season'), ('status', 'status')]:
            if k in body:
                vals[field_name] = body[k]
        city.sudo().write(vals)
        return json_response(data=city.to_dict(), success=True)

    @http.route('/api/admin/activities', type='http', auth='public', methods=['GET', 'POST', 'OPTIONS'], csrf=False)
    def admin_activities(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        if request.httprequest.method == 'GET':
            activities = request.env['globetrotter.activity'].sudo().search([], order='city_id asc, name asc')
            return json_response(data=[a.to_dict() for a in activities], success=True)

        if request.httprequest.method == 'POST':
            body = parse_json_body(request)
            name = body.get('name')
            city_id = body.get('cityDbId')
            if not name or not city_id:
                return json_response(success=False, error='Name and city are required.', code='VALIDATION_ERROR', status=400)

            act = request.env['globetrotter.activity'].sudo().create({
                'name': name,
                'city_id': int(city_id),
                'category': body.get('category', 'Sightseeing'),
                'description': body.get('description', ''),
                'duration': body.get('duration', '2h'),
                'estimated_cost': float(body.get('cost', 0.0)),
                'location': body.get('location', 'City Center'),
                'status': body.get('status', 'active'),
            })
            return json_response(data=act.to_dict(), success=True, status=201)

    @http.route('/api/admin/activities/<int:act_id>', type='http', auth='public', methods=['PUT', 'DELETE', 'OPTIONS'], csrf=False)
    def admin_activity_detail(self, act_id, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        act = request.env['globetrotter.activity'].sudo().browse(act_id)
        if not act.exists():
            return json_response(success=False, error='Activity not found.', code='NOT_FOUND', status=404)

        if request.httprequest.method == 'DELETE':
            act.unlink()
            return json_response(data={'deletedActivityId': act_id}, success=True)

        body = parse_json_body(request)
        vals = {}
        for k, field_name in [('name', 'name'), ('description', 'description'), ('category', 'category'), ('duration', 'duration'), ('location', 'location'), ('status', 'status')]:
            if k in body:
                vals[field_name] = body[k]
        if 'cost' in body:
            vals['estimated_cost'] = float(body['cost'])
        act.sudo().write(vals)
        return json_response(data=act.to_dict(), success=True)

    @http.route('/api/admin/analytics', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def admin_analytics(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        trips = request.env['globetrotter.trip'].sudo().search([])
        activities = request.env['globetrotter.trip_activity'].sudo().search([])

        # Category distribution
        categories = ['Adventure', 'Sightseeing', 'Food', 'Culture', 'Nature', 'Nightlife']
        cat_counts = {cat: 0 for cat in categories}
        for act in activities:
            if act.category in cat_counts:
                cat_counts[act.category] += 1

        total_budget_sum = sum(trips.mapped('budget'))
        total_estimated_sum = sum(trips.mapped('estimated_cost'))
        total_actual_sum = sum(trips.mapped('actual_spend'))

        return json_response(
            data={
                'financials': {
                    'totalPlannedBudget': total_budget_sum,
                    'totalEstimatedSpend': total_estimated_sum,
                    'totalActualSpend': total_actual_sum,
                    'averageTripBudget': (total_budget_sum / len(trips)) if trips else 0,
                },
                'activityDistribution': [{'category': k, 'count': v} for k, v in cat_counts.items()],
                'tripStatusCounts': {
                    'upcoming': len(trips.filtered(lambda t: t.status == 'Upcoming')),
                    'ongoing': len(trips.filtered(lambda t: t.status == 'Ongoing')),
                    'completed': len(trips.filtered(lambda t: t.status == 'Completed')),
                    'draft': len(trips.filtered(lambda t: t.status == 'Draft')),
                }
            },
            success=True
        )

    @http.route('/api/admin/audit-logs', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def admin_audit_logs(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        logs = request.env['globetrotter.audit_log'].sudo().search([], order='create_date desc', limit=50)
        return json_response(data=[l.to_dict() for l in logs], success=True)
