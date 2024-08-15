const express = require('express');
const airportController = require('../controllers/airportsController');

const router = express.Router();

router.route('/').get(airportController.getAllAirports);

router.route('/:id').get(airportController.getAirport);

module.exports = router;
