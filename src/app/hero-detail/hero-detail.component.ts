import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { states, Hero, Address } from "../data-model.component";
import { HeroService } from '../hero.service';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css']
})

export class HeroDetailComponent implements OnChanges {
  get secretLairs(): FormArray {
    return this.heroForm.get('secretLairs') as FormArray;
  };

  heroForm: FormGroup;
  nameChangeLog: string[] = [];
  states = states;

  @Input() hero: Hero;

  constructor(private fb: FormBuilder, private heroService: HeroService) {
    this.createForm();
    this.logNameChange();
  }

  ngOnChanges() {
    this.rebuildForm();

  }

  addLair() {
    this.secretLairs.push(this.fb.group(new Address()));
  }

  logNameChange() { 
    const nameControl = this.heroForm.get("name");
    nameControl.valueChanges.pipe(debounceTime(2000)).forEach(
      (value: string) => {
        if (!this.nameChangeLog.includes(value)) {
          this.nameChangeLog.push(value);
        }
      }
    );
  }

  removeLair(index: number) {
    this.secretLairs.removeAt(index);
  }

  createForm() {
    this.heroForm = this.fb.group({ // <-- the parent FormGroup
      name: ['', Validators.required ],
      secretLairs: this.fb.array([]),
      power: '',
      sidekick: ''
    });
  } 

  onSubmit() {
    this.hero = this.prepareSaveHero();
    this.heroService.updateHero(this.hero).subscribe(/* error handling */);
    this.rebuildForm();
  }

  prepareSaveHero(): Hero {
    const formModel = this.heroForm.value;

    // deep copy of form model lairs
    const secretLairsDeepCopy: Address[] = formModel.secretLairs.map(
      (address: Address) => Object.assign({}, address)
    )

    // return new `Hero` object containing a combination of original hero value(s)
    // and deep copies of changed form model values
    const saveHero: Hero = {
      id: this.hero.id,
      name: formModel.name as string, 
      // addresses: formModel.secretLairs // <-- bad!
      addresses: secretLairsDeepCopy
    };

    return saveHero;
  }
  
  rebuildForm(): any {
    this.heroForm.reset({
      name: this.hero.name
    });
    this.setAddresses(this.hero.addresses);
  }

  revert() {
    this.rebuildForm();
  }

  setAddresses(addresses: Address[]) {
    const addressFGs = addresses.map(address => this.fb.group(address));
    const addressFormArray = this.fb.array(addressFGs);
    this.heroForm.setControl('secretLairs', addressFormArray);
  }
}