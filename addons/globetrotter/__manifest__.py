# -*- coding: utf-8 -*-
{
    'name': 'GlobeTrotter Travel Planner',
    'version': '1.0.0',
    'category': 'Services/Travel',
    'summary': 'Multi-city travel planning platform with itineraries, budgets, discovery, and trip sharing',
    'description': """
GlobeTrotter — Travel Planning Backend
======================================
Odoo backend business and persistence layer for the GlobeTrotter Storybook Atlas application.

Key Features:
-------------
* Comprehensive Trip Hierarchy: Trip -> TripStop -> ItineraryDay -> TripActivity
* Destination & Activity Catalog with categories, seasonal indices, and pricing
* Real-time Budget calculations, category tracking, and Expense recording
* Link-based and public trip sharing with immutable share tokens and cloning
* Role-based access control (Traveler & Admin) with strict server-side authorization
* RESTful JSON API controllers with session and token authentication
* Notifications and Administrative Audit Logs
    """,
    'author': 'GlobeTrotter Team',
    'website': 'https://github.com/globetrotter/odoo',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'mail',
        'web',
    ],
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'views/trip_views.xml',
        'views/city_views.xml',
        'views/activity_views.xml',
        'views/budget_views.xml',
        'views/admin_views.xml',
    ],
    'demo': [
        'data/demo_data.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
