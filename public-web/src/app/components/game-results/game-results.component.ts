import { Component, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { ApiService } from '../../services/api.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GameResult, GameResultsResponse, ClientResponse } from '../../interfaces/game.interface';

@Component({
  selector: 'app-game-results',
  templateUrl: './game-results.component.html',
  styleUrls: ['./game-results.component.scss']
})
export class GameResultsComponent implements OnInit {
  results: GameResult[] = [];
  clients: any[] = [];
  distributors: any[] = [];
  filteredClients: any[] = [];
  loading: boolean = false;
  error: string | null = null;
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  
  // Filtros
  selectedClientId: string = '';
  selectedDistributorId: string = '';
  dateFilter: string = '';
  
  constructor(
    private gameService: GameService,
    private authService: AuthService,
    private router: Router,
    private clientService: ClientService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadDistributors();
    this.loadClients();
    this.loadResults();
  }

  loadDistributors() {
    this.apiService.getDistributors(1, 100).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.distributors = response.distributors;
        }
      },
      error: (err: Error) => {
        console.error('Error loading distributors:', err);
      }
    });
  }

  loadClients() {
    this.clientService.getClients().subscribe({
      next: (response: ClientResponse) => {
        if (response.success) {
          this.clients = response.clients;
          this.filterClientsByDistributor();
        }
      },
      error: (err: Error) => {
        console.error('Error loading clients:', err);
      }
    });
  }

  filterClientsByDistributor() {
    if (this.selectedDistributorId) {
      this.filteredClients = this.clients.filter(client => 
        client.distributor_id === parseInt(this.selectedDistributorId)
      );
    } else {
      this.filteredClients = this.clients;
    }
    // Resetear el cliente seleccionado si no está en la lista filtrada
    if (this.selectedClientId && !this.filteredClients.some(c => c.id === parseInt(this.selectedClientId))) {
      this.selectedClientId = '';
    }
  }

  onDistributorChange() {
    this.filterClientsByDistributor();
    this.currentPage = 1;
    this.loadResults();
  }

  loadResults() {
    this.loading = true;
    this.error = null;
    
    const params: {
      page: number;
      limit: number;
      date: string;
      client?: string;
      distributor?: string;
    } = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      date: this.dateFilter
    };

    if (this.selectedClientId) {
      params.client = this.selectedClientId;
    }
    if (this.selectedDistributorId) {
      params.distributor = this.selectedDistributorId;
    }
    
    this.gameService.getGameResults(params).subscribe((response: GameResultsResponse) => {
      this.results = response.results;
      this.totalItems = response.total;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      this.loading = false;
    }, (err: Error) => {
      this.error = 'Error al cargar los resultados';
      this.loading = false;
    });
  }

  clearFilters() {
    this.selectedClientId = '';
    this.selectedDistributorId = '';
    this.dateFilter = '';
    this.currentPage = 1;
    this.filterClientsByDistributor();
    this.loadResults();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadResults();
  }

  onPageSizeChange() {
    this.currentPage = 1; // Reset to first page when changing page size
    this.loadResults();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  logout() {
    this.authService.logout();
  }

  downloadPDF() {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Mondelez Game', doc.internal.pageSize.width / 2, 20, { align: 'center' });
    
    // Tabla
    const tableData = this.results.map(result => [
      result.client_name || '',
      this.formatDate(result.date),
      this.formatTime(result.created_at),
      result.result
    ]);

    autoTable(doc, {
      head: [['Cliente', 'Fecha', 'Hora', 'Resultado']],
      body: tableData,
      startY: 30,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255
      }
    });

    // Guardar el PDF
    doc.save('resultados-juego.pdf');
  }
} 