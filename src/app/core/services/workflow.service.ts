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
  getWorkflowById(id: string): Observable<WorkFlow> {
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
    id: string,
    workflow: UpdateWorkflowDto,
  ): Observable<WorkFlow> {
    return this.http.put<WorkFlow>(`${this.apiUrl}/${id}`, workflow);
  }

  /**
   * 删除工作流
   */
  deleteWorkflow(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * 修改工作流状态
   */
  changeWorkflowStatus(
    id: string,
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
  getWorkflowHistory(id: string): Observable<WorkflowStatusHistory[]> {
    return this.http.get<WorkflowStatusHistory[]>(
      `${this.apiUrl}/${id}/history`,
    );
  }

  /**
   * 分配工作流给用户
   */
  assignWorkflow(id: string, assignee: string): Observable<WorkFlow> {
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
}
