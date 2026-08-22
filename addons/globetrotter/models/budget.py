# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError

class Budget(models.Model):
    _name = 'globetrotter.budget'
    _description = 'GlobeTrotter Trip Budget & Financial Planning'
    _rec_name = 'trip_id'

    trip_id = fields.Many2one('globetrotter.trip', string='Trip', required=True, ondelete='cascade', index=True)
    currency = fields.Char('Currency', default='INR', required=True)
    
    total_budget = fields.Float('Total Allocated Budget', related='trip_id.budget', store=True, readonly=False)
    buffet_included = fields.Boolean('Goa Beach Buffet Included (+₹1,200)', default=False)
    
    # Category Breakdowns (Estimated)
    transport_estimated = fields.Float('Transport (INR)', compute='_compute_estimates', store=True)
    accommodation_estimated = fields.Float('Accommodation (INR)', compute='_compute_estimates', store=True)
    food_estimated = fields.Float('Food (INR)', compute='_compute_estimates', store=True)
    activities_estimated = fields.Float('Activities (INR)', compute='_compute_estimates', store=True)
    misc_estimated = fields.Float('Miscellaneous (INR)', compute='_compute_estimates', store=True)
    
    total_estimated = fields.Float('Total Estimated (INR)', compute='_compute_estimates', store=True)
    total_actual = fields.Float('Total Actual Spend (INR)', compute='_compute_actuals', store=True)
    remaining_budget = fields.Float('Remaining Budget (INR)', compute='_compute_remaining', store=True)

    @api.depends('trip_id.base_transport_cost', 'trip_id.base_accommodation_cost', 'trip_id.base_food_cost', 'trip_id.base_misc_cost', 'trip_id.trip_activity_ids.cost', 'buffet_included')
    def _compute_estimates(self):
        for rec in self:
            trip = rec.trip_id
            rec.transport_estimated = trip.base_transport_cost if trip else 0.0
            rec.accommodation_estimated = trip.base_accommodation_cost if trip else 0.0
            rec.food_estimated = (trip.base_food_cost if trip else 0.0) + (1200.0 if rec.buffet_included else 0.0)
            rec.activities_estimated = sum(trip.trip_activity_ids.mapped('cost')) if trip else 0.0
            rec.misc_estimated = trip.base_misc_cost if trip else 0.0
            rec.total_estimated = rec.transport_estimated + rec.accommodation_estimated + rec.food_estimated + rec.activities_estimated + rec.misc_estimated

    @api.depends('trip_id.expense_ids.amount')
    def _compute_actuals(self):
        for rec in self:
            rec.total_actual = sum(rec.trip_id.expense_ids.mapped('amount')) if rec.trip_id else 0.0

    @api.depends('total_budget', 'total_estimated')
    def _compute_remaining(self):
        for rec in self:
            rec.remaining_budget = (rec.total_budget or 0.0) - (rec.total_estimated or 0.0)

    def to_dict(self):
        self.ensure_one()
        return {
            'id': str(self.id),
            'tripId': self.trip_id.id,
            'currency': self.currency,
            'totalBudget': self.total_budget,
            'buffetIncluded': self.buffet_included,
            'totalEstimated': self.total_estimated,
            'totalActual': self.total_actual,
            'remainingBudget': self.remaining_budget,
            'breakdown': {
                'Transport': self.transport_estimated,
                'Accommodation': self.accommodation_estimated,
                'Food': self.food_estimated,
                'Activities': self.activities_estimated,
                'Miscellaneous': self.misc_estimated,
            }
        }
