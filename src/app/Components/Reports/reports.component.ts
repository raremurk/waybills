import { trigger, state, style, transition, animate } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSortModule, MatSort } from "@angular/material/sort";
import { MatTableModule, MatTableDataSource } from "@angular/material/table";
import { Title } from "@angular/platform-browser";
import { ICostPriceReport } from "../../Interfaces/iCostPriceReport";
import { IDriver } from "../../Interfaces/iDriver";
import { ITransport } from "../../Interfaces/ITransport";
import { ToFixedPipe } from "../../Pipes/toFixedPipe";
import { DataService } from "../../Services/data.service";
import { DateService } from "../../Services/date.service";
import { WaybillsDialogComponent } from "../Waybills/Dialog/waybillsDialog.component";
import * as XLSX from 'xlsx';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSortModule,
    MatTableModule,
    ToFixedPipe],
    animations: [
      trigger('detailExpand', [
        state('collapsed,void', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      ]),
    ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit, AfterViewInit{
  title = 'Отчеты';
  price = '27';
  drivers: IDriver[] = [];
  transports: ITransport[] = [];
  dataSource = new MatTableDataSource<ICostPriceReport>();
  dataColumns = ['productionCostCode', 'conditionalReferenceHectares', 'costPrice', 'expand'];
  expandedRow: ICostPriceReport | null = <ICostPriceReport>{};
  @ViewChild(MatSort) sort = new MatSort();
   
  constructor(public dialog: MatDialog, private titleService: Title, private dataService: DataService, 
    private dateService: DateService){ }
    
  ngOnInit(){
    this.titleService.setTitle(this.title);
    this.getCostPriceReport();
    this.loadAllDrivers();
    this.loadAllTransports();
    this.dateService.dateValueChange.subscribe(() => this.getCostPriceReport());
  }

  ngAfterViewInit(){
    this.dataSource.sort = this.sort;
  }

  openDialog(waybillId: number){
    let dialogRed = this.dialog.open(WaybillsDialogComponent, 
      { autoFocus: 'dialog', 
        disableClose: true,
        height: "calc(100% - 16px)", 
        width: "calc(100% - 16px)", 
        maxWidth: "100%", 
        maxHeight: "100%", 
        data: {
          waybillId: waybillId,
          editMode: false,
          drivers: this.drivers,
          transports: this.transports}
    })
    dialogRed.afterClosed().subscribe();
  }

  loadAllDrivers = () => this.dataService.getAllDrivers().subscribe((data: IDriver[]) => this.drivers = data);
  loadAllTransports = () => this.dataService.getAllTransports().subscribe((data: ITransport[]) => this.transports = data); 

  getCostPriceReport(): void{
    this.dataService.getCostPriceReport(this.dateService.year, this.dateService.month, Number(this.price))
      .subscribe((data: ICostPriceReport[]) => this.dataSource.data = data);   
  }

  getTotalConditionalReferenceHectares(): number{
    return this.dataSource.data.reduce((acc, value) => acc + value.conditionalReferenceHectares, 0);
  }

  getTotalCostPrice(): number{
    return this.dataSource.data.reduce((acc, value) => acc + value.costPrice, 0);
  }

  exportExcel(): void{
    let data = [...this.dataSource.data];


    let fileName = `Себестоимость-${this.dateService.year, this.dateService.month}.xlsx`;
    
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    var wscols = [{wch:14}, {wch:14}, {wch:14}];  
    ws['!cols'] = wscols;
    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    /* save to file */
    XLSX.writeFile(wb, fileName);
  }
}