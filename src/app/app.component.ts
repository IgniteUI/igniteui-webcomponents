import { Component, OnDestroy, OnInit } from '@angular/core';
import { IGX_GRID_DIRECTIVES } from '@infragistics/igniteui-angular';
import { Subject, takeUntil } from 'rxjs';
import { Category } from './models/northwind-cloud/category';
import { NorthwindCloudService } from './services/northwind-cloud.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IGX_GRID_DIRECTIVES],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  public northwindCloudCategory: Category[] = [];

  constructor(private northwindCloudService: NorthwindCloudService) { }

  ngOnInit() {
    this.northwindCloudService.getCategoryList().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => this.northwindCloudCategory = data,
      error: (_err: any) => this.northwindCloudCategory = []
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
