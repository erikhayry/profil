import {getCurrentUser} from "./get-current-data";
import {IApp, IServerUser, IStorageKeyWithData, SUPPORTED_CLIENT} from "../../typings/index";
import server, {IServer} from "../../utils/server";
import {randomAvatar} from "../../ui/src/components/avatar-customizer/avatar-options";

jest.mock("../../utils/server");
const mockedServer: jest.Mocked<IServer> = server as any;
mockedServer.setData.mockImplementation((appData:IApp) => Promise.resolve({
    ...appData
}));

function mockUser(id: string, client?: SUPPORTED_CLIENT, data?: IStorageKeyWithData[]): IServerUser{
    const user = {
        name: 'Ny användare',
        id: id,
        avatar: randomAvatar(),
        clientsData: {},
        created: 1
    };

    if(client && data){
        user.clientsData = {
            [SUPPORTED_CLIENT.SVT]: data
        }
    }


    return user;
}

const client = SUPPORTED_CLIENT.SVT;
const clientNoUserData: IStorageKeyWithData[] = [
    {
        key: 'persistent_state'
    }
];

describe('getCurrentData - no client user', () =>{
    let users: IServerUser[] = [mockUser('1')];
    let currentUser: IServerUser;

    beforeEach( () => {
        mockedServer.getData.mockImplementation(() => Promise.resolve({
            users
        }));
    });

    it('one server user, no server user data', async () => {
        currentUser = await getCurrentUser(client);

        expect(currentUser.id).toEqual('1');
        expect(currentUser.name).toEqual('Ny användare');
        expect(currentUser.clientsData[SUPPORTED_CLIENT.SVT]).toBeUndefined();
    });

    it('one server user, server user data', async () => {
        currentUser = await getCurrentUser(client);

        users[0].clientsData = {
            [SUPPORTED_CLIENT.SVT]: [
                {
                    key: 'persistent_state',
                    data: 'client data'
                }
            ]};

        expect(currentUser.id).toEqual('1');
        expect(currentUser.name).toEqual('Ny användare');
        expect(currentUser.clientsData[SUPPORTED_CLIENT.SVT][0].data).toMatch('client data');
        expect(currentUser.clientsData[SUPPORTED_CLIENT.SVT][0].key).toMatch('persistent_state');
    });

    it('multiple server user, server user data and no data, no client data, no client user', async () => {
        users.push(mockUser('2'));
        currentUser = await getCurrentUser(client);

        expect(currentUser).toBeUndefined();
    });
});

describe('getCurrentData - client user', () =>{
    const clientUserId = '123';
    let users: IServerUser[] = [mockUser(clientUserId)];
    let currentUser: IServerUser;

    beforeEach( () => {
        mockedServer.getData.mockImplementation(() => Promise.resolve({
            users
        }));
    });

    it('one server user, no server user data', async () => {
        currentUser = await getCurrentUser(client, clientUserId);

        expect(currentUser.id).toEqual(clientUserId);
        expect(currentUser.name).toEqual('Ny användare');
        expect(currentUser.clientsData[SUPPORTED_CLIENT.SVT]).toBeUndefined();
    });

    it('one server user, server user data', async () => {
        currentUser = await getCurrentUser(client, clientUserId);

        users[0].clientsData = {
            [SUPPORTED_CLIENT.SVT]: [
                {
                    key: 'persistent_state',
                    data: 'client data'
                }
            ]};

        expect(currentUser.id).toEqual(clientUserId);
        expect(currentUser.name).toEqual('Ny användare');
        expect(currentUser.clientsData[SUPPORTED_CLIENT.SVT][0].data).toMatch('client data');
        expect(currentUser.clientsData[SUPPORTED_CLIENT.SVT][0].key).toMatch('persistent_state');
    });

    it('multiple server user, server user data and no data, no client data', async () => {
        users.push(mockUser('2'));
        currentUser = await getCurrentUser(client, clientUserId);

        expect(currentUser.id).toEqual(clientUserId);
        expect(currentUser.name).toEqual('Ny användare');
        expect(currentUser.clientsData[SUPPORTED_CLIENT.SVT][0].data).toMatch('client data');
        expect(currentUser.clientsData[SUPPORTED_CLIENT.SVT][0].key).toMatch('persistent_state');
    });
});
