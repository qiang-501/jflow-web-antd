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
} from 'ag-grid-community';
import {
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
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
import { ValveActions } from '../../store/actions/valve.actions';
import { selectAllWorkFlows } from '../../store/selectors';
import {
  selectAllValves,
  selectValveState,
} from '../../store/selectors/valve.selectors';
import { allColumns, allGridColumns } from './allGridColumns';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Valve } from '../../models/valves';
import { WorkflowStatus, WorkflowPriority } from '../../models/work-flow';
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
  ],
  template: `
    <div>
      <h1>Dashboard</h1>
      <p>Dashboard content coming soon...</p>
    </div>
  `,
  styles: [],
})
export class DashboardComponent implements OnInit {
  private gridApi!: GridApi;

  columnDefs: ColDef[] = [];
  rowData: any[] = [];
  loading: boolean = false;

  customGermanLocale = {
    model_number: '123',
    resetColumns: '重置',
  };
  gridOptions = {
    localeText: this.customGermanLocale,
  };
  invalidEditValueMode: EditValidationCommitType = 'block';
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

    this.translate.use('zh');
  }

  async ngOnInit(): Promise<void> {
    this.columnDefs = await allColumns(this.translate);

    // 订阅valve state变化
    this.valveStore.select(selectValveState).subscribe((state: any) => {
      console.log('ValveState changed:', state);
      this.loading = state.loading;

      if (state.error) {
        console.error('Error loading valves:', state.error);
        return;
      }

      if (state.valves && !state.loading) {
        console.log('Raw valves data:', state.valves);

        // 提取实际数据 - 支持多种可能的数据结构
        let data = [];

        if (Array.isArray(state.valves)) {
          // 如果valves本身就是数组
          data = state.valves;
        } else if (state.valves.data) {
          // 如果valves是对象且有data属性
          data = state.valves.data;
        } else if (state.valves.valves && state.valves.valves.data) {
          // 如果是嵌套结构
          data = state.valves.valves.data;
        }

        this.rowData = data;
        console.log('Grid rowData set to:', this.rowData.length, 'rows');
        console.log('First row sample:', this.rowData[0]);
      }
    });

    // 初始加载数据
    this.loadData();
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
  }

  loadData() {
    console.log('Loading valve data...');
    // 派发加载valve数据的action
    this.valveStore.dispatch(
      ValveActions.loadValves({ payload: { startRow: 0, endRow: 100 } }),
    );
  }

  refreshData() {
    this.loadData();
  }

  onAdd() {
    this.addUserForm.reset();
    this.store.dispatch(
      WorkFlowActions.addWorkFlows({
        workflow: {
          id: '',
          d_workflow_id: 'WF-TEST',
          name: 'Test Workflow',
          description: 'Test workflow description',
          status: WorkflowStatus.DRAFT,
          important: 'no',
          process_id: 'P-TEST',
          due_date: new Date().toISOString(),
          created_by: 'test_user',
          created_on: new Date().toISOString(),
          priority: WorkflowPriority.MEDIUM,
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
      nzTitle: this.translate.instant('新增项目'),
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
