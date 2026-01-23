import { Component, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTableModule } from 'ng-zorro-antd/table';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
interface Person {
  key: string;
  name: string;
  age: number;
  address: string;
}
@Component({
  selector: 'app-workflow',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzDividerModule,
    NzLayoutModule,
    NzStepsModule,
    NzTableModule,
  ],
  templateUrl: './workflow.component.html',
  styleUrl: './workflow.component.css',
})
export class WorkflowComponent {
  private fb = inject(NonNullableFormBuilder);
  validateForm = this.fb.group({
    name: this.fb.control('', [Validators.maxLength(50)]),
    title: this.fb.control('', [Validators.maxLength(50)]),
    remember: this.fb.control(true),
  });
  listOfData: Person[] = [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
    },
  ];
  submitForm(): void {
    console.log('submit', this.validateForm.value);
  }
}
