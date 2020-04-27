const path = require('path');

exports.rootDir = path.dirname(process.mainModule.filename);

// Function that will convert a value depending on the format
exports.transform = (payload, format) => {
    console.log('CONVERTING:\t', payload, 'using format:', format);
    var strreturn = payload;
    if (format === 'datetime') {
        return payload.replace('T', ' @ ');
    } else if (format === 'mac_address') {
        return payload.toString().split(',').join(' , ');
    } else {
        var temp = parseFloat(payload);
        switch (format) {
            case 'percent':
                temp = temp * 100;
                if (temp == 0) {
                    strreturn = '0%'
                } else {
                    strreturn = temp.toFixed(0).toString() + '%';
                };
                break;
            case 'permill':
                temp = temp * 100;
                if (temp == 0) {
                    strreturn = '0%'
                } else {
                    strreturn = temp.toFixed(1).toString().replace(/\.0$/, '') + '%';
                };
                break;
            case 'byte':
                if (temp > 1099511627776) {
                    temp = temp / 1099511627776;
                    strreturn = temp.toFixed(2) + ' TB';
                    break;
                };
                if (temp > 1073741824) {
                    temp = temp / 1073741824;
                    strreturn = temp.toFixed(2) + ' GB';
                    break;
                };
                if (temp > 1048576) {
                    temp = temp / 1048576;
                    strreturn = temp.toFixed(2) + ' MB';
                    break;
                };
                if (temp > 1024) {
                    temp = temp / 1024;
                    strreturn = temp.toFixed(2) + ' KB';
                }
                strreturn = temp + 'bytes';
                break;
            case 'second':
            case 'millisecond':
            case 'microsecond':
                strreturn = time(temp, format);
                break;
            case 'mhz':
                strreturn = temp.toFixed(2) + ' MHz';
                break;
            case 'bps':
                strreturn = temp.toFixed(2) + ' bps';
                break;
            default:
                strreturn = payload;
                break;
        };
        return strreturn;
    };
};

// Function to convert a time value to a string (in second, millisecond or microsecond)
time = (value, format) => {
    var micro;
    var milli;
    var sec;
    var min;
    var hour;
    var day;
    var day_divided;
    var scientific_notation = /(e-[0-9])/;
    var return_time_value = '';
    switch (format) {
        case 'second':
            sec = value % 60;
            min = parseInt((value / 60) % 60);
            hour = parseInt((value / (60 * 60)) % 24);
            day_divided = value / (60 * 60 * 24);
            if (scientific_notation.test(day_divided)) {
                day = 0;
            } else {
                day = parseInt(day_divided);
            };
            break;
        case 'millisecond':
            milli = value % 1000;
            sec = parseInt((value / 1000) % 60);
            min = parseInt((value / (1000 * 60)) % 60);
            hour = parseInt((value / (1000 * 60 * 60)) % 24);
            day_divided = value / (1000 * 60 * 60 * 24);
            if (scientific_notation.test(day_divided)) {
                day = 0;
            } else {
                day = parseInt(day_divided);
            };
            break;
        case 'microsecond':
            micro = value % 1000;
            milli = parseInt((value / 1000) % 1000);
            sec = parseInt((value / (1000 * 1000)) % 60);
            min = parseInt((value / (1000 * 1000 * 60)) % 60);
            hour = parseInt((value / (1000 * 1000 * 60 * 60)) % 24);
            day_divided = value / (1000 * 1000 * 60 * 60 * 24);
            if (scientific_notation.test(day_divided)) {
                day = 0;
            } else {
                day = parseInt(day_divided);
            };
            break;
    };

    var milli_comma = parseInt(milli / 1000);
    var micro_comma = parseInt(((micro / 1000).toFixed(2)) * 100);

    if (day > 0 && hour > 0 && min > 0 && sec > 0) {
        return_time_value = `${day}d ${hour}h ${min}min ${sec}s`;
    } else if (day > 0 && hour > 0 && min > 0) {
        return_time_value = `${day}d ${hour}h ${min}min`;
    } else if (day > 0 && hour > 0 && sec > 0) {
        return_time_value = `${day}d ${hour}h ${sec}s`;
    } else if (day > 0 && hour > 0) {
        return_time_value = `${day}d ${hour}h`;
    } else if (day > 0 && min > 0 && sec > 0) {
        return_time_value = `${day}d ${min}min ${sec}s`;
    } else if (day > 0 && min > 0) {
        return_time_value = `${day}d ${min}min`;
    } else if (day > 0 && sec > 0) {
        return_time_value = `${day}d ${sec}s`;
    } else if (day > 0) {
        return_time_value = `${day}d`;
    } else if (hour > 0 && min > 0 && sec > 0) {
        return_time_value = `${hour}h ${min}min ${sec}s`;
    } else if (hour > 0 && min > 0) {
        return_time_value = `${hour}h ${min}min`;
    } else if (hour > 0 && sec > 0) {
        return_time_value = `${hour}h ${sec}s`;
    } else if (hour > 0) {
        return_time_value = `${hour}h`;
    } else if (min > 0 && sec > 0) {
        return_time_value = `${min}min ${sec}s`;
    } else if (sec > 0 && milli_comma > 0) {
        return_time_value = `${sec}.${milli_comma}s`;
    } else if (sec > 0) {
        return_time_value = `${sec}s`;
    } else if (milli > 0 && micro_comma > 0) {
        return_time_value = `${milli}.${micro_comma}ms`;
    } else if (milli > 0) {
        return_time_value = `${milli}ms`;
    } else {
        return_time_value = `${micro}μs`;
    };

    return return_time_value;
};

