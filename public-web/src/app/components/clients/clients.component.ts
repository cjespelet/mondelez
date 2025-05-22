import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { ApiService } from '../../services/api.service';

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

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private apiService: ApiService
  ) {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      video_url: ['', Validators.required]
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
    this.clientForm.reset();
    this.error = null;
  }

  openAddModal() {
    this.showAddModal = true;
    this.showEditModal = false;
    this.clientForm.reset();
    this.clientForm.patchValue({
      name: '',
      username: '',
      password: '',
      video_url: ''
    });
    // Establecer validadores para crear
    this.clientForm.get('username')?.setValidators([Validators.required]);
    this.clientForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.clientForm.get('username')?.updateValueAndValidity();
    this.clientForm.get('password')?.updateValueAndValidity();
  }

  openEditModal(client: any) {
    this.showEditModal = true;
    this.showAddModal = false;
    this.editingClientId = client.id;
    this.clientForm.reset();
    this.clientForm.patchValue({
      name: client.name,
      video_url: client.video_url,
      password: '' // Inicializar password vacío
    });
    // Remover validadores requeridos para editar
    this.clientForm.get('username')?.clearValidators();
    this.clientForm.get('password')?.setValidators([Validators.minLength(6)]); // Solo validar longitud mínima
    this.clientForm.get('username')?.updateValueAndValidity();
    this.clientForm.get('password')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.clientForm.invalid) return;

    const formData = this.clientForm.value;
    
    if (this.showAddModal) {
      // Crear nuevo cliente
      this.clientService.createClient(formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.closeModal();
            this.loadClients();
          }
        },
        error: (error) => {
          console.error('Error al crear cliente:', error);
          this.error = 'Error al crear el cliente';
        }
      });
    } else if (this.showEditModal && this.editingClientId !== null) {
      // Editar cliente existente
      const editData = {
        name: formData.name,
        video_url: formData.video_url,
        password: formData.password || undefined // Solo enviar password si se proporcionó uno nuevo
      };
      
      this.clientService.updateClient(this.editingClientId, editData).subscribe({
        next: (response) => {
          if (response.success) {
            this.closeModal();
            this.loadClients();
          }
        },
        error: (error) => {
          console.error('Error al actualizar cliente:', error);
          this.error = 'Error al actualizar el cliente';
        }
      });
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