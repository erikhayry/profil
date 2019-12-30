import {isDiff} from "./data-handler";

describe('data-handler', function() {
    it('isDiff', function () {
        expect( isDiff(undefined, undefined)).toBeFalsy();
        expect( isDiff(null, undefined)).toBeFalsy();
        expect( isDiff({
            key: 1
        }, {
            key: 2
        })).toBeTruthy();
        expect( isDiff({
            key: 1
        }, {
            key: 1
        })).toBeFalsy();
    });
})