import { CommonModule } from '@angular/common';
import { Component, OnInit, DestroyRef, inject, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { BuildHistoryModel } from '../models/build-history.model';
import { environment } from '../../../../environments/environment';
import { JenkinsService } from '../services/jenkins.service';
import { timer, switchMap, catchError, EMPTY } from 'rxjs';
@Component({
  selector: 'app-build-history',
  imports: [
    CommonModule,
    TableModule, 
    ButtonModule, 
    CardModule,
    ProgressBarModule 
  ],
  templateUrl: './build-history.html',
  styleUrl: './build-history.scss',
})
export class BuildHistory implements OnInit {

  buildHistory: BuildHistoryModel[] = [];

  filteredBuildHistory: BuildHistoryModel[] = [];

  selectedEnvironment = '';

  selectedStatus = '';

  searchText = '';

  totalBuilds = 0;

  successfulBuilds = 0;

  failedBuilds = 0;

  runningBuilds = 0;

  loading = true;

  private cdr = inject(ChangeDetectorRef);

  remainingSeconds = 0;

  readonly REFRESH_INTERVAL = 30;

  private destroyRef = inject(DestroyRef);

  constructor(
    private jenkinsService: JenkinsService
  ) { }

  ngOnInit(): void {
    // Tick every second to manage the countdown and trigger refresh
    timer(1, 1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.remainingSeconds <= 0) {
          this.loadBuildHistory();
          this.remainingSeconds = this.REFRESH_INTERVAL;
        } else {
          this.remainingSeconds--;
        }
      });
  }

  loadBuildHistory(): void {

    this.loading = true;

    this.jenkinsService
      .getBuildHistory()
      .subscribe({

        next: (response) => {

          this.buildHistory = response;

          this.calculateSummary();

          // Apply current filters to the new data
          this.applyFilter();

          this.loading = false;

          // Manually trigger change detection to resolve NG0100
          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(error);

          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  calculateSummary(): void {

    this.totalBuilds = this.buildHistory.length;

    this.successfulBuilds =
      this.buildHistory.filter(x => x.status === 'SUCCESS').length;

    this.failedBuilds =
      this.buildHistory.filter(x => x.status === 'FAILED').length;

    this.runningBuilds =
      this.buildHistory.filter(x => x.status === 'RUNNING').length;
  }

  applyFilter(): void {

    this.filteredBuildHistory =
      this.buildHistory.filter(item => {

        const envMatch =
          !this.selectedEnvironment ||
          item.environment === this.selectedEnvironment;

        const statusMatch =
          !this.selectedStatus ||
          item.status === this.selectedStatus;

        const searchMatch =
          !this.searchText ||
          item.buildNo
            .toLowerCase()
            .includes(this.searchText.toLowerCase());

        return envMatch && statusMatch && searchMatch;
      });
  }

  resetFilters(): void {

    this.selectedEnvironment = '';

    this.selectedStatus = '';

    this.searchText = '';

    this.filteredBuildHistory = [...this.buildHistory];
  }

  refreshBuilds(): void {

    this.loadBuildHistory();
    this.remainingSeconds = this.REFRESH_INTERVAL;
  }

  openBuild(build: BuildHistoryModel): void {

    if (build.buildUrl) {
      window.open(build.buildUrl, '_blank');
    }
  }

  promoteToNext(build: BuildHistoryModel): void {
    let targetJob = '';
    
    if (build.environment === 'DEV') {
      targetJob = environment.jobs.testing;
    } else if (build.environment === 'TESTING') {
      targetJob = environment.jobs.prod;
    }

    if (!targetJob) return;

    this.loading = true;
    this.jenkinsService.promoteBuild(targetJob, build.buildNo).subscribe({
      next: () => {
        // Reset timer to fetch the new "Running" build immediately
        this.remainingSeconds = 2; 
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Promotion failed', err);
        this.loading = false;
      }
    });
  }
}