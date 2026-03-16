import { Storage } from '../storage/storage';
import { WorkspacesStorage } from '../storage/workspaces';
import { KeysClient } from './keys';
export interface Client {
    keys: KeysClient;
    workspaces: Omit<WorkspacesStorage, "list">;
    admin: Storage;
}
declare const Client: (options: {
    storage: Storage;
}) => Client;
export default Client;
