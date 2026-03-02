import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';
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
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import {
  WorkFlow,
  WorkflowStatus,
  WorkflowPriority,
  WorkflowStatusHistory,
  CreateWorkflowDto,
  UpdateWorkflowDto,
} from '../../models/work-flow';
import { WorkflowTemplate } from '../../models/workflow-template.model';
import { PermissionService } from '../../core/services/permission.service';
import { WorkflowService } from '../../core/services/workflow.service';
import { WorkflowTemplateService } from '../../core/services/workflow-template.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../models/user.model';
import { DynamicFormConfig } from '../../models/dynamic-form.model';
import { DynamicFormRendererComponent } from '../../shared/components/dynamic-form-renderer/dynamic-form-renderer.component';
import { FormBuilderComponent } from '../../shared/components/form-builder/form-builder.component';
import { DynamicFormService } from '../../core/services/dynamic-form.service';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';

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
    NzTypographyModule,
    DynamicFormRendererComponent,
    FormBuilderComponent,
    HasPermissionDirective,
  ],
  templateUrl: './workflow.component.html',
  styleUrl: './workflow.component.css',
})
export class WorkflowComponent implements OnInit {
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private permissionService = inject(PermissionService);
  private workflowService = inject(WorkflowService);
  private workflowTemplateService = inject(WorkflowTemplateService);
  private userService = inject(UserService);
  private dynamicFormService = inject(DynamicFormService);
  private cdr = inject(ChangeDetectorRef);

  // 表格数据
  workflows: WorkFlow[] = [];
  filteredWorkflows: WorkFlow[] = [];
  loading = false;
  pageSize = 10;
  pageIndex = 1;
  total = 0;

  // 用户列表
  users: User[] = [];
  usersLoading = false;

  // 表单配置列表
  formConfigs: DynamicFormConfig[] = [];
  formConfigsLoading = false;

  // 工作流模板列表
  workflowTemplates: WorkflowTemplate[] = [];
  templatesLoading = false;
  selectedTemplateId: number | null = null;

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
  isCreatingNewForm = false; // 是否正在创建新表单（不显示其他表单）
  selectedWorkflow: WorkFlow | null = null;
  workflowHistory: WorkflowStatusHistory[] = [];
  currentFormConfig: DynamicFormConfig | null = null;
  currentFormData?: { [key: string]: any }; // 存储已保存的表单数据

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
    this.loadWorkflows();
    this.loadUsers();
    this.loadFormConfigs();
    this.loadWorkflowTemplates();
  }

  initForms(): void {
    this.createForm = this.fb.group({
      templateId: [null], // 新增：模板选择
      dWorkflowId: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priority: [WorkflowPriority.MEDIUM, [Validators.required]],
      assignedTo: [null],
      dueDate: [null, [Validators.required]],
      formConfigId: [null], // 关联的表单配置
    });

    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priority: [WorkflowPriority.MEDIUM, [Validators.required]],
      assignedTo: [null],
      dueDate: [null, [Validators.required]],
    });

    // 监听模板选择变化，自动填充表单
    this.createForm.get('templateId')?.valueChanges.subscribe((templateId) => {
      if (templateId) {
        // 使用 setTimeout 避免 ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.onTemplateSelected(templateId);
        });
      }
    });
  }

  /**
   * 检查权限的辅助方法（用于业务逻辑）
   * 从缓存中检查，不发送网络请求
   * @param resource 资源名称
   * @param action 操作名称
   * @returns Promise<boolean> 是否有权限
   */
  async hasPermission(resource: string, action: string): Promise<boolean> {
    try {
      const hasPermission = await firstValueFrom(
        this.permissionService.hasPermission({ resource, action }),
      );
      return hasPermission;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  async loadWorkflows(): Promise<void> {
    this.loading = true;
    try {
      const response = await firstValueFrom(
        this.workflowService.getWorkflows(),
      );
      this.workflows = response.data;
      this.filteredWorkflows = [...this.workflows];
      this.total = response.total;
      this.applyFilters();
      this.updateStatistics();
      this.loading = false;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('加载工作流失败:', error);
      this.message.error('加载工作流数据失败');
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  async loadUsers(): Promise<void> {
    this.usersLoading = true;
    try {
      const response = await firstValueFrom(this.userService.getUsers());
      this.users = response.data;
      this.usersLoading = false;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('加载用户列表失败:', error);
      this.message.error('加载用户列表失败');
      this.usersLoading = false;
      this.cdr.markForCheck();
    }
  }

  async loadFormConfigs(): Promise<void> {
    this.formConfigsLoading = true;
    try {
      const response = await firstValueFrom(
        this.dynamicFormService.getFormConfigs(),
      );
      this.formConfigs = response.data;
      this.formConfigsLoading = false;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('加载表单配置失败:', error);
      this.formConfigsLoading = false;
      this.cdr.markForCheck();
    }
  }

  // 加载工作流模板
  async loadWorkflowTemplates(): Promise<void> {
    this.templatesLoading = true;
    try {
      const templates = await firstValueFrom(
        this.workflowTemplateService.getActiveTemplates(),
      );
      this.workflowTemplates = templates;
      this.templatesLoading = false;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('加载工作流模板失败:', error);
      this.message.error('加载工作流模板失败');
      this.templatesLoading = false;
      this.cdr.markForCheck();
    }
  }

  // 当选择模板时，自动填充表单
  onTemplateSelected(templateId: number): void {
    const template = this.workflowTemplates.find((t) => t.id === templateId);
    if (template) {
      this.selectedTemplateId = templateId;

      // 自动填充优先级
      if (template.defaultPriority) {
        this.createForm.patchValue({
          priority: template.defaultPriority,
        });
      }

      // 自动填充表单配置
      if (template.formConfigId) {
        this.createForm.patchValue({
          formConfigId: template.formConfigId,
        });
      }

      // 自动填充描述（如果用户还没填写）
      if (template.description && !this.createForm.get('description')?.value) {
        this.createForm.patchValue({
          description: template.description,
        });
      }

      this.message.success(`已选择模板：${template.name}`);
    }
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
          w.dWorkflowId.toLowerCase().includes(search) ||
          w.description?.toLowerCase().includes(search),
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
  async showCreateModal(): Promise<void> {
    if (!(await this.hasPermission('workflow', 'create'))) {
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

      // 如果选择了模板，使用从模板创建的API
      if (formValue.templateId) {
        this.createFromTemplate(formValue);
      } else {
        this.createWorkflowDirectly(formValue);
      }
    } else {
      Object.values(this.createForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  // 直接创建工作流（不使用模板）
  private async createWorkflowDirectly(formValue: any): Promise<void> {
    const newWorkflow: CreateWorkflowDto = {
      dWorkflowId: formValue.dWorkflowId,
      name: formValue.name,
      description: formValue.description,
      priority: formValue.priority,
      assignedTo: formValue.assignedTo,
      dueDate: formValue.dueDate?.toISOString(),
      formConfigId: formValue.formConfigId,
    };

    this.loading = true;
    try {
      await firstValueFrom(this.workflowService.createWorkflow(newWorkflow));
      this.message.success('工作流创建成功');
      this.isCreateModalVisible = false;
      this.createForm.reset();
      this.selectedTemplateId = null;
      await this.loadWorkflows();
      this.loading = false;
    } catch (error: any) {
      console.error('创建工作流失败:', error);
      this.message.error(error.error?.message || '创建工作流失败，请稍后重试');
      this.loading = false;
    }
  }

  // 从模板创建工作流
  private async createFromTemplate(formValue: any): Promise<void> {
    const overrides: Partial<CreateWorkflowDto> = {
      dWorkflowId: formValue.dWorkflowId,
      name: formValue.name,
      description: formValue.description,
      priority: formValue.priority,
      assignedTo: formValue.assignedTo,
      dueDate: formValue.dueDate?.toISOString(),
    };

    // 如果用户手动选择了不同的表单配置，覆盖模板的配置
    if (formValue.formConfigId) {
      overrides.formConfigId = formValue.formConfigId;
    }

    this.loading = true;
    try {
      await firstValueFrom(
        this.workflowService.createFromTemplate(
          formValue.templateId,
          overrides,
        ),
      );
      this.message.success('从模板创建工作流成功');
      this.isCreateModalVisible = false;
      this.createForm.reset();
      this.selectedTemplateId = null;
      await this.loadWorkflows();
      this.loading = false;
    } catch (error: any) {
      console.error('从模板创建工作流失败:', error);
      this.message.error(
        error.error?.message || '从模板创建工作流失败，请稍后重试',
      );
      this.loading = false;
    }
  }

  handleCreateCancel(): void {
    this.isCreateModalVisible = false;
    this.selectedTemplateId = null;
  }

  // 编辑工作流
  async showEditModal(workflow: WorkFlow): Promise<void> {
    if (!(await this.hasPermission('workflow', 'update'))) {
      this.message.warning('您没有编辑工作流的权限');
      return;
    }
    this.selectedWorkflow = workflow;
    this.editForm.patchValue({
      name: workflow.name,
      description: workflow.description,
      priority: workflow.priority,
      assignedTo: workflow.assignedTo,
      dueDate: workflow.dueDate ? new Date(workflow.dueDate) : null,
    });
    this.isEditModalVisible = true;
  }

  async handleEditOk(): Promise<void> {
    if (this.editForm.valid && this.selectedWorkflow) {
      const formValue = this.editForm.value;
      const updateData: UpdateWorkflowDto = {
        name: formValue.name,
        description: formValue.description,
        priority: formValue.priority,
        assignedTo: formValue.assignedTo,
        dueDate: formValue.dueDate?.toISOString(),
      };

      this.loading = true;
      try {
        await firstValueFrom(
          this.workflowService.updateWorkflow(
            this.selectedWorkflow.id,
            updateData,
          ),
        );
        this.message.success('工作流更新成功');
        this.isEditModalVisible = false;
        this.selectedWorkflow = null;
        this.editForm.reset();
        await this.loadWorkflows();
        this.loading = false;
      } catch (error: any) {
        console.error('更新工作流失败:', error);
        this.message.error(
          error.error?.message || '更新工作流失败，请稍后重试',
        );
        this.loading = false;
      }
    }
  }

  handleEditCancel(): void {
    this.isEditModalVisible = false;
    this.selectedWorkflow = null;
  }

  // 修改状态
  async changeStatus(
    workflow: WorkFlow,
    newStatus: WorkflowStatus,
  ): Promise<void> {
    if (!(await this.hasPermission('workflow', 'change_status'))) {
      this.message.warning('您没有修改工作流状态的权限');
      return;
    }

    this.loading = true;
    try {
      const updatedWorkflow = await firstValueFrom(
        this.workflowService.changeWorkflowStatus(workflow.id, newStatus),
      );
      workflow.status = updatedWorkflow.status;
      this.updateStatistics();
      this.cdr.markForCheck();
      this.message.success('状态修改成功');
      this.loading = false;
    } catch (error: any) {
      console.error('修改状态失败:', error);
      this.message.error(error.error?.message || '修改状态失败，请稍后重试');
      this.loading = false;
    }
  }

  // 查看历史
  async showHistory(workflow: WorkFlow): Promise<void> {
    this.selectedWorkflow = workflow;
    this.isHistoryModalVisible = true;

    // 从 API 加载工作流历史
    try {
      this.workflowHistory = await firstValueFrom(
        this.workflowService.getWorkflowHistory(workflow.id),
      );
    } catch (error) {
      console.error('加载历史记录失败:', error);
      this.message.error('加载历史记录失败');
      this.workflowHistory = [];
    }
  }

  handleHistoryCancel(): void {
    this.isHistoryModalVisible = false;
    this.selectedWorkflow = null;
  }

  // 删除工作流
  async deleteWorkflow(id: number): Promise<void> {
    if (!(await this.hasPermission('workflow', 'delete'))) {
      this.message.warning('您没有删除工作流的权限');
      return;
    }

    this.loading = true;
    try {
      await firstValueFrom(this.workflowService.deleteWorkflow(id));
      this.message.success('工作流删除成功');
      await this.loadWorkflows();
    } catch (error: any) {
      console.error('删除工作流失败:', error);
      this.message.error(error.error?.message || '删除工作流失败，请稍后重试');
      this.loading = false;
    }
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
  async openDynamicForm(workflow: WorkFlow): Promise<void> {
    this.selectedWorkflow = workflow;
    this.currentFormData = undefined; // 清空之前的数据

    if (workflow.formConfigId) {
      try {
        // 加载表单配置
        const config = await firstValueFrom(
          this.dynamicFormService.getFormConfig(workflow.formConfigId),
        );
        this.currentFormConfig = config;

        // 尝试加载已保存的表单数据
        try {
          const savedData = await firstValueFrom(
            this.workflowService.getWorkflowFormData(workflow.id),
          );
          console.log('Loaded saved form data:', savedData);

          // 如果有保存的数据，将其设置为初始值
          if (savedData && savedData.formData) {
            this.currentFormData = savedData.formData;
            this.message.info('已加载之前保存的表单数据');
          }

          // 使用 setTimeout 避免 ExpressionChangedAfterItHasBeenCheckedError
          this.isDynamicFormModalVisible = true;
          this.cdr.markForCheck();
        } catch (error: any) {
          // 如果没有保存的数据（404），这是正常情况
          if (error.status === 404) {
            console.log('No saved form data found, showing empty form');
            this.currentFormData = undefined;
          } else {
            console.error('Error loading saved form data:', error);
            this.message.warning('无法加载已保存的表单数据，显示空白表单');
            this.currentFormData = undefined;
          }

          // 使用 setTimeout 避免 ExpressionChangedAfterItHasBeenCheckedError
          this.isDynamicFormModalVisible = true;
          this.cdr.markForCheck();
        }
      } catch (error) {
        console.error('Failed to load form config:', error);
        this.message.error('加载表单配置失败');
      }
    } else {
      this.message.warning('此工作流未关联动态表单');
    }
  }

  // 处理动态表单提交
  async handleFormSubmit(formData: any): Promise<void> {
    console.log('Form submitted with data:', formData);
    console.log('Selected workflow:', this.selectedWorkflow);

    if (!this.selectedWorkflow) {
      this.message.error('未选择工作流');
      return;
    }

    if (!this.selectedWorkflow.formConfigId) {
      this.message.error('工作流未关联表单配置');
      return;
    }

    // 显示加载提示
    const loadingMessage = this.message.loading('正在保存表单数据...', {
      nzDuration: 0,
    }).messageId;

    // 保存表单数据到数据库
    const saveData = {
      formConfigId: this.selectedWorkflow.formConfigId,
      formData: formData,
      // 如果需要记录提交人，可以从当前用户获取
      // submittedBy: this.currentUser?.id
    };

    console.log('Saving form data:', saveData);

    try {
      const result = await firstValueFrom(
        this.workflowService.saveWorkflowFormData(
          this.selectedWorkflow.id,
          saveData,
        ),
      );
      console.log('Form data saved successfully:', result);

      // 关闭加载提示
      this.message.remove(loadingMessage);

      // 显示成功消息
      this.message.success('表单数据保存成功！');

      // 使用 setTimeout 避免 ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        // 关闭表单模态框
        this.isDynamicFormModalVisible = false;
        this.currentFormConfig = null;
        this.currentFormData = undefined; // 清空表单数据

        // 刷新工作流列表以显示最新状态
        this.loadWorkflows();
      }, 0);
    } catch (error: any) {
      console.error('Failed to save form data:', error);

      // 关闭加载提示
      this.message.remove(loadingMessage);

      // 显示详细的错误信息
      const errorMessage = error.error?.message || error.message || '未知错误';
      this.message.error(`表单数据保存失败：${errorMessage}`);
    }
  }

  // 取消动态表单
  handleFormCancel(): void {
    this.isDynamicFormModalVisible = false;
    this.currentFormConfig = null;
    this.currentFormData = undefined; // 清空表单数据
  }

  // 打开表单构建器（仅管理员）
  async openFormBuilder(workflow?: WorkFlow): Promise<void> {
    if (!(await this.hasPermission('workflow', 'form_manage'))) {
      this.message.warning('您没有编辑动态表单的权限');
      return;
    }

    if (workflow && !workflow.formConfigId) {
      this.message.warning('此工作流尚未关联动态表单，无法编辑字段');
      return;
    }

    this.selectedWorkflow = workflow || null;
    this.isCreatingNewForm = false; // 不是创建模式
    this.isFormBuilderModalVisible = true;
  }

  // 创建新表单配置（在创建工作流时）
  async createNewFormConfig(): Promise<void> {
    if (!(await this.hasPermission('form', 'manage'))) {
      this.message.warning('您没有创建表单的权限');
      return;
    }

    // 打开表单构建器，创建新表单（仅创建模式）
    this.selectedWorkflow = null;
    this.isCreatingNewForm = true; // 设置为创建模式
    this.isFormBuilderModalVisible = true;
  }

  // 编辑选中的表单配置（在创建工作流时）
  async editFormConfigInCreate(): Promise<void> {
    if (!(await this.hasPermission('form', 'manage'))) {
      this.message.warning('您没有编辑表单的权限');
      return;
    }

    const formConfigId = this.createForm.get('formConfigId')?.value;
    if (!formConfigId) {
      this.message.warning('请先选择要编辑的表单');
      return;
    }

    // 创建临时工作流对象，用于传递给表单构建器
    this.selectedWorkflow = {
      id: 0,
      formConfigId: formConfigId,
    } as WorkFlow;
    this.isCreatingNewForm = false; // 不是创建模式，是编辑模式
    this.isFormBuilderModalVisible = true;
  }

  // 处理表单构建器关闭
  handleFormBuilderClose(): void {
    this.isFormBuilderModalVisible = false;
    this.isCreatingNewForm = false; // 重置创建模式标识
    // 如果是在创建工作流时新建的表单，自动选中
    // 这里可以根据实际需求调整逻辑
    this.selectedWorkflow = null;
  }

  // 根据用户ID获取用户名
  getUserName(userId: string | number | null | undefined): string {
    if (!userId) return '-';
    const user = this.users.find((u) => u.id === String(userId));
    return user ? user.fullName || user.username : String(userId);
  }
}
