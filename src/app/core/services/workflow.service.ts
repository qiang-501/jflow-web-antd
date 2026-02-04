// workflow.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  WorkFlow,
  WorkflowStatus,
  WorkflowStatusHistory,
  CreateWorkflowDto,
  UpdateWorkflowDto,
} from '../../models/work-flow';

@Injectable({
  providedIn: 'root',
})
export class WorkflowService {
  private http = inject(HttpClient);
  private apiUrl = 'api/workflows';

  /**
   * 获取所有工作流列表
   */
  getWorkflows(params?: {
    page?: number;
    pageSize?: number;
    status?: WorkflowStatus;
    priority?: string;
  }): Observable<{ data: WorkFlow[]; total: number }> {
    return this.http.get<{ data: WorkFlow[]; total: number }>(this.apiUrl, {
      params: params as any,
    });
  }

  /**
   * 根据ID获取工作流详情
   */
  getWorkflowById(id: number): Observable<WorkFlow> {
    return this.http.get<WorkFlow>(`${this.apiUrl}/${id}`);
  }

  /**
   * 创建新工作流
   */
  createWorkflow(workflow: CreateWorkflowDto): Observable<WorkFlow> {
    return this.http.post<WorkFlow>(this.apiUrl, workflow);
  }

  /**
   * 更新工作流信息
   */
  updateWorkflow(
    id: number,
    workflow: UpdateWorkflowDto,
  ): Observable<WorkFlow> {
    return this.http.put<WorkFlow>(`${this.apiUrl}/${id}`, workflow);
  }

  /**
   * 删除工作流
   */
  deleteWorkflow(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * 修改工作流状态
   */
  changeWorkflowStatus(
    id: number,
    status: WorkflowStatus,
    comment?: string,
  ): Observable<WorkFlow> {
    return this.http.patch<WorkFlow>(`${this.apiUrl}/${id}/status`, {
      status,
      comment,
    });
  }

  /**
   * 获取工作流状态历史记录
   */
  getWorkflowHistory(id: number): Observable<WorkflowStatusHistory[]> {
    return this.http.get<WorkflowStatusHistory[]>(
      `${this.apiUrl}/${id}/history`,
    );
  }

  /**
   * 分配工作流给用户
   */
  assignWorkflow(id: number, assignee: string): Observable<WorkFlow> {
    return this.http.patch<WorkFlow>(`${this.apiUrl}/${id}/assign`, {
      assignee,
    });
  }

  /**
   * 获取我的工作流
   */
  getMyWorkflows(params?: {
    page?: number;
    pageSize?: number;
    status?: WorkflowStatus;
  }): Observable<{ data: WorkFlow[]; total: number }> {
    return this.http.get<{ data: WorkFlow[]; total: number }>(
      `${this.apiUrl}/my-workflows`,
      {
        params: params as any,
      },
    );
  }

  /**
   * 获取待办工作流
   */
  getPendingWorkflows(): Observable<WorkFlow[]> {
    return this.http.get<WorkFlow[]>(`${this.apiUrl}/pending`);
  }

  /**
   * 保存工作流表单数据
   */
  saveWorkflowFormData(
    workflowId: number,
    formData: {
      formConfigId: number;
      formData: Record<string, any>;
      submittedBy?: number;
    },
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/${workflowId}/form-data`, formData);
  }

  /**
   * 获取工作流表单数据
   */
  getWorkflowFormData(workflowId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${workflowId}/form-data`);
  }

  /**
   * 更新工作流表单数据
   */
  updateWorkflowFormData(
    workflowId: number,
    formData: {
      formConfigId?: number;
      formData?: Record<string, any>;
      submittedBy?: number;
    },
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${workflowId}/form-data`, formData);
  }

  /**
   * 删除工作流表单数据
   */
  deleteWorkflowFormData(workflowId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${workflowId}/form-data`);
  }

  /**
   * 从模板创建工作流
   */
  createFromTemplate(
    templateId: number,
    overrides: Partial<CreateWorkflowDto>,
  ): Observable<WorkFlow> {
    return this.http.post<WorkFlow>(
      `${this.apiUrl}/from-template/${templateId}`,
      overrides,
    );
  }
}
