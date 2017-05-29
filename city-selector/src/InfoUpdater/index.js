"use strict";

import './style.less';

class InfoUpdater {
    constructor(blockId) {
        this.blockId = blockId;
        this._initProperties();
    }

    clearInfo() {
        let infoBlock = this._getInfoElement();
        infoBlock.querySelector(this.regionInfo).innerHTML = '';
        infoBlock.querySelector(this.cityInfo).innerHTML   = '';
    }


    _initProperties() {
        this.regionInfo = '.js-region-id';
        this.cityInfo   = '.js-city-info';
    }

    _getInfoElement() {
        return document.getElementById(this.blockId);
    }
}

export default InfoUpdater;
