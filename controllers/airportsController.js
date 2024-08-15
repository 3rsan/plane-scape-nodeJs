const AirportModel = require('../models/airportModel');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllAirports = async (req, res) => {
  try {
    // EXECUTE QUERY
    const features = new APIFeatures(AirportModel.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const airports = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: airports.length,
      data: {
        airports,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getAirport = async (req, res) => {
  try {
    const airport = await AirportModel.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        airport,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
