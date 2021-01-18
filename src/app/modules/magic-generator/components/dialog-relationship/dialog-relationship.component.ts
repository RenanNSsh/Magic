import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Relationship, RelationshipJSON } from '../../models/relationship';

@Component({
  selector: 'magic-dialog-relationship',
  templateUrl: './dialog-relationship.component.html',
  styleUrls: ['./dialog-relationship.component.scss']
})
export class DialogRelationshipComponent implements OnInit {
  
  relationships: Relationship[] = [
    {
      value: RelationshipJSON.OneToOne,
      viewValue: 'Um para Um'
    },
    {
      value: RelationshipJSON.OneToMany,
      viewValue: 'Um para Muitos'
    },
    {
      value: RelationshipJSON.ManyToOne,
      viewValue: 'Muitos para Um'
    },
    {
      value: RelationshipJSON.ManyToMany,
      viewValue: 'Muitos para Muitos'
    },
  ];
  
  relationship: Relationship;

  invalidField = 'citize';

  constructor(@Inject(MAT_DIALOG_DATA) public data) { }

  ngOnInit(): void {
  }


  onResetClick(): void{

  }

}
