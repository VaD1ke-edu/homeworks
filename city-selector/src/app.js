"use strict";

import CitySelector from  './CitySelector';
import DataProvider from './DataProvider';
import InfoUpdater  from './InfoUpdater';

let citySelectors = [],
    infoUpdater = new InfoUpdater('info')
;


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('createCitySelector').addEventListener('click', () => {
        let provider     = new DataProvider('http://localhost:3000/');
        let citySelector = new CitySelector(provider, 'info', 'citySelector', {});
        citySelectors.push(citySelector);
    });

    document.getElementById('destroyCitySelector').addEventListener('click', () => {
        if (!citySelectors.length) {
            alert('no selectors');
            return;
        }
        citySelectors[0].destroy();
        citySelectors.shift();
    });

    document.body.addEventListener('city_selector_region_chosen', (event) => {
        if (event.detail.hasOwnProperty('region')) {
            infoUpdater.setRegion(event.detail.region);
            infoUpdater.setCity('');
        }
    });
    document.body.addEventListener('city_selector_city_chosen', (event) => {
        if (event.detail.hasOwnProperty('city')) {
            infoUpdater.setCity(event.detail.city);
        }
    });
});

