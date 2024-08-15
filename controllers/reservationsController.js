const Reservation = require('../models/reservationModel');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllReservations = async (req, res) => {
  try {
    // EXECUTE QUERY
    const features = new APIFeatures(Reservation.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const reservations = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: reservations.length,
      data: {
        reservations,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        reservation,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createReservation = async (req, res) => {
  try {
    // const newReservation = new Reservation({});
    // newReservation.save();
    const newReservation = await Reservation.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        reservation: newReservation,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      status: 'success',
      data: {
        reservation,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteReservation = async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
