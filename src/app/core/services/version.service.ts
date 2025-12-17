import { Injectable } from '@angular/core';
import { RELEASE } from '../../../environments/release';

@Injectable({ providedIn: 'root' })
export class VersionService {
  getVersion() {
    return RELEASE.version || 'dev';
  }
  getTag() {
    return RELEASE.tag || '';
  }
  getCommit() {
    return RELEASE.commit || '';
  }
  getRelease() {
    return RELEASE;
  }
}
