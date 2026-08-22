# -*- coding: utf-8 -*-
from odoo import models, fields, api

class AuditLog(models.Model):
    _name = 'globetrotter.audit_log'
    _description = 'GlobeTrotter System Audit Trail'
    _order = 'create_date desc'

    user_id = fields.Many2one('res.users', string='Actor / User', ondelete='set null')
    action = fields.Char('Action Performed', required=True, index=True)
    model_name = fields.Char('Target Model', required=True, index=True)
    record_id = fields.Integer('Target Record ID')
    description = fields.Text('Audit Details')
    ip_address = fields.Char('Client IP')

    @api.model
    def log_event(self, action, model_name, record_id=0, description='', user_id=None, ip_address=None):
        return self.sudo().create({
            'user_id': user_id or (self.env.user.id if self.env.user else False),
            'action': action,
            'model_name': model_name,
            'record_id': record_id,
            'description': description,
            'ip_address': ip_address,
        })

    def to_dict(self):
        self.ensure_one()
        return {
            'id': self.id,
            'userId': self.user_id.id if self.user_id else None,
            'userName': self.user_id.name if self.user_id else 'System',
            'action': self.action,
            'modelName': self.model_name,
            'recordId': self.record_id,
            'description': self.description or '',
            'ipAddress': self.ip_address or '',
            'timestamp': self.create_date.isoformat() if self.create_date else None,
        }
