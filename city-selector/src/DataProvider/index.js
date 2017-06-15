"use strict";

class DataProvider {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    sendRequest(apiMethod, options) {
        let requestOptions = {
            'method' : 'GET',
            'data'   : null,
            'async'  : true
        };
        Object.assign(requestOptions, options);

        return new Promise(function(resolve, reject) {
            let req = new XMLHttpRequest();
            req.open(requestOptions.method, this.apiUrl + apiMethod, requestOptions.async);
            req.onload = function() {
                (req.status === 200 || req.status === 201)
                    ? resolve(req.response)
                    : reject(new Error(req.statusText));
            };

            req.onerror = function() {
                reject(new Error('Network error'));
            };

            if (requestOptions.data) {
                req.setRequestHeader('Content-Type', 'application/json');
                req.send(JSON.stringify(requestOptions.data));
            } else {
                req.send();
            }
        }.bind(this));
    }

    sendSyncRequest(apiMethod, method = 'GET', data = {}) {
        let form = document.createElement('form');
        form.method = method;
        form.action = this.apiUrl + apiMethod;
        form.style.display = 'none';

        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                let input = document.createElement('input');
                input.value = data[key];
                input.name  = key;
                form.appendChild(input);
            }
        }
        document.body.appendChild(form);

        form.submit();
    }
}

export default DataProvider;
