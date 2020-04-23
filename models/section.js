module.exports = class section {
    constructor(jsonSection) {
        this._title = this.getTitle(jsonSection.elements);
        this._content = this.parseContent(jsonSection.elements);
    };

    get content() {
        return this._content;
    };

    get title() {
        return this._title;
    };

    getTitle(arrayJson) {
        if (arrayJson[0].name === 'Title') {
            return arrayJson[0].elements[0].text;
        } else {
            return '';
        };
    };

    parseContent(arrayJson) {
        var elements = [];
        for (index in arrayJson) {
            if (arrayJson[index].name === 'Description') {
                var element = {
                    type: 'Description',
                    content: arrayJson[index].elements[0].text
                };
                elements.push(element);
            } else if (arrayJson[index].name === 'HTTP') {
                var http = {
                    text: arrayJson[index].elements[0].text,
                    url: arrayJson[index].attributes.href
                };
                var element = {
                    type: 'HTTP',
                    content: http
                };
                elements.push(element);
            } else if (arrayJson[index].name === 'RemoteAction') {
                if (arrayJson[index].attributes.name) {
                    var ra = {
                        name: arrayJson[index].attributes.name,
                        UID: arrayJson[index].attributes.UID
                    };
                } else {
                    var ra = {
                        name: arrayJson[index].attributes.UID,
                        UID: arrayJson[index].attributes.UID
                    };
                };
                var element = {
                    type: 'RemoteAction',
                    content: ra
                };
                elements.push(element);
            }
        };
        return elements;
    };

};