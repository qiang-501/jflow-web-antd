import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * 确认对话框组件
 * 用法:
 * <app-confirm-dialog
 *   [visible]="showDialog"
 *   [title]="'Confirm Delete'"
 *   [message]="'Are you sure you want to delete this item?'"
 *   (confirm)="onConfirm()"
 *   (cancel)="onCancel()">
 * </app-confirm-dialog>
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-overlay" *ngIf="visible" (click)="onCancel()">
      <div class="dialog-container" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h3>{{ title }}</h3>
        </div>
        <div class="dialog-body">
          <p>{{ message }}</p>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-cancel" (click)="onCancel()">
            {{ cancelText }}
          </button>
          <button class="btn btn-confirm" (click)="onConfirm()">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .dialog-container {
        background: white;
        border-radius: 8px;
        min-width: 400px;
        max-width: 90%;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .dialog-header {
        padding: 16px 24px;
        border-bottom: 1px solid #f0f0f0;
      }

      .dialog-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .dialog-body {
        padding: 24px;
      }

      .dialog-footer {
        padding: 12px 16px;
        border-top: 1px solid #f0f0f0;
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      .btn {
        padding: 6px 16px;
        border-radius: 4px;
        border: 1px solid #d9d9d9;
        background: white;
        cursor: pointer;
        font-size: 14px;
      }

      .btn-cancel:hover {
        border-color: #40a9ff;
        color: #40a9ff;
      }

      .btn-confirm {
        background: #1890ff;
        color: white;
        border-color: #1890ff;
      }

      .btn-confirm:hover {
        background: #40a9ff;
        border-color: #40a9ff;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
