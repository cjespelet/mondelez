import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-distributors',
  templateUrl: './distributors.component.html',
  styleUrls: ['./distributors.component.scss']
})
export class DistributorsComponent implements OnInit {
  distributors: any[] = [];
  loading: boolean = false;
  error: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  searchTerm: string = '';
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  selectedDistributor: any = null;
  distributorForm: FormGroup;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.distributorForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      city: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  ngOnInit() {
    this.loadDistributors();
  }

  loadDistributors() {
    this.loading = true;
    this.apiService.getDistributors(this.currentPage, this.itemsPerPage, this.searchTerm)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.distributors = response.distributors;
            this.totalItems = response.pagination.total;
            this.loading = false;
          } else {
            this.error = 'Error al cargar los distribuidores';
            this.loading = false;
          }
        },
        error: (error) => {
          this.error = 'Error al cargar los distribuidores';
          this.loading = false;
        }
      });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadDistributors();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadDistributors();
  }

  openAddModal() {
    this.distributorForm.reset();
    this.showAddModal = true;
  }

  openEditModal(distributor: any) {
    this.selectedDistributor = distributor;
    this.distributorForm.patchValue({
      name: distributor.name,
      city: distributor.city
    });
    this.showEditModal = true;
  }

  onSubmit() {
    if (this.distributorForm.valid) {
      const distributorData = this.distributorForm.value;
      if (this.showEditModal) {
        this.apiService.updateDistributor(this.selectedDistributor.id, distributorData)
          .subscribe({
            next: () => {
              this.showEditModal = false;
              this.loadDistributors();
            },
            error: (error) => {
              this.error = 'Error al actualizar el distribuidor';
            }
          });
      } else {
        this.apiService.createDistributor(distributorData)
          .subscribe({
            next: () => {
              this.showAddModal = false;
              this.loadDistributors();
            },
            error: (error) => {
              this.error = 'Error al crear el distribuidor';
            }
          });
      }
    }
  }

  deleteDistributor(distributorId: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este distribuidor?')) {
      this.apiService.deleteDistributor(distributorId)
        .subscribe({
          next: () => {
            this.loadDistributors();
          },
          error: (error) => {
            this.error = 'Error al eliminar el distribuidor';
          }
        });
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
} 