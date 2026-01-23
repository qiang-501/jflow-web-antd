import { Component, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import {
  CellValueChangedEvent,
  ClientSideRowModelModule,
  ColDef,
  ColGroupDef,
  CustomEditorModule,
  EditStrategyType,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ModuleRegistry,
  RowValueChangedEvent,
  SelectEditorModule,
  TextEditorModule,
  ValidationModule,
  EditValidationCommitType,
  IErrorValidationParams,
  IServerSideDatasource,
  RowModelType,
} from 'ag-grid-community';
import {
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  ServerSideRowModelModule,
} from 'ag-grid-enterprise';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { Store } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';

import { WorkFlowActions } from '../../store/actions/workflow.actions';
import { selectAllWorkFlows } from '../../store/selectors';
import {
  selectAllValves,
  selectValveState,
} from '../../store/selectors/valve.selectors';
import { allColumns, allGridColumns } from './allGridColumns';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Valve } from '../../models/valves';
import { take, lastValueFrom } from 'rxjs';
import { MenuActions } from '../../store/actions/menu.actions';
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ColumnsToolPanelModule,
  ColumnMenuModule,
  ContextMenuModule,
  SelectEditorModule,
  TextEditorModule,
  CustomEditorModule,
  ValidationModule,
  ServerSideRowModelModule,
]);
// import { NumericCellEditor } from "./numeric-cell-editor.component";
// Column Definition Type Interface
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
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private gridApi!: GridApi;

  columnDefs: ColDef[] = [];
  customGermanLocale = {
    model_number: '123',
    resetColumns: '重置',
    // customise the locale here
  };
  gridOptions = {
    localeText: this.customGermanLocale,
  };
  invalidEditValueMode: EditValidationCommitType = 'block';
  rowModelType: RowModelType = 'serverSide';
  paginationPageSize: number = 100;

  @ViewChild('addUserModal', { static: false }) addUserModal!: TemplateRef<any>;
  addUserForm!: FormGroup;

  constructor(
    private modal: NzModalService,
    private fb: FormBuilder,
    private store: Store<any>,
    private http: HttpClient,
    private translate: TranslateService,
    private valveStore: Store<{ valves: Valve[] }>,
  ) {
    this.addUserForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.translate.use('de');
  }

  async ngOnInit(): Promise<void> {
    this.columnDefs = await allColumns(this.translate);

    // this.valves$.subscribe((res) => {
    //   console.log(res);
    // });
  }
  public defaultColDef: ColDef = {
    minWidth: 150,
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

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    const datasource = this.createServerSideDatasource();
    params.api!.setGridOption('serverSideDatasource', datasource);
    this.valveStore.select(selectValveState).subscribe((response: any) => {
      console.log('222' + response.loading);
    });
  }
  createServerSideDatasource(): IServerSideDatasource {
    return {
      getRows: async (params) => {
        this.valveStore.dispatch({
          type: 'LoadValves',
          payload: params.request,
        });
        this.valveStore.select(selectValveState).subscribe((state: any) => {
          if (state.error) {
            console.error('Error loading valves:', state.error);
            params.fail();
          } else if (state.valves && !state.loading) {
            params.success({
              rowData: state.valves.valves.data,
              rowCount: state.valves.valves.meta.totalElements,
            });
          }
        });
      },
    };
  }

  onAdd() {
    this.addUserForm.reset();
    this.store.dispatch(
      WorkFlowActions.addWorkFlows({
        workflow: {
          id: '',
          d_workflow_id: '22',
          status: '22',
          important: '22',
          process_id: '22',
          due_date: '22',
          created_by: '22',
          created_on: '',
        },
      }),
    );
    this.store.dispatch(
      MenuActions.addMenu({
        menu: {
          id: '6',
          title: 'abc',
          icon: 'user',
          level: 2,
          parent_id: '3',
          link: 'main/workflow1',
        },
      }),
    );

    this.modal.create({
      nzTitle: $localize`:@@7419080677613818373:新增项目`,
      nzContent: this.addUserModal,
      nzFooter: null,
      nzWidth: 400,
    });
  }

  onSave() {
    // TODO: 实现保存逻辑
    this.store
      .select(selectAllWorkFlows)
      .subscribe((res) => {
        console.log(res);
      })
      .unsubscribe();
  }

  onDelete() {
    // TODO: 实现删除逻辑
    console.log('删除按钮点击');
  }
}
