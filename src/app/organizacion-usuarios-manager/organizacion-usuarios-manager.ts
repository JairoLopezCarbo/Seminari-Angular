import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../models/usuario.model';
import { UsuarioService } from '../services/usuario.service';

@Component({
  selector: 'app-organizacion-usuarios-manager',
  imports: [ReactiveFormsModule],
  templateUrl: './organizacion-usuarios-manager.html',
  styleUrl: './organizacion-usuarios-manager.css',
})
export class OrganizacionUsuariosManager {
  @Input({ required: true }) organizacionId = '';
  @Input() usuarios: Usuario[] = [];
  @Output() changed = new EventEmitter<void>();

  showAddForm = false;
  loading = false;
  errorMsg = '';

  form!: FormGroup;

  constructor(private fb: FormBuilder, private usuarioService: UsuarioService) {
    this.form = this.fb.nonNullable.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Toggles the add-user form visibility.
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.errorMsg = '';
  }

  // Creates a user linked to the selected organization.
  addUsuario(): void {
    if (!this.organizacionId || this.form.invalid) {
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const values = this.form.getRawValue();
    this.usuarioService
      .createUsuarioInOrganizacion(this.organizacionId, {
        name: values.name ?? '',
        email: values.email ?? '',
        password: values.password ?? '',
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.form.reset();
          this.showAddForm = false;
          this.changed.emit();
        },
        error: () => {
          this.loading = false;
          this.errorMsg = 'Could not create the user.';
        },
      });
  }

  // Unlinks a user from the selected organization.
  removeUsuario(usuario: Usuario): void {
    if (!usuario) {
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.usuarioService
      .removeUsuarioFromOrganizacion(usuario)
      .subscribe({
        next: () => {
          this.loading = false;
          this.changed.emit();
        },
        error: () => {
          this.loading = false;
          this.errorMsg = 'Could not remove the user from organization.';
        },
      });
  }
}
