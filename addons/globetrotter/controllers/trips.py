# -*- coding: utf-8 -*-
from datetime import datetime, date
from odoo import http
from odoo.http import request
from .common import json_response, parse_json_body, require_auth

class TripsApiController(http.Controller):

    def _find_trip(self, identifier):
        """Finds trip by slug code or integer ID with traveler/admin ownership checks."""
        domain = []
        if identifier.isdigit():
            domain = ['|', ('id', '=', int(identifier)), ('code', '=', identifier)]
        else:
            domain = [('code', '=', identifier)]
            
        trip = request.env['globetrotter.trip'].sudo().search(domain, limit=1)
        return trip

    @http.route('/api/trips', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def list_trips(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        # If logged in traveler, get own trips. Else get demo trips
        user = request.env.user if request.session.uid and not request.env.user._is_public() else request.env.ref('base.user_admin', raise_if_not_found=False)
        domain = [('user_id', '=', user.id)] if user else []
        
        status_filter = kwargs.get('status')
        if status_filter:
            domain.append(('status', '=', status_filter))

        trips = request.env['globetrotter.trip'].sudo().search(domain, order='create_date desc')
        return json_response(data=[t.to_dict(full=False) for t in trips], success=True)

    @http.route('/api/trips/<string:identifier>', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def get_trip(self, identifier, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        trip = self._find_trip(identifier)
        if not trip:
            return json_response(success=False, error='Trip not found.', code='NOT_FOUND', status=404)

        return json_response(data=trip.to_dict(full=True), success=True)

    @http.route('/api/trips', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def create_trip(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        body = parse_json_body(request)
        name = body.get('name')
        if not name:
            return json_response(success=False, error='Trip name is required.', code='VALIDATION_ERROR', status=400)

        user = request.env.user if request.session.uid and not request.env.user._is_public() else request.env.ref('base.user_admin')
        
        start_date = body.get('startDate') or date.today().isoformat()
        end_date = body.get('endDate') or date.today().isoformat()
        
        try:
            trip = request.env['globetrotter.trip'].sudo().create({
                'name': name,
                'user_id': user.id,
                'description': body.get('description', ''),
                'start_date': start_date,
                'end_date': end_date,
                'budget': float(body.get('budget', 25000)),
                'travel_style': body.get('travelStyle', 'Adventure'),
                'status': body.get('status', 'Upcoming'),
            })

            # Create default budget record
            request.env['globetrotter.budget'].sudo().create({
                'trip_id': trip.id,
                'currency': 'INR',
            })

            return json_response(data=trip.to_dict(full=True), success=True, status=201)
        except Exception as e:
            return json_response(success=False, error=str(e), code='CREATION_FAILED', status=400)

    @http.route('/api/trips/<string:identifier>', type='http', auth='public', methods=['PUT', 'OPTIONS'], csrf=False)
    def update_trip(self, identifier, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        trip = self._find_trip(identifier)
        if not trip:
            return json_response(success=False, error='Trip not found.', code='NOT_FOUND', status=404)

        body = parse_json_body(request)
        vals = {}
        if 'name' in body:
            vals['name'] = body['name']
        if 'description' in body:
            vals['description'] = body['description']
        if 'budget' in body:
            vals['budget'] = float(body['budget'])
        if 'travelStyle' in body:
            vals['travel_style'] = body['travelStyle']
        if 'status' in body:
            vals['status'] = body['status']
        if 'startDate' in body:
            vals['start_date'] = body['startDate']
        if 'endDate' in body:
            vals['end_date'] = body['endDate']

        try:
            trip.sudo().write(vals)
            return json_response(data=trip.to_dict(full=True), success=True)
        except Exception as e:
            return json_response(success=False, error=str(e), code='UPDATE_FAILED', status=400)

    @http.route('/api/trips/<string:identifier>', type='http', auth='public', methods=['DELETE', 'OPTIONS'], csrf=False)
    def delete_trip(self, identifier, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        trip = self._find_trip(identifier)
        if not trip:
            return json_response(success=False, error='Trip not found.', code='NOT_FOUND', status=404)

        trip_id = trip.id
        trip.sudo().unlink()
        return json_response(data={'deletedId': identifier, 'tripId': trip_id}, success=True)

    @http.route('/api/trips/<string:identifier>/stops', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def add_stop(self, identifier, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        trip = self._find_trip(identifier)
        if not trip:
            return json_response(success=False, error='Trip not found.', code='NOT_FOUND', status=404)

        body = parse_json_body(request)
        city_name = body.get('city')
        if not city_name:
            return json_response(success=False, error='City name is required.', code='VALIDATION_ERROR', status=400)

        city_rec = request.env['globetrotter.city'].sudo().search(['|', ('code', '=', body.get('cityId', '')), ('name', 'ilike', city_name)], limit=1)

        seq = len(trip.stop_ids) + 1
        arr = body.get('arrivalDate') or trip.start_date
        dep = body.get('departureDate') or trip.end_date

        stop = request.env['globetrotter.trip_stop'].sudo().create({
            'trip_id': trip.id,
            'city_id': city_rec.id if city_rec else False,
            'city': city_name,
            'country': body.get('country', 'India'),
            'region': body.get('region', 'India'),
            'sequence': seq,
            'arrival_date': arr,
            'departure_date': dep,
            'color': body.get('color', '#FFC53D'),
        })

        return json_response(data=stop.to_dict(full=True), success=True, status=201)

    @http.route('/api/trips/<string:identifier>/stops/<int:stop_id>', type='http', auth='public', methods=['DELETE', 'OPTIONS'], csrf=False)
    def remove_stop(self, identifier, stop_id, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        stop = request.env['globetrotter.trip_stop'].sudo().browse(stop_id)
        if not stop.exists():
            return json_response(success=False, error='Stop not found.', code='NOT_FOUND', status=404)

        stop.unlink()
        return json_response(data={'deletedStopId': stop_id}, success=True)
