import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appDropZone]'
})
export class DropZoneDirective {

  @Output() dropped = new EventEmitter<FileList>();
  @Output() hovered = new EventEmitter<boolean>();

  constructor() { }

  @HostListener('drop', ['$event'])
  ondrop($event) {
    $event.preventDefault();
    this.dropped.emit($event.dataTransfer);
    this.hovered.emit(false);
  }

  @HostListener('dragover', ['$event'])
  onDragover($event) {
    $event.preventDefault();
    this.hovered.emit(true);
  }

  @HostListener('dragleave', ['$event'])
  onDragleave($event) {
    $event.preventDefault();
    this.hovered.emit(false);
  }


}
