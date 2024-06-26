import { trigger, state, style, transition, animate } from "@angular/animations";
import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { MatBadgeModule } from "@angular/material/badge";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSortModule, MatSort } from "@angular/material/sort";
import { MatTableModule, MatTableDataSource } from "@angular/material/table";
import { IDetailedEntityMonthTotal } from "../../../Interfaces/MonthTotal/iDetailedEntityMonthTotal";
import { IMonthTotal } from "../../../Interfaces/MonthTotal/iMonthTotal";
import { DataService } from "../../../Services/data.service";
import { DateService } from "../../../Services/date.service";

@Component({
  selector: 'month-total',
  standalone: true,
  imports: [MatBadgeModule, MatButtonModule, MatIconModule, MatSortModule, MatTableModule],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  templateUrl: './monthTotal.component.html',
  styleUrl: './monthTotal.component.scss'
})
export class MonthTotalComponent implements OnInit, AfterViewInit{
  mainEntity = {name: 'Водитель', color: 'bg-emerald-600', route: 'driver'};
  childEntity = {name: 'Транспорт', color: 'bg-cyan-800', route: 'transport'};
  columns = [
    {
      columnDef: 'waybillsCount',
      header: 'Пут. лист',
      cell: (total: IMonthTotal) => total.waybillsCount,
      footer: () => this.dataSource.data.reduce((acc, value) => acc + value.waybillsCount, 0)
    },
    {
      columnDef: 'days',
      header: 'Дни',
      cell: (total: IMonthTotal) => total.days,
      footer: () => this.dataSource.data.reduce((acc, value) => acc + value.days, 0)
    },
    {
      columnDef: 'hours',
      header: 'Часы',
      cell: (total: IMonthTotal) => total.hours.toFixed(1),
      footer: () => this.dataSource.data.reduce((acc, value) => acc + value.hours, 0).toFixed(1)
    },
    {
      columnDef: 'earnings',
      header: 'Сумма',
      cell: (total: IMonthTotal) => total.earnings.toFixed(2),
      footer: () => this.dataSource.data.reduce((acc, value) => acc + value.earnings, 0).toFixed(2)
    },
    {
      columnDef: 'bonus',
      header: 'Премия',
      cell: (total: IMonthTotal) => total.bonus.toFixed(2),
      footer: () => this.dataSource.data.reduce((acc, value) => acc + value.bonus, 0).toFixed(2)
    },
    {
      columnDef: 'weekend',
      header: 'Выхи',
      cell: (total: IMonthTotal) => total.weekend.toFixed(2),
      footer: () => this.dataSource.data.reduce((acc, value) => acc + value.weekend, 0).toFixed(2)
    },
    {
      columnDef: 'numberOfRuns',
      header: 'Число ездок',
      cell: (total: IMonthTotal) => total.numberOfRuns,
      footer: () => this.dataSource.data.reduce((acc, value) => acc + value.numberOfRuns, 0)
    },
    {
      columnDef: 'totalMileage',
      header: 'Всего',
      cell: (total: IMonthTotal) => total.totalMileage.toFixed(1),
      footer: () => this.dataSource.data.reduce((acc, value) => acc + value.totalMileage, 0).toFixed(1)
    },
    {
      columnDef: 'totalMileageWithLoad',
      header: 'С грузом',
      cell: (total: IMonthTotal) => total.totalMileageWithLoad.toFixed(1),
      footer: () => this.dataSource.data.reduce((acc, value) => acc + value.totalMileageWithLoad, 0).toFixed(1)
    },
    {
      columnDef: 'transportedLoad',
      header: 'Перевезено груза, тонн',
      cell: (total: IMonthTotal) => total.transportedLoad.toFixed(3),
      footer: () => this.dataSource.data.reduce((acc, value) => acc + value.transportedLoad, 0).toFixed(3)
    },
    {
      columnDef: 'normShift',
      header: 'Нормо-смена',
      cell: (total: IMonthTotal) => total.normShift.toFixed(2),
      footer: () => this.dataSource.data.reduce((acc, value) => acc + value.normShift, 0).toFixed(2)
    },
    {
      columnDef: 'conditionalReferenceHectares',
      header: 'Условный гектар',
      cell: (total: IMonthTotal) => total.conditionalReferenceHectares.toFixed(2),
      footer: () => this.dataSource.data.reduce((acc, value) => acc + value.conditionalReferenceHectares, 0).toFixed(2)
    },
    {
      columnDef: 'factFuelConsumption',
      header: 'Факт',
      cell: (total: IMonthTotal) => total.factFuelConsumption,
      footer: () => this.dataSource.data.reduce((acc, value) => acc + value.factFuelConsumption, 0)
    },
    {
      columnDef: 'normalFuelConsumption',
      header: 'Норма',
      cell: (total: IMonthTotal) => total.normalFuelConsumption,
      footer: () => this.dataSource.data.reduce((acc, value) => acc + value.normalFuelConsumption, 0)
    }
  ];
  dataSource = new MatTableDataSource<IDetailedEntityMonthTotal>();
  dataColumns = ['entityName', ... this.columns.map(c => c.columnDef), 'expand'];
  mainHeadersColumns = ['entityName', 'waybillsCount', 'days', 'hours', 'earnings', 'bonus', 'weekend', 'numberOfRuns',
    'mileage', 'transportedLoad', 'normShift', 'conditionalReferenceHectares', 'fuel', 'expand'];
  childHeadersColumns = ['totalMileage' , 'totalMileageWithLoad', 'factFuelConsumption', 'normalFuelConsumption'];
  expandedRow: IDetailedEntityMonthTotal | null = <IDetailedEntityMonthTotal>{};
  @ViewChild(MatSort) sort = new MatSort();

  constructor(private dataService: DataService, private dateService: DateService){ }
    
  ngOnInit(){
    this.getMonthTotals();
    this.dateService.dateValueChange.subscribe(() => this.getMonthTotals());
  }

  ngAfterViewInit(){
    this.dataSource.sort = this.sort;
  }

  getMonthTotals(){
    this.dataService.getMonthTotals(this.dateService.year, this.dateService.month, this.mainEntity.route)
      .subscribe((data: IDetailedEntityMonthTotal[]) => this.dataSource.data = data);
  }

  getMonthTotalExcelLink = () => this.dataService.getMonthTotalExcelLink(this.dateService.year, this.dateService.month);

  switchEntities(){
    [this.mainEntity, this.childEntity] = [this.childEntity, this.mainEntity];
    this.getMonthTotals();
  }

  subTotalsExist = (index: number) => this.dataSource._orderData(this.dataSource.data)[index].subTotals.length > 1;
}
