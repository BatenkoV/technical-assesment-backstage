import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersTilesViewComponent } from './users-tiles-view.component';

describe('UsersTilesViewComponent', () => {
  let component: UsersTilesViewComponent;
  let fixture: ComponentFixture<UsersTilesViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersTilesViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersTilesViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
