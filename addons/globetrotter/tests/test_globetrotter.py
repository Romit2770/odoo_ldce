# -*- coding: utf-8 -*-
from datetime import date, timedelta
from odoo.tests.common import TransactionCase
from odoo.exceptions import ValidationError, AccessError

class TestGlobeTrotter(TransactionCase):

    def setUp(self):
        super(TestGlobeTrotter, self).setUp()
        self.City = self.env['globetrotter.city']
        self.Activity = self.env['globetrotter.activity']
        self.Trip = self.env['globetrotter.trip']
        self.TripStop = self.env['globetrotter.trip_stop']
        self.ItineraryDay = self.env['globetrotter.itinerary_day']
        self.TripActivity = self.env['globetrotter.trip_activity']
        self.Expense = self.env['globetrotter.expense']
        self.SharedTrip = self.env['globetrotter.shared_trip']
        self.User = self.env['res.users']

        # Create test users
        self.traveler_user = self.User.create({
            'name': 'Test Traveler',
            'login': 'traveler_test@example.com',
            'email': 'traveler_test@example.com',
        })
        self.other_user = self.User.create({
            'name': 'Other Traveler',
            'login': 'other_test@example.com',
            'email': 'other_test@example.com',
        })

        # Create test city
        self.city_goa = self.City.create({
            'name': 'Goa Test',
            'code': 'goa-test',
            'country': 'India',
            'region': 'Goa',
            'cost_index': 'Easy on the wallet',
            'description': 'Sunny beaches and coastal charm.',
        })

        # Create test master activity
        self.master_act = self.Activity.create({
            'name': 'Kayak Adventure',
            'city_id': self.city_goa.id,
            'category': 'Adventure',
            'description': 'Paddle along the mangroves.',
            'duration': '2h',
            'estimated_cost': 850.0,
            'location': 'Chapora River',
        })

    def test_01_trip_creation_and_computed_fields(self):
        """Test trip creation, date range formatting, and progress computation."""
        today = date.today()
        trip = self.Trip.create({
            'name': 'Monsoon Getaway',
            'user_id': self.traveler_user.id,
            'start_date': today,
            'end_date': today + timedelta(days=4),
            'budget': 20000.0,
            'travel_style': 'Adventure',
            'base_transport_cost': 4000.0,
            'base_accommodation_cost': 6000.0,
            'base_food_cost': 3000.0,
            'base_misc_cost': 1000.0,
        })
        self.assertTrue(trip.id)
        self.assertEqual(trip.status, 'Upcoming')
        self.assertIn('sunny days', trip.duration_text)
        self.assertEqual(trip.estimated_cost, 14000.0)

    def test_02_trip_date_validation(self):
        """Test that trip end date cannot precede start date."""
        today = date.today()
        with self.assertRaises(ValidationError):
            self.Trip.create({
                'name': 'Invalid Date Trip',
                'user_id': self.traveler_user.id,
                'start_date': today,
                'end_date': today - timedelta(days=2),
                'budget': 10000.0,
            })

    def test_03_trip_stop_and_day_cascade(self):
        """Test stop sequence, days, and activity scheduling."""
        today = date.today()
        trip = self.Trip.create({
            'name': 'South India Circuit',
            'user_id': self.traveler_user.id,
            'start_date': today,
            'end_date': today + timedelta(days=3),
            'budget': 30000.0,
        })

        stop = self.TripStop.create({
            'trip_id': trip.id,
            'city_id': self.city_goa.id,
            'city': 'Goa',
            'sequence': 1,
            'arrival_date': today,
            'departure_date': today + timedelta(days=3),
        })

        day = self.ItineraryDay.create({
            'trip_id': trip.id,
            'trip_stop_id': stop.id,
            'day_number': 1,
            'date': today,
        })

        act = self.TripActivity.create({
            'trip_id': trip.id,
            'itinerary_day_id': day.id,
            'activity_id': self.master_act.id,
            'name': self.master_act.name,
            'cost': 850.0,
            'start_time': '09:00',
            'duration': '2h',
            'category': 'Adventure',
            'location': 'Chapora River',
        })

        self.assertEqual(len(stop.day_ids), 1)
        self.assertEqual(len(day.activity_ids), 1)
        # Financial rollup includes base costs + scheduled activity
        self.assertGreater(trip.estimated_cost, 850.0)

    def test_04_expense_recording_and_budget_tracking(self):
        """Test expense recording updates actual spend rollup."""
        today = date.today()
        trip = self.Trip.create({
            'name': 'Budget Test Trip',
            'user_id': self.traveler_user.id,
            'start_date': today,
            'end_date': today + timedelta(days=2),
            'budget': 15000.0,
        })

        self.Expense.create({
            'trip_id': trip.id,
            'user_id': self.traveler_user.id,
            'category': 'Food',
            'description': 'Fish thali lunch',
            'amount': 450.0,
            'date': today,
        })

        self.Expense.create({
            'trip_id': trip.id,
            'user_id': self.traveler_user.id,
            'category': 'Transport',
            'description': 'Scooter fuel',
            'amount': 250.0,
            'date': today,
        })

        self.assertEqual(trip.actual_spend, 700.0)

    def test_05_shared_trip_cloning(self):
        """Test that sharing a trip and cloning it works cleanly."""
        today = date.today()
        original_trip = self.Trip.create({
            'name': 'Original Coastal Trip',
            'user_id': self.traveler_user.id,
            'start_date': today,
            'end_date': today + timedelta(days=2),
            'budget': 20000.0,
            'description': 'Shared travel notes.',
        })

        share = self.SharedTrip.create({
            'trip_id': original_trip.id,
            'created_by': self.traveler_user.id,
            'visibility': 'link',
        })

        cloned_trip = share.clone_to_user(self.other_user)
        self.assertEqual(cloned_trip.user_id.id, self.other_user.id)
        self.assertIn('My Copy', cloned_trip.name)
        self.assertEqual(share.clone_count, 1)

    def test_06_activity_negative_cost_constraint(self):
        """Test validation preventing negative activity cost."""
        with self.assertRaises(ValidationError):
            self.Activity.create({
                'name': 'Invalid Activity',
                'city_id': self.city_goa.id,
                'estimated_cost': -500.0,
                'location': 'Beach',
            })
