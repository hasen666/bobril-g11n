if (!Object.assign) {
    Object.assign = function assign(target: Object, ...sources: Object[]): Object {
        let totalArgs = arguments.length;
        for (let i = 1; i < totalArgs; i++) {
            let source = arguments[i];
            if (source == null) continue;
            let keys = Object.keys(source);
            let totalKeys = keys.length;
            for (let j = 0; j < totalKeys; j++) {
                let key = keys[j];
                (<any>target)[key] = (<any>source)[key];
            }
        }
        return target;
    }
}

declare var require: any;
var numeral = require('numeral');
var moment = require('moment');

import * as msgFormatParser from "../src/msgFormatParser";
import * as msgFormatter from '../src/msgFormatter';

describe('modules', () => {
    it('numeral works', () => {
        expect(numeral(0).format()).toBe('0');
    });
    it('moment works', () => {
        expect(moment(new Date(2000, 0, 1)).format('LTS')).toBe('12:00:00 AM');
    });
});

describe('Formatter', () => {
    function check(msg: string, params: Object, result: string, locale: string = 'en-US') {
        let ast = msgFormatParser.parse(msg);
        let fn = msgFormatter.compile(locale, ast);
        expect(fn(params)).toBe(result);
    }

    it('basic compile', () => {
        check('Hello {a}!', { a: 'World' }, 'Hello World!');
    });

    it('ordinal', () => {
        check('{floor, selectordinal, =0{ground} one{#st} two{#nd} few{#rd} other{#th}} floor', { floor: 0 }, 'ground floor');
        check('{floor, selectordinal, =0{ground} one{#st} two{#nd} few{#rd} other{#th}} floor', { floor: 3 }, '3rd floor');
        check('{floor, selectordinal, =0{ground} one{#st} two{#nd} few{#rd} other{#th}} floor', { floor: 1000 }, '1000th floor');
    });

    it('plural', () => {
        check('{numPhotos, plural, =0{no photos} =1{one photo} other{# photos}}', { numPhotos: 0 }, 'no photos');
        check('{numPhotos, plural, =0{no photos} =1{one photo} other{# photos}}', { numPhotos: 1 }, 'one photo');
        check('{numPhotos, plural, =0{no photos} =1{one photo} other{# photos}}', { numPhotos: 2 }, '2 photos');
    });

    it('select', () => {
        check('{gender, select, female {woman} male {man} other {person}}', { gender: 'female' }, 'woman');
        check('{gender, select, female {woman} male {man} other {person}}', { gender: 'male' }, 'man');
        check('{gender, select, female {woman} male {man} other {person}}', { gender: 'unknown' }, 'person');
    });

    it('number', () => {
        check('{arg, number}', { arg: 0 }, '0');
        check('{arg, number}', { arg: 1000 }, '1,000');
        check('{arg, number}', { arg: 1.234 }, '1.234');
        check('{arg, number, percent}', { arg: 0.23 }, '23%');
    });

    it('date', () => {
        check('{a, date, dddd}', { a: new Date(2000, 0, 2) }, 'Sunday');
        check('{a, date, lll}', { a: new Date(2000, 0, 2) }, 'Jan 2, 2000 12:00 AM');
        check('{a, date, LLLL}', { a: new Date(2000, 0, 2) }, 'Sunday, January 2, 2000 12:00 AM');
        check('{a, date, custom, format:{DD MM}}', { a: new Date(2000, 0, 2) }, '02 01');
        check('{a, date, custom, format:{{myformat}} }', { a: new Date(2000, 0, 2), myformat: 'ddd' }, 'Sun');
    });

    it('calendar', () => {
        check('{a, date, calendar}', { a: moment(Date.now()).add(1, 'd').hour(10).minute(30).second(0) }, 'Tomorrow at 10:30 AM');
    });

    it('relative', () => {
        check('{a, time, relative}', { a: Date.now() - 1000 }, 'a few seconds ago');
        check('{a, time, relative}', { a: Date.now() - 100000 }, '2 minutes ago');
        check('{a, time, relative}', { a: Date.now() + 10000000 }, 'in 3 hours');
        check('{a, time, relative, noago}', { a: Date.now() + 100000 }, '2 minutes');
    });
});