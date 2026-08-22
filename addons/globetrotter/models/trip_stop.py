# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError

class TripStop(models.Model):
    _name = 'globetrotter.trip_stop'
    _description = 'GlobeTrotter Stop in a Multi-City Trip'
    _order = 'trip_id asc, sequence asc, id asc'

    trip_id = fields.Many2one('globetrotter.trip', string='Trip', required=True, ondelete='cascade', index=True)
    city_id = fields.Many2one('globetrotter.city', string='Destination City', ondelete='set null')
    city = fields.Char('City Name', required=True)
    country = fields.Char('Country', default='India', required=True)
    region = fields.Char('Region / State', default='India', required=True)
    
    sequence = fields.Integer('Stop Sequence', default=10, index=True)
    arrival_date = fields.Date('Arrival Date', required=True)
    departure_date = fields.Date('Departure Date', required=True)
    color = fields.Char('Map & Timeline Accent Color', default='#FFC53D')
    notes = fields.Text('Stop Planning Notes')

    day_ids = fields.One2many('globetrotter.itinerary_day', 'trip_stop_id', string='Itinerary Days', order='day_number asc')

    @api.onchange('city_id')
    def _onchange_city_id(self):
        if self.city_id:
            self.city = self.city_id.name
            self.country = self.city_id.country
            self.region = self.city_id.region
            if self.city_id.accent == 'coral':
                self.color = '#FF6550'
            elif self.city_id.accent == 'teal':
                self.color = '#2CB9AA'
            else:
                self.color = '#FFC53D'

    @api.constrains('arrival_date', 'departure_date')
    def _check_dates(self):
        for stop in self:
            if stop.arrival_date and stop.departure_date and stop.departure_date < stop.arrival_date:
                raise ValidationError('Trip stop departure date cannot be earlier than arrival date.')

    def to_dict(self, full=True):
        self.ensure_one()
        arr_str = self.arrival_date.strftime('%d %b') if self.arrival_date else ''
        dep_str = self.departure_date.strftime('%d %b') if self.departure_date else ''
        date_range_str = f"{arr_str}–{dep_str}" if arr_str != dep_str else arr_str
        days_data = [d.to_dict(full=full) for d in self.day_ids] if full else []
        return {
            'id': str(self.id),
            'dbId': self.id,
            'tripId': self.trip_id.id,
            'cityId': self.city_id.code if self.city_id else None,
            'city': self.city,
            'country': self.country,
            'region': self.region,
            'dateRange': date_range_str,
            'arrival': arr_str,
            'departure': dep_str,
            'color': self.color or '#FFC53D',
            'sequence': self.sequence,
            'notes': self.notes or '',
            'days': days_data,
        }
