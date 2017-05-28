"use strict";

import CitySelector from  './CitySelector';
import DataProvider from './DataProvider';

let citySelectors = [];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('createCitySelector').addEventListener('click', () => {
        let provider     = new DataProvider('http://localhost:3000/');
        let citySelector = new CitySelector(provider, 'info', 'citySelector', {});
        citySelector.create();
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
});

