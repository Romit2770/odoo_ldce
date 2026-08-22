# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from .common import json_response, parse_json_body

class ItineraryApiController(http.Controller):

    def _find_trip(self, identifier):
        domain = []
        if identifier.isdigit():
            domain = ['|', ('id', '=', int(identifier)), ('code', '=', identifier)]
        else:
            domain = [('code', '=', identifier)]
        return request.env['globetrotter.trip'].sudo().search(domain, limit=1)

    @http.route('/api/trips/<string:identifier>/itinerary', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def get_itinerary(self, identifier, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        trip = self._find_trip(identifier)
        if not trip:
            return json_response(success=False, error='Trip not found.', code='NOT_FOUND', status=404)

        stops = [s.to_dict(full=True) for s in trip.stop_ids]
        return json_response(data={'tripId': trip.id, 'stops': stops}, success=True)

    @http.route('/api/trips/<string:identifier>/activities', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def add_activity(self, identifier, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        trip = self._find_trip(identifier)
        if not trip:
            return json_response(success=False, error='Trip not found.', code='NOT_FOUND', status=404)

        body = parse_json_body(request)
        day_id_param = body.get('dayId')
        stop_id_param = body.get('stopId')
        
        # Locate target day
        target_day = None
        if day_id_param and str(day_id_param).isdigit():
            target_day = request.env['globetrotter.itinerary_day'].sudo().browse(int(day_id_param))
        elif stop_id_param and str(stop_id_param).isdigit():
            stop = request.env['globetrotter.trip_stop'].sudo().browse(int(stop_id_param))
            target_day = stop.day_ids[:1] if stop.exists() else None
        else:
            # Fallback to first day of trip
            target_day = trip.itinerary_day_ids[:1]

        if not target_day or not target_day.exists():
            # Create a default day if none exists
            stop = trip.stop_ids[:1]
            if not stop:
                stop = request.env['globetrotter.trip_stop'].sudo().create({
                    'trip_id': trip.id,
                    'city': 'Goa',
                    'arrival_date': trip.start_date,
                    'departure_date': trip.end_date,
                })
            target_day = request.env['globetrotter.itinerary_day'].sudo().create({
                'trip_id': trip.id,
                'trip_stop_id': stop.id,
                'day_number': 1,
                'date': trip.start_date,
            })

        catalog_id = body.get('catalogActivityId') or body.get('activityId')
        cat_rec = None
        if catalog_id and str(catalog_id).isdigit():
            cat_rec = request.env['globetrotter.activity'].sudo().browse(int(catalog_id))

        seq = len(target_day.activity_ids) + 1
        new_act = request.env['globetrotter.trip_activity'].sudo().create({
            'trip_id': trip.id,
            'itinerary_day_id': target_day.id,
            'activity_id': cat_rec.id if cat_rec and cat_rec.exists() else False,
            'name': body.get('name') or (cat_rec.name if cat_rec else 'New Activity'),
            'start_time': body.get('time', '14:00'),
            'duration': body.get('duration') or (cat_rec.duration if cat_rec else '2h'),
            'cost': float(body.get('cost', cat_rec.estimated_cost if cat_rec else 0.0)),
            'category': body.get('category') or (cat_rec.category if cat_rec else 'Sightseeing'),
            'location': body.get('location') or (cat_rec.location if cat_rec else 'City Area'),
            'description': body.get('description') or (cat_rec.description if cat_rec else ''),
            'sequence': seq,
        })

        return json_response(data=new_act.to_dict(), success=True, status=201)

    @http.route('/api/trip-activities/<int:act_id>', type='http', auth='public', methods=['PUT', 'OPTIONS'], csrf=False)
    def update_activity(self, act_id, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        act = request.env['globetrotter.trip_activity'].sudo().browse(act_id)
        if not act.exists():
            return json_response(success=False, error='Scheduled activity not found.', code='NOT_FOUND', status=404)

        body = parse_json_body(request)
        vals = {}
        if 'name' in body:
            vals['name'] = body['name']
        if 'time' in body:
            vals['start_time'] = body['time']
        if 'duration' in body:
            vals['duration'] = body['duration']
        if 'cost' in body:
            vals['cost'] = float(body['cost'])
        if 'location' in body:
            vals['location'] = body['location']
        if 'description' in body:
            vals['description'] = body['description']
        if 'category' in body:
            vals['category'] = body['category']
        if 'sequence' in body:
            vals['sequence'] = int(body['sequence'])

        act.sudo().write(vals)
        return json_response(data=act.to_dict(), success=True)

    @http.route('/api/trip-activities/<int:act_id>', type='http', auth='public', methods=['DELETE', 'OPTIONS'], csrf=False)
    def delete_activity(self, act_id, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        act = request.env['globetrotter.trip_activity'].sudo().browse(act_id)
        if not act.exists():
            return json_response(success=False, error='Scheduled activity not found.', code='NOT_FOUND', status=404)

        day_id = str(act.itinerary_day_id.id)
        act.unlink()
        return json_response(data={'deletedActivityId': str(act_id), 'dayId': day_id}, success=True)

    @http.route('/api/trip-activities/<int:act_id>/duplicate', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def duplicate_activity(self, act_id, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        act = request.env['globetrotter.trip_activity'].sudo().browse(act_id)
        if not act.exists():
            return json_response(success=False, error='Scheduled activity not found.', code='NOT_FOUND', status=404)

        clone = request.env['globetrotter.trip_activity'].sudo().create({
            'trip_id': act.trip_id.id,
            'itinerary_day_id': act.itinerary_day_id.id,
            'activity_id': act.activity_id.id if act.activity_id else False,
            'name': f"{act.name} (copy)",
            'start_time': act.start_time,
            'duration': act.duration,
            'cost': act.cost,
            'currency': act.currency,
            'category': act.category,
            'location': act.location,
            'description': act.description,
            'sequence': act.sequence + 1,
        })

        return json_response(data=clone.to_dict(), success=True, status=201)

    @http.route('/api/trip-activities/<int:act_id>/move', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def move_activity(self, act_id, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        act = request.env['globetrotter.trip_activity'].sudo().browse(act_id)
        if not act.exists():
            return json_response(success=False, error='Scheduled activity not found.', code='NOT_FOUND', status=404)

        body = parse_json_body(request)
        target_day_id = body.get('targetDayId')
        target_index = body.get('targetIndex', 0)

        if not target_day_id or not str(target_day_id).isdigit():
            return json_response(success=False, error='Target Day ID is required.', code='VALIDATION_ERROR', status=400)

        target_day = request.env['globetrotter.itinerary_day'].sudo().browse(int(target_day_id))
        if not target_day.exists() or target_day.trip_id != act.trip_id:
            return json_response(success=False, error='Invalid target day in trip.', code='VALIDATION_ERROR', status=400)

        act.sudo().write({
            'itinerary_day_id': target_day.id,
            'sequence': (target_index + 1) * 10,
        })

        return json_response(data=act.to_dict(), success=True)
