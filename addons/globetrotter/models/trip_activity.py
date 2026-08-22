# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError

class TripActivity(models.Model):
    _name = 'globetrotter.trip_activity'
    _description = 'GlobeTrotter Scheduled Trip Activity'
    _order = 'itinerary_day_id asc, sequence asc, start_time asc, id asc'

    trip_id = fields.Many2one('globetrotter.trip', string='Trip', required=True, ondelete='cascade', index=True)
    itinerary_day_id = fields.Many2one('globetrotter.itinerary_day', string='Itinerary Day', required=True, ondelete='cascade', index=True)
    activity_id = fields.Many2one('globetrotter.activity', string='Catalog Source Activity', ondelete='set null')
    
    name = fields.Char('Activity Name', required=True)
    start_time = fields.Char('Time (HH:MM)', default='10:00', required=True)
    duration = fields.Char('Duration', default='2h', required=True)
    cost = fields.Float('Cost (INR)', default=0.0, required=True)
    currency = fields.Char('Currency Code', default='INR', required=True)
    category = fields.Selection([
        ('Adventure', 'Adventure'),
        ('Sightseeing', 'Sightseeing'),
        ('Food', 'Food'),
        ('Culture', 'Culture'),
        ('Nature', 'Nature'),
        ('Nightlife', 'Nightlife'),
    ], string='Category', default='Sightseeing', required=True)
    
    location = fields.Char('Location / Landmark', required=True)
    description = fields.Text('Activity Notes / Description')
    sequence = fields.Integer('Sort Sequence', default=10, index=True)

    @api.onchange('activity_id')
    def _onchange_activity_id(self):
        if self.activity_id:
            self.name = self.activity_id.name
            self.duration = self.activity_id.duration
            self.cost = self.activity_id.estimated_cost
            self.category = self.activity_id.category
            self.location = self.activity_id.location
            self.description = self.activity_id.description

    @api.constrains('cost')
    def _check_cost(self):
        for act in self:
            if act.cost < 0:
                raise ValidationError('Trip activity cost cannot be negative.')

    @api.constrains('trip_id', 'itinerary_day_id')
    def _check_day_trip(self):
        for act in self:
            if act.itinerary_day_id and act.itinerary_day_id.trip_id != act.trip_id:
                raise ValidationError('Scheduled activity must belong to an itinerary day in the same trip.')

    def to_dict(self):
        self.ensure_one()
        return {
            'id': str(self.id),
            'dbId': self.id,
            'tripId': self.trip_id.id,
            'dayId': str(self.itinerary_day_id.id),
            'catalogActivityId': self.activity_id.id if self.activity_id else None,
            'name': self.name,
            'time': self.start_time,
            'duration': self.duration,
            'cost': self.cost,
            'category': self.category,
            'location': self.location,
            'description': self.description or '',
            'sequence': self.sequence,
        }
