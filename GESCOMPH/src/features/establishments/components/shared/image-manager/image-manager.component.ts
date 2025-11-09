import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FileDropDirective } from '../../../../../shared/directives/file-drop.directive';

@Component({
  standalone: true,
  selector: 'app-image-manager',
  imports: [
    CommonModule,
    MatIconModule,
    FileDropDirective
  ],
  templateUrl: './image-manager.component.html',
  styleUrls: ['./image-manager.component.css']
})
export class ImageManagerComponent {

  @Input() max = 5;
  @Input() existingImages: any[] = []; // ya llegan con filePath
  @Input() previews: string[] = [];   // urls temporales para nuevas

  @Output() filesAdded = new EventEmitter<File[]>();
  @Output() removeNew = new EventEmitter<number>();
  @Output() removeExisting = new EventEmitter<number>();

  onInputFiles(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files) return;
    this.filesAdded.emit(Array.from(input.files));
  }
}
