import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportService, ClientReport } from '../../services/report.service';

@Component({
  selector: 'app-reports-list',
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.scss']
})
export class ReportsListComponent implements OnInit {
  clientId!: number;
  clientName: string = '';
  reports: ClientReport[] = [];
  loading: boolean = false;
  error: string | null = null;

  // pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  addForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private reportService: ReportService
  ) {
    this.addForm = this.fb.group({
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\//i)]]
    });
  }

  ngOnInit() {
    this.clientId = Number(this.route.snapshot.paramMap.get('id'));
    this.clientName = this.route.snapshot.queryParamMap.get('name') || `Cliente ${this.clientId}`;
    this.loadReports();
  }

  loadReports() {
    this.loading = true;
    this.error = null;
    this.reportService.getReports(this.clientId, this.currentPage, this.itemsPerPage)
      .subscribe({
        next: (res) => {
          const sorted = [...res.data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          this.reports = sorted;
          this.totalItems = res.total ?? sorted.length;
          this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
          this.loading = false;
        },
        error: () => {
          this.error = 'Error al cargar reportes';
          this.loading = false;
        }
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadReports();
  }

  addReport() {
    if (this.addForm.invalid) return;
    const url = this.addForm.value.url.trim();
    this.loading = true;
    this.reportService.addReport(this.clientId, url).subscribe({
      next: () => {
        this.addForm.reset();
        this.loadReports();
      },
      error: () => {
        this.error = 'No se pudo agregar el reporte';
        this.loading = false;
      }
    });
  }

  deleteReport(report: ClientReport) {
    if (!confirm('¿Eliminar este reporte?')) return;
    this.loading = true;
    this.reportService.deleteReport(report.id).subscribe({
      next: () => this.loadReports(),
      error: () => {
        this.error = 'No se pudo eliminar el reporte';
        this.loading = false;
      }
    });
  }

  openReport(url: string) {
    window.open(url, '_blank');
  }

  backToClients() {
    this.router.navigate(['/clients']);
  }
}


