import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { ApiService } from '../../services/api.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  clients: any[] = [];
  distributors: any[] = [];
  loading: boolean = false;
  error: string | null = null;
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  editingClientId: number | null = null;
  clientForm: FormGroup;
  searchTerm: string = '';
  selectedDistributorId: string = '';
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  selectedFile: File | null = null;
  apiUrl = environment.apiUrl;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private apiService: ApiService,
    private http: HttpClient
  ) {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      video_url: ['', Validators.required],
      distributor_id: ['', Validators.required],
      transition_image: [null]
    });
  }

  ngOnInit() {
    this.loadClients();
    this.loadDistributors();
  }

  closeModal() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.editingClientId = null;
    this.selectedFile = null;
    this.clientForm.reset();
    this.clientForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.clientForm.get('password')?.updateValueAndValidity();
  }

  openAddModal() {
    this.showAddModal = true;
    this.showEditModal = false;
    this.clientForm.reset();
    this.clientForm.patchValue({
      name: '',
      username: '',
      password: '',
      video_url: '',
      distributor_id: '',
      transition_image: null
    });
    this.clientForm.get('username')?.setValidators([Validators.required]);
    this.clientForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.clientForm.get('distributor_id')?.setValidators([Validators.required]);
    this.clientForm.get('username')?.updateValueAndValidity();
    this.clientForm.get('password')?.updateValueAndValidity();
    this.clientForm.get('distributor_id')?.updateValueAndValidity();
  }

  openEditModal(client: any) {
    this.showEditModal = true;
    this.showAddModal = false;
    this.editingClientId = client.id;
    this.clientForm.reset();
    this.clientForm.patchValue({
      name: client.name,
      video_url: client.video_url,
      distributor_id: client.distributor_id,
      transition_image: client.transition_image
    });
    this.clientForm.get('password')?.clearValidators();
    this.clientForm.get('password')?.updateValueAndValidity();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.clientForm.patchValue({
        transition_image: this.selectedFile
      });
    }
  }

  getImageUrl(filename: string): string {
    return `${this.apiUrl}/uploads/transition-images/${filename}`;
  }

  onSubmit() {
    // Verificamos solo los campos requeridos, excluyendo transition_image
    const requiredFields = ['name', 'video_url', 'distributor_id'];
    let isFormValid = requiredFields.every(field => this.clientForm.get(field)?.valid ?? false);
    
    // Para el modal de agregar, también verificamos username y password
    if (this.showAddModal) {
      const usernameValid = this.clientForm.get('username')?.valid ?? false;
      const passwordValid = this.clientForm.get('password')?.valid ?? false;
      isFormValid = isFormValid && usernameValid && passwordValid;
    }

    if (isFormValid) {
      const formData = new FormData();
      
      // Agregar todos los campos del formulario al FormData
      Object.keys(this.clientForm.value).forEach(key => {
        if (key === 'transition_image' && this.selectedFile) {
          formData.append(key, this.selectedFile);
        } else if (this.clientForm.get(key)?.value !== null) {
          formData.append(key, this.clientForm.get(key)?.value);
        }
      });

      if (this.showAddModal) {
        this.http.post(`${this.apiUrl}/clients`, formData)
          .subscribe({
            next: (response: any) => {
              this.loadClients();
              this.closeModal();
            },
            error: (error) => {
              console.error('Error al crear cliente:', error);
              this.error = 'Error al crear el cliente';
            }
          });
      } else {
        const clientId = this.editingClientId;
        this.http.put(`${this.apiUrl}/clients/${clientId}`, formData)
          .subscribe({
            next: (response: any) => {
              this.loadClients();
              this.closeModal();
            },
            error: (error) => {
              console.error('Error al actualizar cliente:', error);
              this.error = 'Error al actualizar el cliente';
            }
          });
      }
    }
  }

  loadDistributors() {
    this.apiService.getDistributors(1, 100).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.distributors = response.distributors;
        }
      },
      error: (error) => {
        console.error('Error loading distributors:', error);
      }
    });
  }

  loadClients() {
    this.loading = true;
    this.apiService.getClients(this.currentPage, this.itemsPerPage, this.searchTerm, this.selectedDistributorId)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.clients = response.clients;
            this.totalItems = response.pagination.total;
            this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
            this.loading = false;
          } else {
            this.error = 'Error al cargar los clientes';
            this.loading = false;
          }
        },
        error: (error) => {
          this.error = 'Error al cargar los clientes';
          this.loading = false;
        }
      });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadClients();
  }

  onDistributorChange() {
    this.currentPage = 1;
    this.loadClients();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadClients();
  }

  deleteClient(clientId: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      this.apiService.deleteClient(clientId)
        .subscribe({
          next: () => {
            this.loadClients();
          },
          error: (error) => {
            this.error = 'Error al eliminar el cliente';
          }
        });
    }
  }
} 