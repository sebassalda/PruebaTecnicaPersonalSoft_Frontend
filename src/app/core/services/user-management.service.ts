import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PageResponse } from '../models/brp';

import {
  UserResponse,
  CreateUserRequest,
  UpdateUserStatusRequest,
  UpdateUserModulesRequest
} from '../models/user-management';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  private readonly http = inject(HttpClient);
  private readonly API_URL = '/api/users';

  getUsers(
    page = 0,
    size = 10
  ): Observable<PageResponse<UserResponse>> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<UserResponse>>(
      this.API_URL,
      { params }
    );
  }

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(
      `${this.API_URL}/${id}`
    );
  }

  createUser(
    request: CreateUserRequest
  ): Observable<UserResponse> {
    return this.http.post<UserResponse>(
      this.API_URL,
      request
    );
  }

  updateStatus(
    id: number,
    request: UpdateUserStatusRequest
  ): Observable<UserResponse> {
    return this.http.patch<UserResponse>(
      `${this.API_URL}/${id}/status`,
      request
    );
  }

  updateModules(
    id: number,
    request: UpdateUserModulesRequest
  ): Observable<UserResponse> {
    return this.http.put<UserResponse>(
      `${this.API_URL}/${id}/modules`,
      request
    );
  }
}