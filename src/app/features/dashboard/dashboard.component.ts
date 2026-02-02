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
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
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
import {
  WorkFlow,
  WorkflowStatus,
  WorkflowPriority,
} from '../../models/work-flow';
import { MenuActions } from '../../store/actions/menu.actions';
import { WorkflowService } from '../../core/services/workflow.service';
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
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzSpinModule,
    TranslateModule,
  ],
  templateUrl: './dashboard.component.html',
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

  // 工作流统计数据
  statistics = {
    draft: 0,
    pending: 0,
    inProgress: 0,
    review: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
  };

  constructor(
    private modal: NzModalService,
    private fb: FormBuilder,
    private store: Store<any>,
    private http: HttpClient,
    private translate: TranslateService,
    private valveStore: Store<{ valves: Valve[] }>,
    private workflowService: WorkflowService,
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

    // 加载工作流统计数据
    this.loadWorkflowStatistics();

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
          id: 0,
          dWorkflowId: 'WF-TEST',
          name: 'Test Workflow',
          description: 'Test workflow description',
          status: WorkflowStatus.DRAFT,
          priority: WorkflowPriority.MEDIUM,
        } as any,
      }),
    );
    this.store.dispatch(
      MenuActions.addMenu({
        menu: {
          id: 6,
          name: 'abc',
          title: 'abc',
          icon: 'user',
          path: 'main/workflow1',
        } as any,
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

  /**
   * 加载工作流统计数据
   */
  loadWorkflowStatistics() {
    this.loading = true;
    this.workflowService.getWorkflows().subscribe({
      next: (response) => {
        const workflows = response.data || [];

        // 重置统计数据
        this.statistics = {
          draft: 0,
          pending: 0,
          inProgress: 0,
          review: 0,
          completed: 0,
          cancelled: 0,
          total: workflows.length,
        };

        // 统计各状态的工作流数量
        workflows.forEach((workflow: WorkFlow) => {
          switch (workflow.status) {
            case WorkflowStatus.DRAFT:
              this.statistics.draft++;
              break;
            case WorkflowStatus.PENDING:
              this.statistics.pending++;
              break;
            case WorkflowStatus.IN_PROGRESS:
              this.statistics.inProgress++;
              break;
            case WorkflowStatus.REVIEW:
              this.statistics.review++;
              break;
            case WorkflowStatus.COMPLETED:
              this.statistics.completed++;
              break;
            case WorkflowStatus.CANCELLED:
              this.statistics.cancelled++;
              break;
          }
        });

        this.loading = false;
        console.log('Workflow statistics loaded:', this.statistics);
      },
      error: (error) => {
        console.error('Error loading workflow statistics:', error);
        this.loading = false;
      },
    });
  }
}
