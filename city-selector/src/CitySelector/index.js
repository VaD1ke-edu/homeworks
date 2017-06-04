"use strict";

import './style.less';

/** Template renderer */
import Mustache from 'mustache';

/** Templates */
import selectorTmpl from 'html-loader!./templates/selector.html';
import citiesTmpl   from 'html-loader!./templates/cities.html';
import regionsTmpl  from 'html-loader!./templates/regions.html';

class CitySelector {
    /**
     * City selector constructor
     *
     * @param {DataProvider} provider      Data provider
     * @param {string}       containerId   Container element html ID
     * @param {Object}       apiMethods    Api methods for data provider
     */
    constructor(provider, containerId, apiMethods) {
        if (!provider) {
            const DataProvider = require('../DataProvider');
            provider = new DataProvider('http://localhost:3000/');
        }

        let defaultApiMethods = {
            'regions'   : 'regions',
            'localities': 'localities',
            'save'      : 'selectedRegions'
        };
        apiMethods = apiMethods || {};
        apiMethods = Object.assign({}, defaultApiMethods, apiMethods);

        this._initProperties(provider, containerId, apiMethods);

        appendHtml(this._getBlockElement(), selectorTmpl);

        let loadRegions = this._getBlockElement().querySelector(this.regionsLoadBtn);
        loadRegions.addEventListener('click', () => {
            this._showRegions();
        });
    }

    destroy() {
        this._getBlockElement().remove();
    }

    sendApiRequest(method) {
        return this.provider.sendRequest(method)
            .catch((error) => { console.log(error); })
            .then(JSON.parse)
            .catch((error) => { console.log(error); })
        ;
    }


    _initProperties(provider, containerId, methods) {
        this.provider      = provider;
        this.containerId   = containerId;
        this.apiMethods    = methods;
        this.currentData   = {'regionId': null, 'city': null};

        this.regionsLoadBtn   = '.js-load-regions-btn';
        this.regionSelect     = '.js-region-select';
        this.regionItemSelect = '.js-region-item';
        this.citySelect       = '.js-city-select';
        this.cityItemSelect   = '.js-city-item';
        this.submitBtn        = '.js-submit-btn';
        this.regionBlock      = '#regionBlock';
        this.cityBlock        = '#cityBlock';
    }

    _showRegions() {
        return this.sendApiRequest(this.apiMethods['regions'])
            .then((data) => {
                let regionsHtml = Mustache.render(regionsTmpl, {regions: data});
                this._removeLocalities();
                replaceInnerHtml(this._getBlockElement().querySelector(this.regionBlock), regionsHtml);

                let regionSelect = this._getBlockElement().querySelector(this.regionSelect);
                regionSelect.addEventListener('click', (event) => {
                    let target = event.target;
                    if (!target.classList.contains(sanitizeSelector(this.regionItemSelect))) {
                        return;
                    }

                    this._markAsSelected(target, this.regionItemSelect)
                        ._removeLocalities()
                        ._showLocalities(target.dataset.regionId)
                    ;
                    this._getSubmitBtn().disabled =  true;
                });
            } )
            .catch((error) => { console.log(error); })
        ;
    }

    _showLocalities(regionId) {
        return this.sendApiRequest(this.apiMethods['localities'] + '/' + regionId)
            .then((data) => {
                dispatchEvent('city_selector_region_chosen', {region: regionId});
                this.currentData.regionId = regionId;
                if (!data) {
                    return;
                }
                let citiesHtml = Mustache.render(citiesTmpl, {cities: data.list});
                replaceInnerHtml(this._getBlockElement().querySelector(this.cityBlock), citiesHtml);

                let citySelect = this._getBlockElement().querySelector(this.citySelect);
                citySelect.addEventListener('click', (event) => {
                    let target = event.target;
                    if (!target.classList.contains(sanitizeSelector(this.cityItemSelect))) {
                        return;
                    }

                    this.currentData.city = target.innerHTML;
                    dispatchEvent('city_selector_city_chosen', {city: target.innerHTML});
                    this._markAsSelected(target, this.cityItemSelect);
                    this._getSubmitBtn().disabled = false;
                });
            } )
            .catch((error) => { console.log(error); })
        ;
    }

    _saveSelectedLocalities() {
        this.provider.sendRequest(this.apiMethods['save'], {
            'method': 'POST',
            'data'  : this.currentData,
            'async' : false
        }).then(() => { this.destroy() });
    }

    _removeLocalities() {
        let citySelects = this._getBlockElement().querySelectorAll(this.citySelect);
        for (let index in citySelects) {
            if (citySelects.hasOwnProperty(index)) {
                citySelects[index].remove();
            }
        }

        return this;
    }

    _getContainerElement() {
        if (!this.hasOwnProperty('container')) {
            this.container = document.getElementById(this.containerId);
        }
        return this.container;
    }

    _getBlockElement() {
        let container = this._getContainerElement();

        if (!this.hasOwnProperty('blockElem')) {
            let elem = document.createElement('div');
            container.append(elem);
            this.blockElem = elem;
        }
        return this.blockElem;
    }

    _getSubmitBtn() {
        let submitBtn = this._getBlockElement().querySelector(this.submitBtn);
        if (!submitBtn) {
            submitBtn = document.createElement('button');
            submitBtn.className = this.submitBtn.replace('.', '');
            submitBtn.innerHTML = 'Сохранить';
            this._getBlockElement().append(submitBtn);
            submitBtn.addEventListener('click', () => { this._saveSelectedLocalities() });
        }

        return submitBtn;
    }

    _markAsSelected(elem, elemsClass) {
        if (elemsClass) {
            let elems = this._getBlockElement().querySelectorAll(elemsClass);
            for (let index in elems) {
                if (elems.hasOwnProperty(index)) {
                    elems[index].classList.remove('_selected');
                }
            }
        }
        elem.classList.add('_selected');
        return this;
    }
}

function appendHtml(container, html) {
    if (!html) {
        return;
    }
    let elem = document.createElement('div');
    elem.innerHTML = html;
    while (elem.firstChild) {
        container.appendChild(elem.firstChild);
    }
}

function replaceInnerHtml(container, html) {
    container.innerHTML = html;
}

function sanitizeSelector(selector) {
    return selector.replace(/[#.]/g,'');
}

function dispatchEvent(name, data) {
    let event = new CustomEvent(name, {'detail' : data});
    document.body.dispatchEvent(event);
}

export default CitySelector;
