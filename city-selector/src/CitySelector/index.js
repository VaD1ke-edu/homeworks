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
     * Object initialization
     *
     * @param {DataProvider} provider      Data provider
     * @param {string}       infoElementId Info element html ID
     * @param {string}       containerId   Container element html ID
     * @param {Object}       apiMethods    Api methods for data provider
     */
    constructor(provider, infoElementId, containerId, apiMethods) {
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

        this._initProperties(provider, infoElementId, containerId, apiMethods);
    }

    create() {
        appendHtml(this._getBlockElement(), selectorTmpl);

        let loadRegions = this._getBlockElement().querySelector(this.regionsLoadBtn);
        loadRegions.addEventListener('click', () => {
            this._showRegions();
        });

        this._getInfoElement().style.display = '';
    }

    destroy() {
        this._getBlockElement().remove();
        this.clearInfo();
    }

    sendApiRequest(method) {
        return this.provider.sendRequest(method)
            .catch((error) => { console.log(error); })
            .then(JSON.parse)
            .catch((error) => { console.log(error); })
        ;
    }

    clearInfo() {
        let infoBlock = this._getInfoElement();
        infoBlock.querySelector(this.regionInfo).innerHTML = '';
        infoBlock.querySelector(this.cityInfo).innerHTML   = '';
    }


    _initProperties(provider, infoElementId, containerId, methods) {
        this.provider      = provider;
        this.infoElementId = infoElementId;
        this.containerId   = containerId;
        this.apiMethods    = methods;
        this.currentData   = {'regionId': null, 'city': null};

        this.regionsLoadBtn   = '.js-load-regions-btn';
        this.regionItemSelect = '.js-region-item';
        this.citySelect       = '.js-city-select';
        this.cityItemSelect   = '.js-city-item';
        this.regionInfo       = '.js-region-id';
        this.cityInfo         = '.js-city-info';
        this.submitBtn        = '.js-submit-btn';
        this.regionBlock      = '#regionBlock';
        this.cityBlock        = '#cityBlock';
    }

    _showRegions() {
        return this.sendApiRequest(this.apiMethods['regions'])
            .then((data) => {
                let regionsHtml = Mustache.render(regionsTmpl, {regions: data});
                appendHtml(this._getBlockElement().querySelector(this.regionBlock), regionsHtml);

                let regionSelects = this._getBlockElement().querySelectorAll(this.regionItemSelect);
                for (let index in regionSelects) {
                    if (!regionSelects.hasOwnProperty(index)) {
                        return;
                    }
                    regionSelects[index].addEventListener('click', (event) => {
                        let target = event.target;
                        this._markAsSelected(target, this.regionItemSelect)
                            ._removeLocalities()
                            ._showLocalities(target.dataset.regionId)
                        ;
                        if (this.currentData.city) {
                            this._getSubmitBtn().disabled =  true;
                        }
                    });
                }
            } )
            .catch((error) => { console.log(error); })
        ;
    }

    _showLocalities(regionId) {
        return this.sendApiRequest(this.apiMethods['localities'] + '/' + regionId)
            .then((data) => {
                this._setCurrentRegionId(regionId);
                if (!data) {
                    return;
                }
                let citiesHtml = Mustache.render(citiesTmpl, {cities: data.list});
                appendHtml(this._getBlockElement().querySelector(this.cityBlock), citiesHtml);

                let citySelects = this._getBlockElement().querySelectorAll(this.cityItemSelect);
                for (let index in citySelects) {
                    if (!citySelects.hasOwnProperty(index)) {
                        return;
                    }
                    citySelects[index].addEventListener('click', (event) => {
                        let target = event.target;
                        this._markAsSelected(target, this.cityItemSelect)
                            ._setCurrentCity(target.innerHTML)
                        ;
                        this._getSubmitBtn().disabled = false;
                    });
                }
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

    _getInfoElement() {
        return document.getElementById(this.infoElementId);
    }

    _getBlockElement() {
        let container = this._getContainerElement();

        if (!this.hasOwnProperty('blockElem')) {
            let elem = document.createElement('div');
            elem.id = this._getBlockHash();
            container.append(elem);
            this.blockElem = elem;
        }
        return this.blockElem;
    }

    _getBlockHash() {
        if (!this.hasOwnProperty('hash')) {
            this.hash = this.containerId + '-child' + Date.now();
        }
        return this.hash;
    }

    _setCurrentRegionId(regionId) {
        let regionInfo = this._getInfoElement().querySelector(this.regionInfo);
        if (regionInfo) {
            regionInfo.innerHTML = regionId;
        }
        this.currentData.regionId = regionId;
        this.currentData.city     = null;

        return this;
    }

    _setCurrentCity(city) {
        let cityInfo = this._getInfoElement().querySelector(this.cityInfo);
        if (cityInfo) {
            cityInfo.innerHTML = city;
        }
        this.currentData.city = city;

        return this;
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

export default CitySelector;
