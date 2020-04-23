const path = require('path');

const utils = require('../utils/utils');
const Document = require(path.join(utils.rootDir, 'models', 'document'));
const Norm = require(path.join(utils.rootDir, 'models', 'normalization'));

module.exports = class leafScore {
    constructor(jsonLeaf) {
        this._name = jsonLeaf.attributes.Name;
        this._type = 'leaf';
        this._description = jsonLeaf.attributes.Description;
        this._format = this.getFormat(jsonLeaf.elements);
        this._normalization = this.parseNormalization(jsonLeaf.elements);
        this._hasDoc = this.checkDocument(jsonLeaf.elements);
        this._document = this.parseDocument(jsonLeaf.elements);
    };

    get name() {
        return this._name;
    };

    get type() {
        return this._type;
    };

    get description() {
        return this._description;
    };

    get document() {
        return this._document;
    };

    get hasDoc() {
        return this._hasDoc;
    };

    get format() {
        return this._format;
    };

    get normalization() {
        return this._normalization;
    };

    getFormat(arrayJson) {
        var format = '';
        for (index in arrayJson) {
            if (arrayJson[index].name === 'Input' && arrayJson[index].attributes) {
                format = arrayJson[index].attributes.Format;
            };
        };
        return format;
    };

    parseDocument(arrayJson) {
        if (this._hasDoc) {
            for (index in arrayJson) {
                if (arrayJson[index].name === 'Document') {
                    return new Document(arrayJson[index], this._name);
                };
            };

        } else {
            return '';
        }
    };

    //Check if there is a Document section, and inside Sections, and inside Section with content
    checkDocument(arrayJson) {
        for (index in arrayJson) {
            if (arrayJson[index].name === 'Document') {
                if (arrayJson[index].elements) {
                    var docElements = arrayJson[index].elements;
                    for (var index2 in docElements) {
                        if (docElements[index2].name === 'Sections') {
                            if (docElements[index2].elements) {
                                if (docElements[index2].elements[0].elements) {
                                    if (docElements[index2].elements[0].elements[0].elements) {
                                        return true;
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        return false;
    };

    parseNormalization(arrayJson) {
        for (index in arrayJson) {
            if (arrayJson[index].name === 'Normalization') {
                var scoreNorm = arrayJson[index].elements[0];
                var normType = scoreNorm.name;
                return new Norm(scoreNorm, normType, this._format);
            };
        };
    };
};