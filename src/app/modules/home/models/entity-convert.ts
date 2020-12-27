import { RelationshipField } from './relationship';

export interface EntityConvert{
    name: string;
    basePackage: string;
    json: string;
    relationships: RelationshipField[];
}