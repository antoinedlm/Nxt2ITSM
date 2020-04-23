const path = require('path');

const utils = require('../utils/utils');
const LeafScore = require(path.join(utils.rootDir, 'models', 'leafScore'));
const Document = require(path.join(utils.rootDir, 'models', 'document'));

module.exports = class compositeScore {
    constructor(jsonComposite, mainBool, parentMainBool) {
        this._name = jsonComposite.attributes.Name;
        this._type = 'composite';
        this._description = jsonComposite.attributes.Description;
        this._isMain = mainBool;
        this._isParentMain = parentMainBool;
        this._childs = this.getChildren(jsonComposite.elements);
        this._hasLeaf = this.checkLeaf(jsonComposite.elements);
        this._hasDoc = this.checkDocument(jsonComposite.elements);
        this._document = this.parseDocument(jsonComposite.elements);
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

    get childs() {
        return this._childs;
    };

    get isMain() {
        return this._isMain;
    };

    get isParentMain() {
        return this._isParentMain;
    };

    get hasLeaf() {
        return this._hasLeaf;
    };

    get hasDoc() {
        return this._hasDoc;
    };

    getChildren(arrayJson) {
        var childsArray = [];
        for (index in arrayJson) {
            if (arrayJson[index].name === 'LeafScore') {
                childsArray.push(new LeafScore(arrayJson[index]));
            };
        };
        for (index in arrayJson) {
            if (arrayJson[index].name === 'CompositeScore') {
                childsArray.push(new compositeScore(arrayJson[index], false, this._isMain));
            };
        };
        return childsArray;
    };

    checkLeaf(arrayJson) {
        for (index in arrayJson) {
            if (arrayJson[index].name === 'LeafScore') {
                return true;
            };
        };
        return false;
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
};