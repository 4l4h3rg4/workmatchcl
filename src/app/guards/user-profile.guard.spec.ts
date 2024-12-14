import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { userProfileGuard } from './user-profile.guard';

describe('userProfileGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => userProfileGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
