# -*- coding: utf-8 -*-
from odoo import models, fields, api

class ResUsers(models.Model):
    _inherit = 'res.users'

    globetrotter_preference_ids = fields.One2many(
        'globetrotter.user_preference',
        'user_id',
        string='GlobeTrotter Preferences'
    )
    trip_ids = fields.One2many(
        'globetrotter.trip',
        'user_id',
        string='Trips'
    )
    saved_city_ids = fields.Many2many(
        'globetrotter.city',
        'globetrotter_user_saved_city_rel',
        'user_id',
        'city_id',
        string='Saved Destinations'
    )
    notification_ids = fields.One2many(
        'globetrotter.notification',
        'user_id',
        string='Notifications'
    )

    def is_globetrotter_admin(self):
        self.ensure_one()
        return self.has_group('globetrotter.group_admin')

    def get_traveler_profile(self):
        self.ensure_one()
        pref = self.globetrotter_preference_ids[:1]
        return {
            'id': self.id,
            'name': self.name,
            'email': self.login,
            'role': 'admin' if self.is_globetrotter_admin() else 'traveler',
            'savedDestinationsCount': len(self.saved_city_ids),
            'savedDestinationIds': [c.code or str(c.id) for c in self.saved_city_ids],
            'tripsCount': len(self.trip_ids),
            'preferences': pref.to_dict() if pref else {
                'currency': 'INR',
                'language': 'en',
                'travelStyle': 'Adventure',
                'budgetPreference': 'Balanced',
                'emailNotifications': True,
                'tripReminders': True,
            }
        }
