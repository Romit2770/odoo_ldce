# -*- coding: utf-8 -*-
from odoo import models, fields, api

class UserPreference(models.Model):
    _name = 'globetrotter.user_preference'
    _description = 'GlobeTrotter User Travel Preferences'
    _rec_name = 'user_id'

    user_id = fields.Many2one('res.users', string='User', required=True, ondelete='cascade', index=True)
    currency = fields.Selection([
        ('INR', '₹ INR (Indian Rupee)'),
        ('USD', '$ USD (US Dollar)'),
        ('EUR', '€ EUR (Euro)'),
        ('GBP', '£ GBP (British Pound)'),
    ], string='Preferred Currency', default='INR', required=True)
    
    language = fields.Selection([
        ('en', 'English'),
        ('hi', 'Hindi'),
        ('es', 'Spanish'),
        ('fr', 'French'),
    ], string='Language', default='en', required=True)
    
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

    budget_preference = fields.Selection([
        ('Easy on the wallet', 'Easy on the wallet'),
        ('Balanced', 'Balanced'),
        ('A little luxe', 'A little luxe'),
    ], string='Budget Preference', default='Balanced', required=True)

    email_notifications = fields.Boolean('Email Notifications', default=True)
    trip_reminders = fields.Boolean('Trip Reminders', default=True)
    budget_alerts = fields.Boolean('Budget Alerts', default=True)

    _sql_constraints = [
        ('user_uniq', 'unique(user_id)', 'A user can only have one travel preference profile.')
    ]

    def to_dict(self):
        self.ensure_one()
        return {
            'id': self.id,
            'userId': self.user_id.id,
            'currency': self.currency,
            'language': self.language,
            'travelStyle': self.travel_style,
            'budgetPreference': self.budget_preference,
            'emailNotifications': self.email_notifications,
            'tripReminders': self.trip_reminders,
            'budgetAlerts': self.budget_alerts,
        }
