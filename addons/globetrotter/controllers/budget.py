# -*- coding: utf-8 -*-
from datetime import date
from odoo import http
from odoo.http import request
from .common import json_response, parse_json_body

class BudgetApiController(http.Controller):

    def _find_trip(self, identifier):
        domain = []
        if identifier.isdigit():
            domain = ['|', ('id', '=', int(identifier)), ('code', '=', identifier)]
        else:
            domain = [('code', '=', identifier)]
        return request.env['globetrotter.trip'].sudo().search(domain, limit=1)

    @http.route('/api/trips/<string:identifier>/budget', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def get_budget(self, identifier, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        trip = self._find_trip(identifier)
        if not trip:
            return json_response(success=False, error='Trip not found.', code='NOT_FOUND', status=404)

        budget_rec = request.env['globetrotter.budget'].sudo().search([('trip_id', '=', trip.id)], limit=1)
        if not budget_rec:
            budget_rec = request.env['globetrotter.budget'].sudo().create({'trip_id': trip.id})

        return json_response(data=budget_rec.to_dict(), success=True)

    @http.route('/api/trips/<string:identifier>/budget/toggle-buffet', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def toggle_buffet(self, identifier, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        trip = self._find_trip(identifier)
        if not trip:
            return json_response(success=False, error='Trip not found.', code='NOT_FOUND', status=404)

        budget_rec = request.env['globetrotter.budget'].sudo().search([('trip_id', '=', trip.id)], limit=1)
        if not budget_rec:
            budget_rec = request.env['globetrotter.budget'].sudo().create({'trip_id': trip.id})

        budget_rec.sudo().write({'buffet_included': not budget_rec.buffet_included})
        return json_response(data=budget_rec.to_dict(), success=True)

    @http.route('/api/trips/<string:identifier>/expenses', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def list_expenses(self, identifier, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        trip = self._find_trip(identifier)
        if not trip:
            return json_response(success=False, error='Trip not found.', code='NOT_FOUND', status=404)

        expenses = request.env['globetrotter.expense'].sudo().search([('trip_id', '=', trip.id)], order='date desc, create_date desc')
        return json_response(data=[e.to_dict() for e in expenses], success=True)

    @http.route('/api/trips/<string:identifier>/expenses', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def add_expense(self, identifier, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        trip = self._find_trip(identifier)
        if not trip:
            return json_response(success=False, error='Trip not found.', code='NOT_FOUND', status=404)

        body = parse_json_body(request)
        description = body.get('description')
        amount = body.get('amount')
        category = body.get('category', 'Food')
        
        if not description or amount is None:
            return json_response(success=False, error='Description and amount are required.', code='VALIDATION_ERROR', status=400)

        user = request.env.user if request.session.uid and not request.env.user._is_public() else request.env.ref('base.user_admin')
        exp = request.env['globetrotter.expense'].sudo().create({
            'trip_id': trip.id,
            'user_id': user.id,
            'category': category,
            'description': description,
            'amount': float(amount),
            'currency': body.get('currency', 'INR'),
            'date': body.get('date') or date.today().isoformat(),
            'notes': body.get('notes', ''),
        })

        return json_response(data=exp.to_dict(), success=True, status=201)

    @http.route('/api/trips/<string:identifier>/expenses/<int:expense_id>', type='http', auth='public', methods=['DELETE', 'OPTIONS'], csrf=False)
    def delete_expense(self, identifier, expense_id, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return json_response()

        exp = request.env['globetrotter.expense'].sudo().browse(expense_id)
        if not exp.exists():
            return json_response(success=False, error='Expense not found.', code='NOT_FOUND', status=404)

        exp.unlink()
        return json_response(data={'deletedExpenseId': expense_id}, success=True)
