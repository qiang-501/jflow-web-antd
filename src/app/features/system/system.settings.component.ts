import { Component, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import {
  ClientSideRowModelModule,
  ColDef,
  CustomEditorModule,
  GridApi,
  GridReadyEvent,
  ModuleRegistry,
  SelectEditorModule,
  TextEditorModule,
  ValidationModule,
  GetDataPath,
} from 'ag-grid-community';
import {
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  TreeDataModule,
} from 'ag-grid-enterprise';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { getData } from './data';
import { TranslateModule } from '@ngx-translate/core';
import { selectAllMenus } from '../../store/selectors/menu.selectors';
import { MenuState } from '../../store/reducers/menu.reducer';
import { Store } from '@ngrx/store';
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ColumnsToolPanelModule,
  ColumnMenuModule,
  ContextMenuModule,
  SelectEditorModule,
  TextEditorModule,
  CustomEditorModule,
  ValidationModule,
  TreeDataModule,
]);
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzIconModule,
    NzFormModule,
    NzInputModule,
    NzModalModule,
    TranslateModule,
    AgGridAngular,
  ],
  templateUrl: './system.settings.component.html',
  styleUrls: ['./system.settings.component.css'],
})
export class SystemSettingsComponent implements OnInit {
  private gridApi!: GridApi;
  constructor(private menuStore: Store<{ menus: MenuState }>) {}
  columnDefs: ColDef[] = [
    { field: 'created', editable: true },
    { field: 'modified' },
    {
      field: 'size',
      aggFunc: 'sum',
      valueFormatter: (params) => {
        const sizeInKb = params.value / 1024;
        if (sizeInKb > 1024) {
          return `${+(sizeInKb / 1024).toFixed(2)} MB`;
        } else {
          return `${+sizeInKb.toFixed(2)} KB`;
        }
      },
    },
    { field: 'permission' },
  ];
  ngOnInit() {}
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 150,
    editable: true,
    sortable: false,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    cellStyle: {
      'line-height': '32px',
    },
    filterParams: {
      filterOptions: ['contains'],
    },
  };

  autoGroupColumnDef: ColDef = {
    headerName: 'File Explorer',
    minWidth: 280,
    cellRendererParams: {
      suppressCount: true,
    },
  };
  rowData: any[] | null = getData();
  groupDefaultExpanded = -1;
  getDataPath: GetDataPath = (data) => data.path;
  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    this.menuStore.dispatch({
      type: 'LoadMenuActions',
    });
    this.menuStore.select(selectAllMenus).subscribe((menus) => {
      debugger;
    });
  }
}
