const express = require('express');
const reservationController = require('../controllers/reservationsController');

const router = express.Router();

// router.param('id', tourController.checkID);

router
  .route('/')
  .get(reservationController.getAllReservations)
  .post(reservationController.createReservation);

router
  .route('/:id')
  .get(reservationController.getReservation)
  .patch(reservationController.updateReservation)
  .delete(reservationController.deleteReservation);

module.exports = router;
