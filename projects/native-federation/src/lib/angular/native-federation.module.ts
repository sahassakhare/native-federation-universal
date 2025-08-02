import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NativeFederationService } from './native-federation.service';
import { LoadFederatedComponentDirective } from './directives/load-federated-component.directive';

@NgModule({
  declarations: [
    LoadFederatedComponentDirective
  ],
  imports: [
    CommonModule
  ],
  providers: [
    NativeFederationService
  ],
  exports: [
    LoadFederatedComponentDirective
  ]
})
export class NativeFederationModule { }