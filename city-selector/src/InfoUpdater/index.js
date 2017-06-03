"use strict";

import './style.less';

/** Template renderer */
import Mustache from 'mustache';

/** Info template */
import infoTmpl from 'html-loader!./templates/info.html';

class InfoUpdater {
    constructor(blockId) {
        this.blockId = blockId;
        this._initProperties();

        this._getInfoElement().innerHTML = Mustache.render(infoTmpl, {region: '', city: ''});
    }

    destroy() {
        this._getInfoElement().remove();
    }

    setRegion(regionId) {
        this._getRegionElem().innerHTML = regionId;
        return this;
    }

    setCity(city) {
        this._getCityElem().innerHTML = city;
        return this;
    }

    clearInfo() {
        this.setCity('');
        this.setRegion('');
    }


    _initProperties() {
        this.regionInfoClass = '.js-region-id';
        this.cityInfoClass   = '.js-city-info';
    }

    _getInfoElement() {
        if (!this.hasOwnProperty('infoElem')) {
            this.infoElem = document.getElementById(this.blockId);
        }
        return this.infoElem;
    }

    _getCityElem() {
        if (!this.hasOwnProperty('cityElem')) {
            this.cityElem = this._getInfoElement().querySelector(this.cityInfoClass);
        }
        return this.cityElem;
    }

    _getRegionElem() {
        if (!this.hasOwnProperty('regionElem')) {
            this.regionElem = this._getInfoElement().querySelector(this.regionInfoClass);
        }
        return this.regionElem;
    }
}

export default InfoUpdater;
