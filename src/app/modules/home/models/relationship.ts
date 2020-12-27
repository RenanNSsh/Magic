export interface Relationship {
    value: RelationshipJSON;
    viewValue: string;
}
  
export enum RelationshipJSON{
    OneToOne,
    OneToMany,
    ManyToOne,
    ManyToMany
}

export interface RelationshipField{
    label: string;
    relationship: RelationshipJSON;
}