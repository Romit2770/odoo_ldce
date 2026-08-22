# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError
from datetime import datetime

class Trip(models.Model):
    _name = 'globetrotter.trip'
    _description = 'GlobeTrotter Multi-City Trip'
    _order = 'create_date desc'

    name = fields.Char('Trip Name', required=True, index=True)
    code = fields.Char('Trip Identifier / Slug', index=True)
    user_id = fields.Many2one('res.users', string='Traveler / Owner', required=True, default=lambda self: self.env.user, index=True, ondelete='cascade')
    description = fields.Text('Trip Journal Description')
    
    start_date = fields.Date('Start Date', required=True)
    end_date = fields.Date('End Date', required=True)
    
    status = fields.Selection([
        ('Draft', 'Draft'),
        ('Upcoming', 'Upcoming'),
        ('Ongoing', 'Ongoing'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ], string='Status', default='Upcoming', required=True, index=True)

    travel_style = fields.Selection([
        ('Adventure', 'Adventure'),
        ('Relaxation', 'Relaxation'),
        ('Culture', 'Culture'),
        ('Food', 'Food'),
        ('Nature', 'Nature'),
        ('Luxury', 'Luxury'),
        ('Budget', 'Budget'),
        ('Family', 'Family'),
    ], string='Travel Style', default='Adventure', required=True)

    budget = fields.Float('Total Budget (INR)', default=25000.0, required=True)
    currency = fields.Char('Currency Code', default='INR', required=True)
    cover_image = fields.Char('Cover Image URL')
    
    # Relationships
    stop_ids = fields.One2many('globetrotter.trip_stop', 'trip_id', string='Trip Stops', order='sequence asc')
    itinerary_day_ids = fields.One2many('globetrotter.itinerary_day', 'trip_id', string='Itinerary Days', order='day_number asc')
    trip_activity_ids = fields.One2many('globetrotter.trip_activity', 'trip_id', string='Scheduled Activities')
    expense_ids = fields.One2many('globetrotter.expense', 'trip_id', string='Recorded Expenses')
    shared_trip_ids = fields.One2many('globetrotter.shared_trip', 'trip_id', string='Share Links')
    
    # Base expenses for transport/accommodation/food/misc presets
    base_transport_cost = fields.Float('Base Transport (INR)', default=4500.0)
    base_accommodation_cost = fields.Float('Base Accommodation (INR)', default=7000.0)
    base_food_cost = fields.Float('Base Food (INR)', default=3200.0)
    base_misc_cost = fields.Float('Base Miscellaneous (INR)', default=1700.0)

    # Computed fields
    date_range = fields.Char('Date Range Text', compute='_compute_date_text', store=True)
    duration_text = fields.Char('Duration Text', compute='_compute_date_text', store=True)
    estimated_cost = fields.Float('Total Estimated Cost', compute='_compute_financials', store=True)
    actual_spend = fields.Float('Total Actual Spend', compute='_compute_financials', store=True)
    progress_percentage = fields.Integer('Planning Progress %', compute='_compute_progress', store=True)

    @api.constrains('start_date', 'end_date')
    def _check_dates(self):
        for trip in self:
            if trip.start_date and trip.end_date and trip.end_date < trip.start_date:
                raise ValidationError('Trip end date cannot be earlier than start date.')

    @api.constrains('budget')
    def _check_budget(self):
        for trip in self:
            if trip.budget < 0:
                raise ValidationError('Trip budget cannot be negative.')

    @api.depends('start_date', 'end_date')
    def _compute_date_text(self):
        for trip in self:
            if trip.start_date and trip.end_date:
                s = trip.start_date
                e = trip.end_date
                days = (e - s).days + 1
                if s.month == e.month and s.year == e.year:
                    trip.date_range = f"{s.day}–{e.day} {s.strftime('%b %Y')}"
                else:
                    trip.date_range = f"{s.strftime('%d %b')} – {e.strftime('%d %b %Y')}"
                trip.duration_text = f"{days} sunny days" if days > 1 else "1 day journey"
            else:
                trip.date_range = "Dates not set"
                trip.duration_text = "Flexible days"

    @api.depends(
        'base_transport_cost', 'base_accommodation_cost', 'base_food_cost', 'base_misc_cost',
        'trip_activity_ids.cost', 'expense_ids.amount'
    )
    def _compute_financials(self):
        for trip in self:
            act_cost = sum(trip.trip_activity_ids.mapped('cost'))
            base_total = trip.base_transport_cost + trip.base_accommodation_cost + trip.base_food_cost + trip.base_misc_cost
            trip.estimated_cost = base_total + act_cost
            trip.actual_spend = sum(trip.expense_ids.mapped('amount'))

    @api.depends('stop_ids', 'itinerary_day_ids', 'trip_activity_ids', 'budget')
    def _compute_progress(self):
        for trip in self:
            points = 0
            if trip.name and trip.start_date and trip.end_date:
                points += 25
            if len(trip.stop_ids) > 0:
                points += 25
            if len(trip.trip_activity_ids) >= 3:
                points += 25
            if trip.budget > 0:
                points += 25
            trip.progress_percentage = points

    def to_dict(self, full=True):
        self.ensure_one()
        stops_data = [stop.to_dict(full=full) for stop in self.stop_ids] if full else []
        return {
            'id': self.code or str(self.id),
            'dbId': self.id,
            'userId': self.user_id.id,
            'travelerName': self.user_id.name,
            'name': self.name,
            'dateRange': self.date_range or '',
            'duration': self.duration_text or '',
            'startDate': self.start_date.isoformat() if self.start_date else None,
            'endDate': self.end_date.isoformat() if self.end_date else None,
            'description': self.description or '',
            'status': self.status,
            'budget': self.budget,
            'estimatedCost': self.estimated_cost,
            'actualSpend': self.actual_spend,
            'travelStyle': self.travel_style,
            'progress': self.progress_percentage,
            'coverImage': self.cover_image or '',
            'baseExpenses': {
                'Transport': self.base_transport_cost,
                'Accommodation': self.base_accommodation_cost,
                'Food': self.base_food_cost,
                'Miscellaneous': self.base_misc_cost,
            },
            'stops': stops_data,
            'stopsCount': len(self.stop_ids),
            'activitiesCount': len(self.trip_activity_ids),
            'createdAt': self.create_date.isoformat() if self.create_date else None,
            'updatedAt': self.write_date.isoformat() if self.write_date else None,
        }
