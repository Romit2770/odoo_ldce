# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError

class Expense(models.Model):
    _name = 'globetrotter.expense'
    _description = 'GlobeTrotter Actual Logged Expense'
    _order = 'date desc, create_date desc'

    trip_id = fields.Many2one('globetrotter.trip', string='Trip', required=True, ondelete='cascade', index=True)
    user_id = fields.Many2one('res.users', string='Payer / Logged By', default=lambda self: self.env.user, required=True)
    
    category = fields.Selection([
        ('Transport', 'Transport'),
        ('Accommodation', 'Accommodation'),
        ('Food', 'Food'),
        ('Activities', 'Activities'),
        ('Miscellaneous', 'Miscellaneous'),
    ], string='Category', default='Food', required=True)
    
    description = fields.Char('Expense Description', required=True)
    amount = fields.Float('Amount (INR)', required=True)
    currency = fields.Char('Currency Code', default='INR', required=True)
    date = fields.Date('Expense Date', default=fields.Date.context_today, required=True)
    notes = fields.Text('Receipt / Memo Notes')

    @api.constrains('amount')
    def _check_amount(self):
        for exp in self:
            if exp.amount < 0:
                raise ValidationError('Expense amount cannot be negative.')

    def to_dict(self):
        self.ensure_one()
        return {
            'id': f"expense-{self.id}",
            'dbId': self.id,
            'tripId': self.trip_id.id,
            'userId': self.user_id.id,
            'category': self.category,
            'description': self.description,
            'amount': self.amount,
            'currency': self.currency,
            'date': self.date.isoformat() if self.date else '',
            'notes': self.notes or '',
        }
