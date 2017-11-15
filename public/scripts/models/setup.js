'use strict';

var app = app || {};

(function(module) {
  // Set the __API_URL__ for requests to the server
  let __API_URL__ = 'https://extraordinary-gentlemen.herokuapp.com'; // eslint-disable-line
  if(location.hostname !== 'pumpfinder.herokuapp.com') __API_URL__ = 'http://localhost:4000';

  // Establishing the setup object
  const setup = {};
  setup.myCar = {};


  setup.parseXML = xml => {
    let data = module.xmlToJson(xml).menuItems.menuItem;
    if(!Array.isArray(data)) data = [data];
    return data.map(obj => obj.value['#text']);
  };

  // Get a list of all available vehicle makes and parse as an array
  setup.getMakes = year => { // eslint-disable-line
    $.get(`https://www.fueleconomy.gov/ws/rest/vehicle/menu/make?year=${year}`)
      .then(results => {
        module.setupView.loadMakes(setup.parseXML(results));
      }, console.error);
  };

  // Get a list of all available vehicle models for given year and parse as an array
  setup.getModels = (year, make) => { // eslint-disable-line
    $.get(`https://www.fueleconomy.gov/ws/rest/vehicle/menu/model?year=${year}&make=${make}`)
      .then(results => {
        module.setupView.loadModels(setup.parseXML(results));
      }, console.error);
  };

  // Get the details for the specific car
  setup.getCar = (year, make, model) => { // eslint-disable-line
    $.get(`https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${year}&make=${make}&model=${model}`)
      .then(results => {
        // TODO: Some cars return multiple options. Do we want to take that into account? Currently ignored.
        setup.getMPG(setup.parseXML(results)[0]);
      }, console.error)
  };

  // Get the mpg for the specific car
  setup.getMPG = id => { // eslint-disable-line
    console.log(`https://www.fueleconomy.gov/ws/rest/vehicle/${id}`);
    $.get(`https://www.fueleconomy.gov/ws/rest/vehicle/${id}`)
      .then(results => {
        // TODO: Some cars return multiple options. Do we want to take that into account? Currently ignored.
        console.log(module.xmlToJson(results));
        let carData = module.xmlToJson(results);
        let cityMpg = Number(carData.vehicle.city08['#text']);
        let hwyMpg = Number(carData.vehicle.highway08['#text']);
        setup.myCar.mpg = {
          city: cityMpg,
          hwy: hwyMpg,
          avg: (cityMpg + hwyMpg) / 2
        };
        console.log(setup.myCar);
      }, console.error)
  };



  // Test route to check communication with the API
  // $.get(`${__API_URL__}/test`)
  //   .then( console.log, console.error);

  module.setup = setup;
})(app);
