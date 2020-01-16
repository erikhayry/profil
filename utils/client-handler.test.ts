import {getClient} from "./client-handler";
import {SUPPORTED_CLIENT} from "../typings/index";

describe('client-handler', function() {
    it('getClient', function () {
        let client = getClient('https://www.svtplay.se');
        expect(client.id).toMatch(SUPPORTED_CLIENT.SVT);
    });
})
