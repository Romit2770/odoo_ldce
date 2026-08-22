# -*- coding: utf-8 -*-
from odoo import models, fields, api

class Notification(models.Model):
    _name = 'globetrotter.notification'
    _description = 'GlobeTrotter User Notification'
    _order = 'create_date desc'

    user_id = fields.Many2one('res.users', string='Recipient', required=True, ondelete='cascade', index=True)
    title = fields.Char('Title', required=True)
    message = fields.Text('Message', required=True)
    notification_type = fields.Selection([
        ('trip_update', 'Trip Update'),
        ('budget_alert', 'Budget Alert'),
        ('activity_reminder', 'Activity Reminder'),
        ('system', 'System Notice'),
    ], string='Notification Type', default='trip_update', required=True)
    
    is_read = fields.Boolean('Read Status', default=False, index=True)
    action_url = fields.Char('Action Link URL')

    def mark_as_read(self):
        self.write({'is_read': True})

    def to_dict(self):
        self.ensure_one()
        return {
            'id': str(self.id),
            'userId': self.user_id.id,
            'title': self.title,
            'message': self.message,
            'type': self.notification_type,
            'isRead': self.is_read,
            'actionUrl': self.action_url or '',
            'createdAt': self.create_date.isoformat() if self.create_date else None,
        }
