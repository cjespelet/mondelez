import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { GameConfigService, Game, ClientPrize } from '../../services/game-config.service';

@Component({
  selector: 'app-game-config',
  templateUrl: './game-config.component.html',
  styleUrls: ['./game-config.component.scss']
})
export class GameConfigComponent implements OnInit {
  clientId!: number;
  allGames: Game[] = [];
  selectedGameIds: number[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;

  configForm: FormGroup;
  prizesForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private gameConfigService: GameConfigService
  ) {
    this.configForm = this.fb.group({
      games: this.fb.array([])
    });

    this.prizesForm = this.fb.group({
      prizes: this.fb.array([])
    });
  }

  ngOnInit() {
    this.clientId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = null;

    this.gameConfigService.getAllGames().subscribe({
      next: (response) => {
        if (response.success) {
          this.allGames = response.games;
          this.loadClientGames();
        }
      },
      error: () => {
        this.error = 'Error al cargar juegos';
        this.loading = false;
      }
    });
  }

  loadClientGames() {
    this.gameConfigService.getClientGames(this.clientId).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedGameIds = response.games.map(g => g.id);
          this.buildGamesForm();
          this.loadClientPrizes();
        }
      },
      error: () => {
        this.error = 'Error al cargar configuración del cliente';
        this.loading = false;
      }
    });
  }

  loadClientPrizes() {
    this.gameConfigService.getClientPrizes(this.clientId).subscribe({
      next: (response) => {
        if (response.success) {
          this.buildPrizesForm(response.prizes);
          // Si ruleta está seleccionada y no hay premios, agregar uno vacío
          if (this.isRuletaSelected() && response.prizes.length === 0) {
            if (this.prizesFormArray.length === 0) {
              this.prizesFormArray.push(this.createPrizeFormGroup());
            }
          }
        } else {
          // Si hay error pero ruleta está seleccionada, inicializar con un campo vacío
          if (this.isRuletaSelected() && this.prizesFormArray.length === 0) {
            this.prizesFormArray.push(this.createPrizeFormGroup());
          }
        }
        this.loading = false;
      },
      error: () => {
        // Si hay error pero ruleta está seleccionada, inicializar con un campo vacío
        if (this.isRuletaSelected() && this.prizesFormArray.length === 0) {
          this.prizesFormArray.push(this.createPrizeFormGroup());
        }
        this.loading = false;
      }
    });
  }

  buildGamesForm() {
    const gamesArray = this.configForm.get('games') as FormArray;
    gamesArray.clear();

    this.allGames.forEach(game => {
      const isSelected = this.selectedGameIds.includes(game.id);
      gamesArray.push(this.fb.control(isSelected));
    });
  }

  buildPrizesForm(prizes: ClientPrize[] = []) {
    const prizesArray = this.prizesForm.get('prizes') as FormArray;
    prizesArray.clear();

    if (prizes.length === 0) {
      prizesArray.push(this.createPrizeFormGroup());
    } else {
      prizes.forEach(prize => {
        prizesArray.push(this.createPrizeFormGroup(prize));
      });
    }
  }

  createPrizeFormGroup(prize?: ClientPrize): FormGroup {
    return this.fb.group({
      description: [prize?.description || '', Validators.required],
      order_index: [prize?.order_index ?? 0]
    });
  }

  get gamesFormArray(): FormArray {
    return this.configForm.get('games') as FormArray;
  }

  get prizesFormArray(): FormArray {
    return this.prizesForm.get('prizes') as FormArray;
  }

  isRuletaSelected(): boolean {
    const gamesArray = this.gamesFormArray;
    const ruletaIndex = this.allGames.findIndex(g => g.name === 'ruleta');
    return ruletaIndex >= 0 && gamesArray.at(ruletaIndex)?.value === true;
  }

  onRuletaToggle() {
    if (!this.isRuletaSelected()) {
      this.prizesFormArray.clear();
    } else {
      if (this.prizesFormArray.length === 0) {
        this.prizesFormArray.push(this.createPrizeFormGroup());
      }
    }
  }

  addPrize() {
    this.prizesFormArray.push(this.createPrizeFormGroup());
  }

  removePrize(index: number) {
    this.prizesFormArray.removeAt(index);
  }

  saveConfig() {
    const gamesArray = this.gamesFormArray;
    const selectedIds: number[] = [];
    
    gamesArray.controls.forEach((control, index) => {
      if (control.value) {
        selectedIds.push(this.allGames[index].id);
      }
    });

    if (selectedIds.length === 0) {
      this.error = 'Por favor selecciona al menos un juego';
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const isRuletaSelected = selectedIds.includes(this.allGames.find(g => g.name === 'ruleta')?.id || 0);

    this.gameConfigService.assignGames(this.clientId, selectedIds).subscribe({
      next: (response) => {
        if (response.success) {
          if (isRuletaSelected) {
            this.savePrizes();
          } else {
            // Si ruleta no está seleccionada, eliminar premios
            this.gameConfigService.saveClientPrizes(this.clientId, []).subscribe({
              next: () => {
                this.success = 'Configuración guardada correctamente';
                this.loading = false;
              },
              error: () => {
                this.success = 'Configuración guardada correctamente';
                this.loading = false;
              }
            });
          }
        }
      },
      error: (error) => {
        console.error('Error assigning games:', error);
        this.error = 'Error al guardar configuración';
        this.loading = false;
      }
    });
  }

  savePrizes() {
    console.log('savePrizes called - prizesFormArray length:', this.prizesFormArray.length);
    console.log('prizesFormArray controls:', this.prizesFormArray.controls);
    
    const allPrizes = this.prizesFormArray.controls.map((control, index) => {
      const desc = control.get('description')?.value || '';
      const order = control.get('order_index')?.value ?? index;
      console.log(`Prize ${index}: description="${desc}", order_index=${order}`);
      return {
        description: desc,
        order_index: order
      };
    });
    
    console.log('All prizes before filter:', allPrizes);
    
    const prizes: ClientPrize[] = allPrizes.filter(p => p.description && p.description.trim() !== '');
    
    console.log('Filtered prizes to save:', prizes);
    console.log('Saving prizes for client', this.clientId, 'prizes array:', prizes);

    if (prizes.length === 0) {
      console.warn('No prizes to save, but ruleta is selected. Saving empty array.');
    }

    this.gameConfigService.saveClientPrizes(this.clientId, prizes).subscribe({
      next: (response) => {
        console.log('Prizes saved successfully:', response);
        if (response.success) {
          this.success = 'Configuración guardada correctamente';
          this.loading = false;
        } else {
          this.error = 'Error al guardar premios';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error saving prizes:', error);
        this.error = 'Error al guardar premios: ' + (error.error?.message || error.message || 'Error desconocido');
        this.loading = false;
      }
    });
  }

  backToClients() {
    this.router.navigate(['/clients']);
  }
}

