const convert = require('xml-js');
const fs = require('fs');
const path = require('path');

const utils = require('../utils/utils');
const compositeScore = require(path.join(utils.rootDir, 'models', 'compositeScore'));

module.exports = class scoreDef {
    constructor(xmlFile) {
        this._xmlContent = this.readXml(xmlFile);
        this._jsonContent = this.parseContent();
        this._name = this._jsonContent.attributes.Name;
        this._thresholds = this.parseThresholds(this._jsonContent.elements);
        this._scoreContent = new compositeScore(this._jsonContent.elements[4], true, false);
        this._selectString = this.getSelectString(this._scoreContent);
        this._normalizations = this.getNormalizations(this._scoreContent, this._name);
        this._document = this.getDocuments(this._scoreContent);
    };

    get xmlContent() {
        return this._xmlContent;
    };

    get jsonContent() {
        return this._jsonContent;
    };

    get name() {
        return this._name;
    };

    get thresholds() {
        return this._thresholds;
    }

    get scoreContent() {
        return this._scoreContent;
    }

    get selectString() {
        return this._selectString;
    }

    get normalizations() {
        return this._normalizations;
    };

    get document() {
        return this._document;
    };

    parseContent() {
        var options = { ignoreComment: true, ignoreDeclaration: true, ignoreDoctype: true, alwaysArray: true };
        var parsedContent = convert.xml2js(this._xmlContent, options);
        return parsedContent.elements[0];
    };

    readXml(filePath) {
        var textXml = fs.readFileSync(filePath, { encoding: 'utf-8' }, function (error, text) {
            if (error) {
                console.error(error);
                return null;
            } else {
                return text;
            };
        });
        return textXml;
    };

    parseThresholds(elementsList) {
        var thresholds = [];
        for (index in elementsList) {
            if (elementsList[index].name === 'Thresholds') {
                var thresholds = elementsList[index].elements;
                for (var newIndex in thresholds) {
                    var threshold = {
                        color: thresholds[newIndex].attributes.Color,
                        label: thresholds[newIndex].elements[0].attributes.Label,
                        from: thresholds[newIndex].elements[0].attributes.From
                    };
                    thresholds.push(threshold);
                };
            };
        };

        return thresholds;
    };

    getSelectString(scoreObject) {
        var selectArray = [this._name];
        var scoreArray = this.getCompositeString(scoreObject, selectArray);

        return scoreArray.join('');
    };

    getCompositeString(scoreObject, stringArray) {
        var currentSelection;
        var scoreArray = [];
        for (index in scoreObject.childs) {
            currentSelection = scoreObject.childs[index];
            if (currentSelection.type === 'leaf') {
                scoreArray.push(this.getLeafString(stringArray, currentSelection.name));
            } else {
                scoreArray = scoreArray.concat(this.getCompositeString(currentSelection, stringArray));
            };
        };

        return scoreArray;
    };

    getLeafString(stringArray, leafScoreName) {
        var scoreString;
        var currentArray = stringArray;
        currentArray.push(leafScoreName);
        scoreString = `#"score:${currentArray.join('/')}" `;
        scoreString += `#"score:${currentArray.join('/')}/payload" `;
        currentArray.pop();

        return scoreString;
    };

    getDocuments(scoreObject) {
        var documents = [];
        if (scoreObject.isMain && scoreObject.document) {
            documents.push(scoreObject.document);
        };
        for (index in scoreObject.childs) {
            var currentSelection = scoreObject.childs[index];
            if (currentSelection.document) {
                documents.push(currentSelection.document);
            };
            if (currentSelection.type === 'composite') {
                documents = documents.concat(this.getDocuments(currentSelection));
            };
        };
        return documents;
    };

    getNormalizations(scoreObject, mainScoreName) {
        var normalizations = {};
        for (index in scoreObject.childs) {
            var currentSelection = scoreObject.childs[index];
            if (currentSelection.type === 'leaf') {
                var payloadName = 'score:'.concat(mainScoreName, '/', currentSelection.name, '/payload');
                normalizations[payloadName] = currentSelection.normalization;
            } else {
                Object.assign(normalizations, this.getNormalizations(currentSelection, mainScoreName));
            };
        };
        return normalizations;
    };

    calcColor(value) {
        var result;
        for (var index in this._thresholds) {
            if (value >= this._thresholds[index].from) {
                result = this._thresholds[index];
            };
        };
        return result.color;
    };
};