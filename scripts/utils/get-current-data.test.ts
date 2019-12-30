import {getCurrentUserData} from "./get-current-data";
import {IApp, IStorageKeyWithData, SUPPORTED_CLIENT} from "../../typings/index";
import storage, {IStorage} from "../../utils/storage";
import {randomAvatar} from "../../ui/src/components/avatar-customizer/avatar-options";
jest.mock("../../utils/storage");


const mockedStorage: jest.Mocked<IStorage> = storage as any;
mockedStorage.getData.mockImplementation(() => Promise.resolve({
    users: [
        {
            name: 'Ny användare',
            id: '1',
            avatar: randomAvatar(),
            clientsData: {}
        }
    ]
}));

mockedStorage.setData.mockImplementation((appData:IApp) => Promise.resolve({
    ...appData
}));

mockedStorage.getUser.mockImplementation((userId:string) => Promise.resolve({
    name: 'Ny användare',
    id: userId,
    avatar: randomAvatar(),
    clientsData: {}
}));

const client = SUPPORTED_CLIENT.SVT;


describe('getCurrentData', function() {
    it('no server user, no client data, no user', async () => {
        const clientUserData: IStorageKeyWithData[] = [
            {
                key: 'persistent_state'
            }
        ];

        const currentUser = await getCurrentUserData(client, clientUserData);

        expect(currentUser.id).toEqual('1');
        expect(currentUser.name).toEqual('Ny användare');
        expect(currentUser.clientsData[SUPPORTED_CLIENT.SVT]).toBeUndefined();
    });

    it('no server user, client data, no user', async () => {
        const clientUserData: IStorageKeyWithData[] = [
            {
                key: 'persistent_state',
                data: 'client data'
            }
        ];
        mockedStorage.setUserData.mockImplementation((userId: string, storageKeysWithData: IStorageKeyWithData[], client: SUPPORTED_CLIENT) => Promise.resolve({
            name: 'Ny användare',
            id: userId,
            avatar: randomAvatar(),
            clientsData: {
                [SUPPORTED_CLIENT.SVT]: clientUserData
            }
        }));

        const currentUser = await getCurrentUserData(client, clientUserData);

        expect(currentUser.id).toEqual('1');
        expect(currentUser.name).toEqual('Ny användare');
        expect(currentUser.clientsData[SUPPORTED_CLIENT.SVT][0].key).toMatch('persistent_state');
        expect(currentUser.clientsData[SUPPORTED_CLIENT.SVT][0].data).toMatch('client data');
    });
})