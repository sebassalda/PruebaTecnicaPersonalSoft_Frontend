import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { UserManagementService } from '../../core/services/user-management.service';

import {
  UserResponse,
  UserRole
} from '../../core/models/user-management';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTableModule,
    MatPaginatorModule
  ],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss'
})
export class UserManagement implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UserManagementService);
  private readonly router = inject(Router);

  readonly users = signal<UserResponse[]>([]);
  readonly selectedUser = signal<UserResponse | null>(null);

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly message = signal('');
  readonly error = signal('');

  readonly totalElements = signal(0);

  pageIndex = 0;
  pageSize = 10;

  readonly displayedColumns = [
    'id',
    'nombre',
    'email',
    'role',
    'activo',
    'acciones'
  ];

  readonly roles: UserRole[] = [
    'ADMINISTRADOR',
    'RADICADOR',
    'ANALISTA',
    'JEFE'
  ];

  readonly availableModules = [
    'BRP_CATALOG',
    'OFFER_REGISTRATION',
    'OFFER_TRACKING',
    'OFFER_MANAGEMENT',
    'OFFER_APPROVAL',
    'USER_MANAGEMENT'
  ];

  readonly createForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.minLength(12)]],
    role: this.fb.nonNullable.control<UserRole>('RADICADOR')
  });

  readonly selectedModules = signal<string[]>([]);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set('');

    this.service.getUsers(this.pageIndex, this.pageSize)
      .subscribe({
        next: response => {
          this.users.set(response.content);
          this.totalElements.set(response.totalElements);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No fue posible consultar los usuarios.');
          this.loading.set(false);
        }
      });
  }

  changePage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  createUser(): void {
    if (this.createForm.invalid || this.saving()) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.error.set('');

    this.service.createUser(this.createForm.getRawValue())
      .subscribe({
        next: user => {
          this.message.set(`Usuario ${user.email} creado correctamente.`);
          this.createForm.reset({
            nombre: '',
            email: '',
            password: '',
            role: 'RADICADOR'
          });

          this.pageIndex = 0;
          this.loadUsers();
          this.saving.set(false);
        },
        error: () => {
          this.error.set('No fue posible crear el usuario.');
          this.saving.set(false);
        }
      });
  }

  selectUser(user: UserResponse): void {
    this.selectedUser.set(user);
    this.selectedModules.set([...user.modules]);
    this.message.set('');
    this.error.set('');
  }

  isModuleSelected(module: string): boolean {
    return this.selectedModules().includes(module);
  }

  toggleModule(module: string, checked: boolean): void {
    this.selectedModules.update(current =>
      checked
        ? [...new Set([...current, module])]
        : current.filter(item => item !== module)
    );
  }

  saveModules(): void {
    const user = this.selectedUser();

    if (!user || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.error.set('');

    this.service.updateModules(user.id, {
      modules: this.selectedModules()
    }).subscribe({
      next: updated => {
        this.selectedUser.set(updated);
        this.selectedModules.set([...updated.modules]);
        this.message.set('Módulos actualizados correctamente.');
        this.loadUsers();
        this.saving.set(false);
      },
      error: () => {
        this.error.set('No fue posible actualizar los módulos.');
        this.saving.set(false);
      }
    });
  }

  changeStatus(user: UserResponse): void {
    if (this.saving()) {
      return;
    }

    const action = user.activo ? 'desactivar' : 'activar';

    if (!window.confirm(`¿Deseas ${action} a ${user.email}?`)) {
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.error.set('');

    this.service.updateStatus(user.id, {
      activo: !user.activo
    }).subscribe({
      next: updated => {
        this.message.set('Estado actualizado correctamente.');

        if (this.selectedUser()?.id === updated.id) {
          this.selectedUser.set(updated);
        }

        this.loadUsers();
        this.saving.set(false);
      },
      error: () => {
        this.error.set('No fue posible actualizar el estado del usuario.');
        this.saving.set(false);
      }
    });
  }

  goHome(): void {
    void this.router.navigate(['/home']);
  }
}