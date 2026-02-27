import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { WorkflowTemplateService } from '../../core/services/workflow-template.service';
import {
  WorkflowTemplate,
  CreateWorkflowTemplateDto,
  UpdateWorkflowTemplateDto,
} from '../../models/workflow-template.model';
import { WorkflowPriority } from '../../models/work-flow';

@Component({
  selector: 'app-workflow-template-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzTagModule,
    NzPopconfirmModule,
    NzSwitchModule,
    NzDividerModule,
    NzSpaceModule,
    NzIconModule,
  ],
  templateUrl: './workflow-template-management.component.html',
  styleUrls: ['./workflow-template-management.component.css'],
})
export class WorkflowTemplateManagementComponent implements OnInit {
  private templateService = inject(WorkflowTemplateService);
  private messageService = inject(NzMessageService);
  private modal = inject(NzModalService);

  templates: WorkflowTemplate[] = [];
  loading = false;
  total = 0;
  pageSize = 10;
  pageIndex = 1;

  isModalVisible = false;
  modalTitle = '创建工作流模板';
  isEditMode = false;
  currentTemplate: Partial<WorkflowTemplate> = {};

  priorityOptions = [
    { label: '低', value: WorkflowPriority.LOW },
    { label: '中', value: WorkflowPriority.MEDIUM },
    { label: '高', value: WorkflowPriority.HIGH },
    { label: '紧急', value: WorkflowPriority.URGENT },
  ];

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;
    this.templateService
      .getTemplates({
        page: this.pageIndex,
        limit: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          this.templates = response.data;
          this.total = response.total;
          this.loading = false;
        },
        error: (error) => {
          this.messageService.error('加载模板列表失败');
          this.loading = false;
          console.error('Load templates error:', error);
        },
      });
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.loadTemplates();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1;
    this.loadTemplates();
  }

  showCreateModal(): void {
    this.isEditMode = false;
    this.modalTitle = '创建工作流模板';
    this.currentTemplate = {
      active: true,
      defaultPriority: WorkflowPriority.MEDIUM,
    };
    this.isModalVisible = true;
  }

  showEditModal(template: WorkflowTemplate): void {
    this.isEditMode = true;
    this.modalTitle = '编辑工作流模板';
    this.currentTemplate = { ...template };
    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.currentTemplate = {};
  }

  handleOk(): void {
    if (!this.currentTemplate.name || !this.currentTemplate.code) {
      this.messageService.warning('请填写必填项');
      return;
    }

    if (this.isEditMode && this.currentTemplate.id) {
      this.updateTemplate();
    } else {
      this.createTemplate();
    }
  }

  createTemplate(): void {
    const dto: CreateWorkflowTemplateDto = {
      code: this.currentTemplate.code!,
      name: this.currentTemplate.name!,
      description: this.currentTemplate.description,
      category: this.currentTemplate.category,
      defaultPriority:
        this.currentTemplate.defaultPriority || WorkflowPriority.MEDIUM,
      active: this.currentTemplate.active !== false,
    };

    this.templateService.createTemplate(dto).subscribe({
      next: () => {
        this.messageService.success('创建成功');
        this.isModalVisible = false;
        this.loadTemplates();
      },
      error: (error) => {
        this.messageService.error('创建失败');
        console.error('Create template error:', error);
      },
    });
  }

  updateTemplate(): void {
    const id = this.currentTemplate.id!;
    const dto: UpdateWorkflowTemplateDto = {
      name: this.currentTemplate.name,
      description: this.currentTemplate.description,
      category: this.currentTemplate.category,
      defaultPriority: this.currentTemplate.defaultPriority,
      active: this.currentTemplate.active,
    };

    this.templateService.updateTemplate(id, dto).subscribe({
      next: () => {
        this.messageService.success('更新成功');
        this.isModalVisible = false;
        this.loadTemplates();
      },
      error: (error) => {
        this.messageService.error('更新失败');
        console.error('Update template error:', error);
      },
    });
  }

  deleteTemplate(id: number): void {
    this.templateService.deleteTemplate(id).subscribe({
      next: () => {
        this.messageService.success('删除成功');
        this.loadTemplates();
      },
      error: (error) => {
        this.messageService.error('删除失败');
        console.error('Delete template error:', error);
      },
    });
  }

  toggleActive(template: WorkflowTemplate): void {
    const dto: UpdateWorkflowTemplateDto = {
      active: !template.active,
    };

    this.templateService.updateTemplate(template.id, dto).subscribe({
      next: () => {
        template.active = !template.active;
        this.messageService.success('状态更新成功');
      },
      error: (error) => {
        this.messageService.error('状态更新失败');
        console.error('Toggle active error:', error);
      },
    });
  }

  getPriorityColor(priority: string): string {
    const colorMap: Record<string, string> = {
      low: 'default',
      medium: 'processing',
      high: 'warning',
      urgent: 'error',
    };
    return colorMap[priority] || 'default';
  }

  getPriorityText(priority: string): string {
    const textMap: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '紧急',
    };
    return textMap[priority] || priority;
  }
}
