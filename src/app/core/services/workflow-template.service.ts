import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  WorkflowTemplate,
  CreateWorkflowTemplateDto,
  UpdateWorkflowTemplateDto,
} from '../../models/workflow-template.model';

@Injectable({
  providedIn: 'root',
})
export class WorkflowTemplateService {
  private http = inject(HttpClient);
  private apiUrl = 'api/workflow-templates';

  /**
   * 获取所有工作流模板
   */
  getTemplates(params?: {
    page?: number;
    limit?: number;
    category?: string;
    active?: boolean;
  }): Observable<{ data: WorkflowTemplate[]; total: number }> {
    return this.http.get<{ data: WorkflowTemplate[]; total: number }>(
      this.apiUrl,
      {
        params: params as any,
      },
    );
  }

  /**
   * 根据ID获取模板详情
   */
  getTemplateById(id: number): Observable<WorkflowTemplate> {
    return this.http.get<WorkflowTemplate>(`${this.apiUrl}/${id}`);
  }

  /**
   * 创建新模板
   */
  createTemplate(
    template: CreateWorkflowTemplateDto,
  ): Observable<WorkflowTemplate> {
    return this.http.post<WorkflowTemplate>(this.apiUrl, template);
  }

  /**
   * 更新模板
   */
  updateTemplate(
    id: number,
    template: UpdateWorkflowTemplateDto,
  ): Observable<WorkflowTemplate> {
    return this.http.put<WorkflowTemplate>(`${this.apiUrl}/${id}`, template);
  }

  /**
   * 删除模板
   */
  deleteTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * 根据分类获取模板
   */
  getTemplatesByCategory(category: string): Observable<WorkflowTemplate[]> {
    return this.http.get<WorkflowTemplate[]>(
      `${this.apiUrl}/category/${category}`,
    );
  }

  /**
   * 获取所有活跃的模板
   */
  getActiveTemplates(): Observable<WorkflowTemplate[]> {
    return this.http.get<WorkflowTemplate[]>(`${this.apiUrl}/active`);
  }
}
