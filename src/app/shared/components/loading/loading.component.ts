import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * 加载指示器组件
 * 用法: <app-loading [loading]="isLoading" [message]="'Loading data...'"></app-loading>
 */
@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container" *ngIf="loading">
      <div class="spinner"></div>
      <p *ngIf="message" class="loading-message">{{ message }}</p>
    </div>
  `,
  styles: [
    `
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
      }

      .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #1890ff;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .loading-message {
        margin-top: 1rem;
        color: #666;
        font-size: 14px;
      }
    `,
  ],
})
export class LoadingComponent {
  @Input() loading = false;
  @Input() message = '';
}
