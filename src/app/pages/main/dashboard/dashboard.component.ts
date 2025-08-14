import { Component, TemplateRef, ViewChild } from '@angular/core';
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
import {
  updateWorkFlowAction,
  addWorkFlowsAction,
} from '../../../services/work-flow.service';
import {
  selectWorkFlowsCollection,
  selectWorkFlows,
} from '../../../services/work-flow.selectors';

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
    AgGridAngular,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  private gridApi!: GridApi;

  columnDefs: ColDef[] = [
    {
      field: 'make',
      cellEditorParams: {
        getValidationErrors: (params: IErrorValidationParams) => {
          const { value } = params;
          if (!value || value.length < 1) {
            return ['The value has to be at least 3 characters long.'];
          }
          return [];
        },
      },
    },
    { field: 'model' },
    {
      field: 'price',
      // cellEditorParams: {
      //   getValidationErrors: (params: IErrorValidationParams) => {
      //     const { value } = params;
      //     if (!value || value < 1 || value > 999) {
      //       return ["The value has to be at least 3 characters long."];
      //     }
      //     return [];
      //   },
      // },
    },
    {
      headerName: 'Suppress Navigable',
      field: 'field5',
      suppressNavigable: true,
      minWidth: 200,
    },
  ];
  defaultColDef: ColDef = {
    flex: 1,
    editable: true,
    cellDataType: false,
  };
  editType: EditStrategyType = 'fullRow';
  invalidEditValueMode: EditValidationCommitType = 'block';
  rowData: any[] | null = getRowData();

  @ViewChild('addUserModal', { static: false }) addUserModal!: TemplateRef<any>;
  addUserForm!: FormGroup;

  constructor(
    private modal: NzModalService,
    private fb: FormBuilder,
    private store: Store
  ) {
    this.addUserForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onCellValueChanged(event: CellValueChangedEvent) {
    console.log(
      'onCellValueChanged: ' + event.colDef.field + ' = ' + event.newValue
    );
  }

  onRowValueChanged(event: RowValueChangedEvent) {
    const data = event.data;
    console.log(
      'onRowValueChanged: (' +
        data.make +
        ', ' +
        data.model +
        ', ' +
        data.price +
        ', ' +
        data.field5 +
        ')'
    );
  }

  onBtStopEditing() {
    this.gridApi.stopEditing();
  }

  onBtStartEditing() {
    this.gridApi.setFocusedCell(1, 'make');
    this.gridApi.startEditingCell({
      rowIndex: 1,
      colKey: 'make',
    });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onAdd() {
    this.addUserForm.reset();
    this.store.dispatch(
      addWorkFlowsAction({
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
      })
    );

    this.modal.create({
      nzTitle: '新增用户',
      nzContent: this.addUserModal,
      nzFooter: null,
      nzWidth: 400,
    });
  }

  onSave() {
    // TODO: 实现保存逻辑
    this.store
      .select(selectWorkFlows)
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

function getRowData() {
  const rowData = [];
  for (let i = 0; i < 10; i++) {
    rowData.push({
      make: 'Toyota',
      model: 'Celica',
      price: 35000 + i * 1000,
      field4: 'Sample XX',
      field5: 'Sample 22',
      field6: 'Sample 23',
    });
    rowData.push({
      make: 'Ford',
      model: 'Mondeo',
      price: 32000 + i * 1000,
      field4: 'Sample YY',
      field5: 'Sample 24',
      field6: 'Sample 25',
    });
    rowData.push({
      make: 'Porsche',
      model: 'Boxster',
      price: 72000 + i * 1000,
      field4: 'Sample ZZ',
      field5: 'Sample 26',
      field6: 'Sample 27',
    });
  }
  return rowData;
}
