# -*- coding: utf-8 -*-
from odoo import models, fields, api

class City(models.Model):
    _name = 'globetrotter.city'
    _description = 'GlobeTrotter Destination City'
    _order = 'name asc'

    name = fields.Char('City Name', required=True, index=True)
    code = fields.Char('Slug / Key', required=True, index=True, help='Identifier such as "goa", "mumbai"')
    country = fields.Char('Country', required=True, default='India')
    region = fields.Char('Region / State', required=True)
    description = fields.Text('Storybook Description', required=True)
    cost_index = fields.Selection([
        ('Easy on the wallet', 'Easy on the wallet'),
        ('Balanced', 'Balanced'),
        ('A little luxe', 'A little luxe'),
    ], string='Cost Index', default='Balanced', required=True)
    popularity = fields.Char('Popularity Tag', default='High season favourite')
    season = fields.Char('Best Season', default='Oct – Mar')
    accent = fields.Selection([
        ('coral', 'Coral'),
        ('teal', 'Teal'),
        ('mustard', 'Mustard'),
    ], string='Visual Accent Color', default='teal', required=True)
    
    latitude = fields.Float('Latitude', digits=(10, 7))
    longitude = fields.Float('Longitude', digits=(10, 7))
    image_url = fields.Char('Cover Image URL')
    status = fields.Selection([
        ('active', 'Active'),
        ('archived', 'Archived'),
        ('draft', 'Draft'),
    ], string='Status', default='active', required=True)

    activity_ids = fields.One2many('globetrotter.activity', 'city_id', string='Activities')
    activity_count = fields.Integer('Activity Count', compute='_compute_activity_count', store=True)

    _sql_constraints = [
        ('code_uniq', 'unique(code)', 'City slug / identifier must be unique.')
    ]

    @api.depends('activity_ids')
    def _compute_activity_count(self):
        for record in self:
            record.activity_count = len(record.activity_ids)

    def to_dict(self):
        self.ensure_one()
        return {
            'id': self.code or str(self.id),
            'dbId': self.id,
            'name': self.name,
            'country': self.country,
            'region': self.region,
            'costIndex': self.cost_index,
            'popularity': self.popularity,
            'season': self.season,
            'description': self.description,
            'accent': self.accent,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'imageUrl': self.image_url,
            'status': self.status,
            'activityCount': self.activity_count,
        }
