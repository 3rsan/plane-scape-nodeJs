const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  flightName: {
    type: String,
    required: true,
  },
  airline: {
    type: String,
    required: true,
  },
  departureIata: {
    type: String,
    required: true,
  },
  arrivalIata: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  departureTime: {
    type: String,
    required: true,
  },
  arrivalTime: {
    type: String,
    required: true,
  },
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
