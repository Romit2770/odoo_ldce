# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError

class Activity(models.Model):
    _name = 'globetrotter.activity'
    _description = 'GlobeTrotter Master Catalog Activity'
    _order = 'city_id asc, name asc'

    name = fields.Char('Activity Name', required=True, index=True)
    city_id = fields.Many2one('globetrotter.city', string='City / Destination', required=True, ondelete='cascade', index=True)
    category = fields.Selection([
        ('Adventure', 'Adventure'),
        ('Sightseeing', 'Sightseeing'),
        ('Food', 'Food'),
        ('Culture', 'Culture'),
        ('Nature', 'Nature'),
        ('Nightlife', 'Nightlife'),
    ], string='Category', default='Sightseeing', required=True)
    
    description = fields.Text('Description', required=True)
    duration = fields.Char('Estimated Duration', default='2h', required=True)
    estimated_cost = fields.Float('Estimated Cost (INR)', default=0.0, required=True)
    currency = fields.Char('Currency Code', default='INR', required=True)
    location = fields.Char('Location / Landmark', required=True)
    rating = fields.Char('Rating / Recommendation', default='★ 4.8')
    icon = fields.Char('Icon Name', default='Compass')
    image_url = fields.Char('Image URL')
    status = fields.Selection([
        ('active', 'Active'),
        ('draft', 'Draft'),
        ('archived', 'Archived'),
    ], string='Status', default='active', required=True)

    @api.constrains('estimated_cost')
    def _check_estimated_cost(self):
        for rec in self:
            if rec.estimated_cost < 0:
                raise ValidationError('Activity estimated cost cannot be negative.')

    def to_dict(self):
        self.ensure_one()
        return {
            'id': f"catalog-{self.id}",
            'dbId': self.id,
            'name': self.name,
            'cityId': self.city_id.code or str(self.city_id.id),
            'cityName': self.city_id.name,
            'category': self.category,
            'description': self.description,
            'duration': self.duration,
            'cost': self.estimated_cost,
            'currency': self.currency,
            'location': self.location,
            'rating': self.rating,
            'icon': self.icon,
            'imageUrl': self.image_url,
            'status': self.status,
        }
