import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import {
  WorkFlow,
  WorkflowStatus,
  WorkflowPriority,
  WorkflowStatusHistory,
  CreateWorkflowDto,
  UpdateWorkflowDto,
} from '../../models/work-flow';
import { PermissionService } from '../../core/services/permission.service';
import { WorkflowService } from '../../core/services/workflow.service';
import { DynamicFormConfig } from '../../models/dynamic-form.model';
import { DynamicFormRendererComponent } from '../../shared/components/dynamic-form-renderer/dynamic-form-renderer.component';
import { FormBuilderComponent } from '../../shared/components/form-builder/form-builder.component';
import { DynamicFormService } from '../../core/services/dynamic-form.service';

@Component({
  selector: 'app-workflow',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzTableModule,
    NzModalModule,
    NzSelectModule,
    NzDatePickerModule,
    NzTagModule,
    NzPopconfirmModule,
    NzIconModule,
    NzBadgeModule,
    NzDropDownModule,
    NzTimelineModule,
    NzSpaceModule,
    NzEmptyModule,
    NzTooltipModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    DynamicFormRendererComponent,
    FormBuilderComponent,
  ],
  templateUrl: './workflow.component.html',
  styleUrl: './workflow.component.css',
})
export class WorkflowComponent implements OnInit {
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private permissionService = inject(PermissionService);
  private workflowService = inject(WorkflowService);
  private dynamicFormService = inject(DynamicFormService);
  private cdr = inject(ChangeDetectorRef);

  // 权限控制
  canCreate = false;
  canEdit = false;
  canDelete = false;
  canChangeStatus = false;
  canEditForm = false; // 编辑动态表单权限（仅管理员）

  // 表格数据
  workflows: WorkFlow[] = [];
  filteredWorkflows: WorkFlow[] = [];
  loading = false;
  pageSize = 10;
  pageIndex = 1;
  total = 0;

  // 筛选条件
  filterStatus: WorkflowStatus | null = null;
  filterPriority: WorkflowPriority | null = null;
  searchText = '';

  // 统计数据
  statistics = {
    total: 0,
    draft: 0,
    pending: 0,
    inProgress: 0,
    review: 0,
    completed: 0,
    cancelled: 0,
  };

  // 模态框控制
  isCreateModalVisible = false;
  isEditModalVisible = false;
  isHistoryModalVisible = false;
  isDynamicFormModalVisible = false;
  isFormBuilderModalVisible = false;
  selectedWorkflow: WorkFlow | null = null;
  workflowHistory: WorkflowStatusHistory[] = [];
  currentFormConfig: DynamicFormConfig | null = null;
  formConfigs: DynamicFormConfig[] = [];

  // 表单
  createForm!: FormGroup;
  editForm!: FormGroup;

  // 枚举值
  WorkflowStatus = WorkflowStatus;
  WorkflowPriority = WorkflowPriority;

  // 状态选项
  statusOptions = [
    { label: '草稿', value: WorkflowStatus.DRAFT, color: 'default' },
    { label: '待处理', value: WorkflowStatus.PENDING, color: 'orange' },
    { label: '进行中', value: WorkflowStatus.IN_PROGRESS, color: 'blue' },
    { label: '审核中', value: WorkflowStatus.REVIEW, color: 'cyan' },
    { label: '已完成', value: WorkflowStatus.COMPLETED, color: 'green' },
    { label: '已取消', value: WorkflowStatus.CANCELLED, color: 'red' },
  ];

  // 优先级选项
  priorityOptions = [
    { label: '低', value: WorkflowPriority.LOW, color: 'default' },
    { label: '中', value: WorkflowPriority.MEDIUM, color: 'blue' },
    { label: '高', value: WorkflowPriority.HIGH, color: 'orange' },
    { label: '紧急', value: WorkflowPriority.URGENT, color: 'red' },
  ];

  ngOnInit(): void {
    this.initForms();
    this.checkPermissions();
    this.loadWorkflows();
  }

  initForms(): void {
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priority: [WorkflowPriority.MEDIUM, [Validators.required]],
      assignee: [''],
      due_date: [null, [Validators.required]],
    });

    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priority: [WorkflowPriority.MEDIUM, [Validators.required]],
      assignee: [''],
      due_date: [null, [Validators.required]],
    });
  }

  checkPermissions(): void {
    // 检查工作流相关权限
    this.permissionService
      .checkPermission({
        resource: 'workflow',
        action: 'create',
      })
      .subscribe((result) => {
        this.canCreate = result.hasPermission;
      });

    this.permissionService
      .checkPermission({
        resource: 'workflow',
        action: 'update',
      })
      .subscribe((result) => {
        this.canEdit = result.hasPermission;
      });

    this.permissionService
      .checkPermission({
        resource: 'workflow',
        action: 'delete',
      })
      .subscribe((result) => {
        this.canDelete = result.hasPermission;
      });

    this.permissionService
      .checkPermission({
        resource: 'workflow',
        action: 'change_status',
      })
      .subscribe((result) => {
        this.canChangeStatus = result.hasPermission;
        console.log('workflow:change_status permission:', result.hasPermission);
      });

    // 检查是否是管理员（可以编辑动态表单）
    this.permissionService
      .checkPermission({
        resource: 'form',
        action: 'manage',
      })
      .subscribe((result) => {
        this.canEditForm = result.hasPermission;
        console.log('form:manage permission:', result.hasPermission);
        console.log('canEditForm is now:', this.canEditForm);
        this.cdr.markForCheck(); // 手动触发变更检测
      });
  }

  loadWorkflows(): void {
    this.loading = true;
    // 从API加载工作流数据
    this.workflowService.getWorkflows().subscribe({
      next: (response) => {
        this.workflows = response.data;
        this.filteredWorkflows = [...this.workflows];
        this.total = response.total;
        this.applyFilters();
        this.updateStatistics();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('加载工作流失败:', error);
        this.message.error('加载工作流数据失败');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  applyFilters(): void {
    let filtered = [...this.workflows];

    // 应用状态筛选
    if (this.filterStatus) {
      filtered = filtered.filter((w) => w.status === this.filterStatus);
    }

    // 应用优先级筛选
    if (this.filterPriority) {
      filtered = filtered.filter((w) => w.priority === this.filterPriority);
    }

    // 应用搜索文本
    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.name.toLowerCase().includes(search) ||
          w.d_workflow_id.toLowerCase().includes(search) ||
          w.description?.toLowerCase().includes(search) ||
          w.assignee?.toLowerCase().includes(search),
      );
    }

    this.filteredWorkflows = filtered;
    this.total = filtered.length;
  }

  updateStatistics(): void {
    this.statistics = {
      total: this.workflows.length,
      draft: this.workflows.filter((w) => w.status === WorkflowStatus.DRAFT)
        .length,
      pending: this.workflows.filter((w) => w.status === WorkflowStatus.PENDING)
        .length,
      inProgress: this.workflows.filter(
        (w) => w.status === WorkflowStatus.IN_PROGRESS,
      ).length,
      review: this.workflows.filter((w) => w.status === WorkflowStatus.REVIEW)
        .length,
      completed: this.workflows.filter(
        (w) => w.status === WorkflowStatus.COMPLETED,
      ).length,
      cancelled: this.workflows.filter(
        (w) => w.status === WorkflowStatus.CANCELLED,
      ).length,
    };
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.filterStatus = null;
    this.filterPriority = null;
    this.searchText = '';
    this.applyFilters();
  }

  // 创建工作流
  showCreateModal(): void {
    if (!this.canCreate) {
      this.message.warning('您没有创建工作流的权限');
      return;
    }
    this.isCreateModalVisible = true;
    this.createForm.reset({
      priority: WorkflowPriority.MEDIUM,
    });
  }

  handleCreateOk(): void {
    if (this.createForm.valid) {
      const formValue = this.createForm.value;
      const newWorkflow: CreateWorkflowDto = {
        name: formValue.name,
        description: formValue.description,
        priority: formValue.priority,
        assignee: formValue.assignee,
        due_date: formValue.due_date?.toISOString() || '',
      };

      // 这里应该调用API创建工作流
      console.log('Creating workflow:', newWorkflow);
      this.message.success('工作流创建成功');
      this.isCreateModalVisible = false;
      this.loadWorkflows();
    } else {
      Object.values(this.createForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  handleCreateCancel(): void {
    this.isCreateModalVisible = false;
  }

  // 编辑工作流
  showEditModal(workflow: WorkFlow): void {
    if (!this.canEdit) {
      this.message.warning('您没有编辑工作流的权限');
      return;
    }
    this.selectedWorkflow = workflow;
    this.editForm.patchValue({
      name: workflow.name,
      description: workflow.description,
      priority: workflow.priority,
      assignee: workflow.assignee,
      due_date: workflow.due_date ? new Date(workflow.due_date) : null,
    });
    this.isEditModalVisible = true;
  }

  handleEditOk(): void {
    if (this.editForm.valid && this.selectedWorkflow) {
      const formValue = this.editForm.value;
      const updateData: UpdateWorkflowDto = {
        name: formValue.name,
        description: formValue.description,
        priority: formValue.priority,
        assignee: formValue.assignee,
        due_date: formValue.due_date?.toISOString() || '',
      };

      // 这里应该调用API更新工作流
      console.log('Updating workflow:', this.selectedWorkflow.id, updateData);
      this.message.success('工作流更新成功');
      this.isEditModalVisible = false;
      this.loadWorkflows();
    }
  }

  handleEditCancel(): void {
    this.isEditModalVisible = false;
    this.selectedWorkflow = null;
  }

  // 修改状态
  changeStatus(workflow: WorkFlow, newStatus: WorkflowStatus): void {
    if (!this.canChangeStatus) {
      this.message.warning('您没有修改工作流状态的权限');
      return;
    }

    // 这里应该调用API修改状态
    console.log('Changing status:', workflow.id, newStatus);
    workflow.status = newStatus;
    this.updateStatistics(); // 更新统计数据
    this.cdr.markForCheck(); // 触发变更检测
    this.message.success('状态修改成功');
  }

  // 查看历史
  showHistory(workflow: WorkFlow): void {
    this.selectedWorkflow = workflow;
    this.isHistoryModalVisible = true;

    // 从API加载工作流历史
    this.workflowService.getWorkflowHistory(workflow.id).subscribe({
      next: (history) => {
        this.workflowHistory = history;
      },
      error: (error) => {
        console.error('加载历史记录失败:', error);
        this.message.error('加载历史记录失败');
        this.workflowHistory = [];
      },
    });
  }

  handleHistoryCancel(): void {
    this.isHistoryModalVisible = false;
    this.selectedWorkflow = null;
  }

  // 删除工作流
  deleteWorkflow(id: string): void {
    if (!this.canDelete) {
      this.message.warning('您没有删除工作流的权限');
      return;
    }

    // 这里应该调用API删除工作流
    console.log('Deleting workflow:', id);
    this.message.success('工作流删除成功');
    this.loadWorkflows();
  }

  // 获取状态配置
  getStatusConfig(status: WorkflowStatus) {
    return (
      this.statusOptions.find((s) => s.value === status) ||
      this.statusOptions[0]
    );
  }

  // 获取优先级配置
  getPriorityConfig(priority: WorkflowPriority) {
    return (
      this.priorityOptions.find((p) => p.value === priority) ||
      this.priorityOptions[0]
    );
  }

  // 打开动态表单
  openDynamicForm(workflow: WorkFlow): void {
    this.selectedWorkflow = workflow;

    if (workflow.form_config_id) {
      // 加载表单配置
      this.dynamicFormService.getFormConfig(workflow.form_config_id).subscribe({
        next: (config) => {
          this.currentFormConfig = config;
          this.isDynamicFormModalVisible = true;
          this.cdr.detectChanges();
        },
        error: () => {
          this.message.error('加载表单配置失败');
        },
      });
    } else {
      this.message.warning('此工作流未关联动态表单');
    }
  }

  // 处理动态表单提交
  handleFormSubmit(formData: any): void {
    console.log('Form submitted:', formData);
    console.log('Workflow:', this.selectedWorkflow);

    // 这里可以将表单数据保存到工作流
    this.message.success('表单提交成功');
    this.isDynamicFormModalVisible = false;
  }

  // 取消动态表单
  handleFormCancel(): void {
    this.isDynamicFormModalVisible = false;
    this.currentFormConfig = null;
  }

  // 打开表单构建器（仅管理员）
  openFormBuilder(workflow?: WorkFlow): void {
    console.log('openFormBuilder called');
    console.log('canEditForm:', this.canEditForm);

    if (!this.canEditForm) {
      this.message.warning('您没有编辑动态表单的权限');
      console.warn('Permission denied: canEditForm is false');
      return;
    }

    console.log('Opening form builder...');
    this.selectedWorkflow = workflow || null;
    this.isFormBuilderModalVisible = true;
  }

  // 处理表单构建器关闭
  handleFormBuilderClose(): void {
    this.isFormBuilderModalVisible = false;
    this.selectedWorkflow = null;
  }
}
