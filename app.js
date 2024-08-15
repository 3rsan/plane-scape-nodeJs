const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const axios = require('axios');

const flightReservations = require('./routes/flightReservations');
const airports = require('./routes/airports');

const app = express();
app.use(cors());

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/flightReservations', flightReservations);
app.use('/api/v1/airports', airports);

// Get Flight data
const baseURL = 'https://api.schiphol.nl/public-flights';
const headers = {
  app_id: 'd569c747',
  app_key: '5fd64a3c11e35c7d70cad5b2654031b8',
  ResourceVersion: 'v4',
};

const convertTimeToMiliseconds = (scheduleTime, time) => {
  const splittedTime = time.split(':');
  return new Date(scheduleTime.setHours(Number(splittedTime[0]))).setMinutes(
    Number(splittedTime[1])
  );
};

app.get('/api/v1/flights', async (req, res) => {
  const {
    route,
    flightDirection,
    departureDate,
    arrivalDate,
    minArrivalTime,
    maxArrivalTime,
    selectedAirline,
    numOfStops,
  } = req.query;

  let url = `${baseURL}/flights?flightDirection=${flightDirection}&route=${route}&scheduleDate=${departureDate}`;

  if (selectedAirline) {
    url += `&airline=${selectedAirline}`;
  }

  try {
    const response = await axios.get(url, {
      headers,
    });

    const destinationsPromiseArray = [];
    const airlinesPromiseArray = [];
    let filteredFlights = [];

    if (response.data && response.data.flights) {
      response.data.flights.map((item) => {
        const destinations = item.route.destinations;
        const iata = destinations[destinations.length - 1];
        const prefixIATA = item.prefixIATA;

        const destinationPromise = new Promise(async (resolve, reject) => {
          try {
            const resp = await axios.get(`${baseURL}/destinations/${iata}`, {
              headers,
            });
            resolve(resp.data);
          } catch (error) {
            reject(error);
          }
        });

        const airlinePromise = new Promise(async (resolve, reject) => {
          try {
            const resp = await axios.get(`${baseURL}/airlines/${prefixIATA}`, {
              headers,
            });
            resolve(resp.data);
          } catch (error) {
            if (error.response.status === 404) {
              resolve({ iata: prefixIATA, publicName: 'Unknown' });
            }
            reject(error);
          }
        });

        destinationsPromiseArray.push(destinationPromise);
        airlinesPromiseArray.push(airlinePromise);
      });
      const destinationsResult = await Promise.all(destinationsPromiseArray);
      const airlinesResult = await Promise.all(airlinesPromiseArray);

      filteredFlights = response.data.flights.map((flight) => {
        const {
          flightName,
          scheduleTime,
          flightDirection,
          publicFlightState,
          route,
          prefixIATA,
          serviceType,
          scheduleDateTime,
        } = flight;
        const destination = destinationsResult.find(
          (item) => item.iata === flight.route.destinations[0]
        );
        const airline = airlinesResult.find(
          (item) => item.iata === flight.prefixIATA
        );
        return {
          flightName,
          scheduleTime,
          flightDirection,
          publicFlightState,
          route,
          prefixIATA,
          serviceType,
          destination,
          scheduleDateTime,
          duration: 150,
          airline,
        };
      });
    }

    filteredFlights = filteredFlights.filter((item) => {
      const scheduleTime = new Date(item.scheduleDateTime);
      const arrivalTime = scheduleTime.getTime();
      const newMinArrivalTime = convertTimeToMiliseconds(
        scheduleTime,
        minArrivalTime
      );
      const newMaxArrivalTime = convertTimeToMiliseconds(
        scheduleTime,
        maxArrivalTime
      );

      return (
        arrivalTime >= newMinArrivalTime && arrivalTime <= newMaxArrivalTime
      );
    });

    filteredFlights = filteredFlights.filter((item) => {
      if (numOfStops === '0') {
        return item.route.destinations.length === 1;
      } else if (numOfStops === '1') {
        return item.route.destinations.length === 2;
      }

      return item.route.destinations.length > 2;
    });

    res.send({ flights: filteredFlights });
  } catch (error) {
    res.status(500).send('Error in getting user data');
  }
});

app.get('/destinations', async (req, res) => {
  try {
    const response = await axios.get(`${baseURL}/destinations`, {
      headers: {
        app_id: 'd569c747',
        app_key: '5fd64a3c11e35c7d70cad5b2654031b8',
        ResourceVersion: 'v4',
      },
    });
    // Transform the data here if needed
    res.send(response.data);
  } catch (error) {
    res.status(500).send('Error in getting user data');
  }
});

// Get Airlines data

module.exports = app;
