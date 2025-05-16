import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  error: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  searchTerm: string = '';
  selectedDistributorId: string = '';
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  selectedClient: any = null;
  clientForm: FormGroup;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      video_url: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadDistributors();
    this.loadClients();
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

  openAddModal() {
    this.clientForm.reset();
    this.showAddModal = true;
  }

  openEditModal(client: any) {
    this.selectedClient = client;
    this.clientForm.patchValue({
      name: client.name,
      video_url: client.video_url
    });
    this.showEditModal = true;
  }

  onSubmit() {
    if (this.clientForm.valid) {
      const clientData = this.clientForm.value;
      if (this.showEditModal) {
        this.apiService.updateClient(this.selectedClient.id, clientData)
          .subscribe({
            next: () => {
              this.showEditModal = false;
              this.loadClients();
            },
            error: (error) => {
              this.error = 'Error al actualizar el cliente';
            }
          });
      } else {
        this.apiService.createClient(clientData)
          .subscribe({
            next: () => {
              this.showAddModal = false;
              this.loadClients();
            },
            error: (error) => {
              this.error = 'Error al crear el cliente';
            }
          });
      }
    }
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

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
} 