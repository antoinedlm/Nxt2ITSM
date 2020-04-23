const utils = require('../utils/utils');

module.exports = class normalization {
    constructor(jsonNorm, type, format) {
        this._type = type;
        this._format = format;
        this._content = this.getContent(jsonNorm.elements, this._type);
    };

    get format() {
        return this._format;
    };

    getContent(arrayJson, type) {
        var elements = [];

        switch (type) {
            case 'Enums':
            case 'Strings':
                for (index in arrayJson) {
                    var norm = {
                        label: '',
                        value: ''
                    };
                    if (arrayJson[index].attributes.Label) {
                        norm.label = arrayJson[index].attributes.Label;
                    };
                    norm.value = arrayJson[index].attributes.Value;

                    elements.push(norm);
                };
                break;
            case 'Ranges':
                for (index in arrayJson) {
                    var norm = {
                        label: '',
                        from: '',
                        to: ''
                    };
                    if (arrayJson[index].attributes) {
                        norm.label = arrayJson[index].attributes.Label;
                    };

                    var ranges = arrayJson[index].elements;

                    for (var index2 in ranges) {
                        if (ranges[index2].name === 'From') {
                            norm.from = ranges[index2].attributes.Value;
                        } else if (ranges[index2].name === 'To') {
                            norm.to = ranges[index2].attributes.Value;
                        };
                    }
                    elements.push(norm);
                };
                break;
        };
        return elements;
    };

    applyNorm(payload) {
        switch (this._type) {
            case 'Enums':
                for (index in this._content) {
                    if (payload === this._content[index].value && this._content[index].label) {
                        return this._content[index].label;
                    };
                };
                break;
            case 'Strings':
                for (index in this._content) {
                    var exp = this._content[index].value.replace(/[\-\[\]\/\{\}\(\)\+\.\\\^\$\|]/g, "\\$&");
                    exp = exp.replace(/\*/g, '.*').replace(/\?/g, '\\w');
                    var regexp = new RegExp(exp);
                    if (regexp.test(payload) && this._content[index].label) {
                        return this._content[index].label;
                    };
                };
                break;
            case 'Ranges':
                var label;
                for (index in this._content) {
                    var range = this._content[index];

                    if (payload >= range.from) {
                        if (range.to) {
                            if (payload <= range.to) {
                                if (range.label) {
                                    return range.label;
                                } else {
                                    return utils.transform(payload, this._format);
                                };
                            };
                        };
                        if (range.label) {
                            label = range.label;
                        };
                    };
                };
                if (label) {
                    return label;
                };
                break;
        };
        return utils.transform(payload, this._format);
    };
};