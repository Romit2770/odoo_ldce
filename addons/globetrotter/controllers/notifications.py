# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from .common import json_response

class NotificationsApiController(http.Controller):

    @http.route('/api/notifications', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def list_notifications(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        user = request.env.user if request.session.uid and not request.env.user._is_public() else request.env.ref('base.user_admin')
        notifs = request.env['globetrotter.notification'].sudo().search([('user_id', '=', user.id)], order='create_date desc', limit=20)
        return json_response(data=[n.to_dict() for n in notifs], success=True)

    @http.route('/api/notifications/<int:notif_id>/read', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def mark_read(self, notif_id, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        notif = request.env['globetrotter.notification'].sudo().browse(notif_id)
        if not notif.exists():
            return json_response(success=False, error='Notification not found.', code='NOT_FOUND', status=404)

        notif.sudo().mark_as_read()
        return json_response(data={'markedReadId': notif_id}, success=True)
