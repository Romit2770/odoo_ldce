# -*- coding: utf-8 -*-
import uuid
from odoo import models, fields, api

class SharedTrip(models.Model):
    _name = 'globetrotter.shared_trip'
    _description = 'GlobeTrotter Shared Trip Token'
    _order = 'create_date desc'

    trip_id = fields.Many2one('globetrotter.trip', string='Trip', required=True, ondelete='cascade', index=True)
    share_id = fields.Char('Unique Share Code / Hash', required=True, index=True, default=lambda self: uuid.uuid4().hex[:12])
    visibility = fields.Selection([
        ('private', 'Private (Only Me)'),
        ('link', 'Anyone with the Link'),
        ('public', 'Public on GlobeTrotter Discover'),
    ], string='Visibility', default='link', required=True)
    
    created_by = fields.Many2one('res.users', string='Shared By', default=lambda self: self.env.user, required=True)
    active = fields.Boolean('Is Active', default=True)
    clone_count = fields.Integer('Cloned Count', default=0)
    view_count = fields.Integer('Views Count', default=0)

    _sql_constraints = [
        ('share_id_uniq', 'unique(share_id)', 'Share code must be unique.')
    ]

    def clone_to_user(self, target_user):
        """Clones this shared trip structure to a target user."""
        self.ensure_one()
        source_trip = self.trip_id
        new_trip = self.env['globetrotter.trip'].sudo().create({
            'name': f"{source_trip.name} (My Copy)",
            'user_id': target_user.id,
            'description': source_trip.description,
            'start_date': source_trip.start_date,
            'end_date': source_trip.end_date,
            'budget': source_trip.budget,
            'travel_style': source_trip.travel_style,
            'cover_image': source_trip.cover_image,
            'base_transport_cost': source_trip.base_transport_cost,
            'base_accommodation_cost': source_trip.base_accommodation_cost,
            'base_food_cost': source_trip.base_food_cost,
            'base_misc_cost': source_trip.base_misc_cost,
        })
        
        # Clone stops, days, activities
        for stop in source_trip.stop_ids:
            new_stop = self.env['globetrotter.trip_stop'].sudo().create({
                'trip_id': new_trip.id,
                'city_id': stop.city_id.id if stop.city_id else False,
                'city': stop.city,
                'country': stop.country,
                'region': stop.region,
                'sequence': stop.sequence,
                'arrival_date': stop.arrival_date,
                'departure_date': stop.departure_date,
                'color': stop.color,
                'notes': stop.notes,
            })
            for day in stop.day_ids:
                new_day = self.env['globetrotter.itinerary_day'].sudo().create({
                    'trip_id': new_trip.id,
                    'trip_stop_id': new_stop.id,
                    'day_number': day.day_number,
                    'date': day.date,
                    'notes': day.notes,
                })
                for act in day.activity_ids:
                    self.env['globetrotter.trip_activity'].sudo().create({
                        'trip_id': new_trip.id,
                        'itinerary_day_id': new_day.id,
                        'activity_id': act.activity_id.id if act.activity_id else False,
                        'name': act.name,
                        'start_time': act.start_time,
                        'duration': act.duration,
                        'cost': act.cost,
                        'currency': act.currency,
                        'category': act.category,
                        'location': act.location,
                        'description': act.description,
                        'sequence': act.sequence,
                    })

        self.sudo().write({'clone_count': self.clone_count + 1})
        return new_trip

    def to_dict(self):
        self.ensure_one()
        return {
            'id': str(self.id),
            'shareId': self.share_id,
            'tripId': self.trip_id.code or str(self.trip_id.id),
            'tripName': self.trip_id.name,
            'visibility': self.visibility,
            'createdBy': self.created_by.name,
            'cloneCount': self.clone_count,
            'viewCount': self.view_count,
            'active': self.active,
            'shareUrl': f"/shared/{self.share_id}",
            'trip': self.trip_id.to_dict(full=True) if self.trip_id else None,
        }
