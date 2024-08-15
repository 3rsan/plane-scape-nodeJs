const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema({
  icao: {
    type: String,
  },
  iata: {
    type: String,
  },
  name: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
  elevation: {
    type: Number,
  },
  lat: {
    type: Number,
  },
  lon: {
    type: Number,
  },
  tz: {
    type: String,
  },
});

const AirportModel = mongoose.model('Airports', airportSchema);

module.exports = AirportModel;
