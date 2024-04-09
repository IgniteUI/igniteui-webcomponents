import { NgFor } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IGX_INPUT_GROUP_DIRECTIVES, IGX_SELECT_DIRECTIVES, IgxRadioComponent, IgxRadioGroupDirective, IgxSwitchComponent } from '@infragistics/igniteui-angular';
import { Subject, takeUntil } from 'rxjs';
import { BoxOfficeRevenueType } from '../models/financial/box-office-revenue-type';
import { FinancialService } from '../services/financial.service';

@Component({
  selector: 'app-view1',
  standalone: true,
  imports: [IGX_INPUT_GROUP_DIRECTIVES, IGX_SELECT_DIRECTIVES, IgxRadioGroupDirective, IgxSwitchComponent, IgxRadioComponent, NgFor],
  templateUrl: './view1.component.html',
  styleUrls: ['./view1.component.scss']
})
export class View1Component implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  public boolVar: boolean = false;
  public financialBoxOfficeRevenue: BoxOfficeRevenueType[] = [];

  constructor(
    private financialService: FinancialService,
  ) {}

  ngOnInit() {
    this.financialService.getData('BoxOfficeRevenueType').pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => this.financialBoxOfficeRevenue = data,
      error: (_err: any) => this.financialBoxOfficeRevenue = []
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
