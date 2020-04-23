const path = require('path');

const utils = require('../utils/utils');
const Section = require(path.join(utils.rootDir, 'models', 'section'));

module.exports = class document {
    constructor(jsonDocument, scoreName) {
        this._name = scoreName;
        this._header = this.getHeader(jsonDocument.elements);
        this._sections = this.parseSections(jsonDocument.elements);
    };


    get name() {
        return this._name;
    };

    get header() {
        return this._header;
    };

    get sections() {
        return this._sections;
    };

    getHeader(arrayJson) {
        if (arrayJson[0].name === 'Header') {
            return arrayJson[0].elements[0].text;
        } else {
            return '';
        };
    };

    parseSections(arrayJson) {
        for (index in arrayJson) {
            if (arrayJson[index].name === 'Sections') {
                var sections = [];
                var elements = arrayJson[index].elements;
                for (var index2 in elements) {
                    var section = new Section(elements[index2]);
                    sections.push(section);
                };
                return sections;
            };
        };
        return '';
    };
};