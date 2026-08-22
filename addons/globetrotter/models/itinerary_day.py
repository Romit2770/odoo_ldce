# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError

class ItineraryDay(models.Model):
    _name = 'globetrotter.itinerary_day'
    _description = 'GlobeTrotter Itinerary Planning Day'
    _order = 'trip_id asc, day_number asc, date asc'

    trip_id = fields.Many2one('globetrotter.trip', string='Trip', required=True, ondelete='cascade', index=True)
    trip_stop_id = fields.Many2one('globetrotter.trip_stop', string='Trip Stop', required=True, ondelete='cascade', index=True)
    day_number = fields.Integer('Day Number', required=True, default=1, index=True)
    date = fields.Date('Date', required=True)
    notes = fields.Text('Day Notes / Highlights')

    city = fields.Char('City Name', related='trip_stop_id.city', store=True, readonly=True)
    activity_ids = fields.One2many('globetrotter.trip_activity', 'itinerary_day_id', string='Scheduled Activities', order='sequence asc, start_time asc')

    @api.constrains('day_number')
    def _check_day_number(self):
        for day in self:
            if day.day_number < 1:
                raise ValidationError('Day number must be positive (>= 1).')

    @api.constrains('trip_id', 'trip_stop_id')
    def _check_stop_trip_match(self):
        for day in self:
            if day.trip_stop_id and day.trip_stop_id.trip_id != day.trip_id:
                raise ValidationError('Itinerary Day stop must belong to the same trip.')

    def to_dict(self, full=True):
        self.ensure_one()
        date_str = self.date.strftime('%a, %d %b') if self.date else ''
        act_data = [a.to_dict() for a in self.activity_ids] if full else []
        return {
            'id': str(self.id),
            'dbId': self.id,
            'tripId': self.trip_id.id,
            'stopId': str(self.trip_stop_id.id),
            'dayNumber': self.day_number,
            'date': date_str,
            'isoDate': self.date.isoformat() if self.date else None,
            'city': self.city or (self.trip_stop_id.city if self.trip_stop_id else ''),
            'notes': self.notes or '',
            'activities': act_data,
        }
